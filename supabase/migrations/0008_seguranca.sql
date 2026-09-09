-- Correções de segurança pré-comercialização.

-- ===========================================================================
-- 1. profiles: bloquear escalonamento de privilégio / troca de tenant
--    A policy profiles_self (0001) deixa o próprio usuário fazer UPDATE no seu
--    registro sem restringir colunas. Sem isto, um autenticado pode chamar a
--    API do Supabase direto e rodar:
--        update profiles set org_id = '<org da vítima>' where id = auth.uid()
--    passando a enxergar TODOS os dados daquela organização.
--    Trigger preserva as colunas de identidade para qualquer update que não
--    venha do service role (usado só no servidor, em ações controladas).
-- ===========================================================================
create or replace function protect_profile_identity() returns trigger
language plpgsql as $$
begin
  if auth.role() is distinct from 'service_role' then
    new.id        := old.id;
    new.org_id    := old.org_id;
    new.role      := old.role;
    new.client_id := old.client_id;
  end if;
  return new;
end $$;

drop trigger if exists profiles_protect_identity on profiles;
create trigger profiles_protect_identity
  before update on profiles
  for each row execute function protect_profile_identity();

-- ===========================================================================
-- 2. audit_logs: só o service role escreve
--    A app grava o log via supabaseAdmin(); sem tirar a policy de insert,
--    um usuário poderia forjar entradas (inclusive actor_email de outra pessoa)
--    no log da própria organização.
-- ===========================================================================
drop policy if exists audit_insert on audit_logs;
-- audit_read (0007) continua: membro lê o log do próprio org.

-- ===========================================================================
-- 3. Limites de tamanho em campos livres controlados pelo usuário
-- ===========================================================================
alter table organizations drop constraint if exists org_name_len;
alter table organizations add  constraint org_name_len check (char_length(name) <= 200);

alter table profiles drop constraint if exists profile_name_len;
alter table profiles add  constraint profile_name_len
  check (full_name is null or char_length(full_name) <= 200);

-- signup: trunca nome da empresa / da pessoa vindos do metadata do usuário
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  inv  client_portal_invites%rowtype;
  new_org uuid;
begin
  if new.raw_user_meta_data ? 'invite_token' then
    select * into inv
      from client_portal_invites
     where token = (new.raw_user_meta_data->>'invite_token')::uuid
       and aceito_em is null;
    if found then
      insert into profiles (id, org_id, role, full_name, email, client_id)
      values (new.id, inv.org_id, 'client',
              left(coalesce(new.raw_user_meta_data->>'full_name',''), 200),
              new.email, inv.client_id);
      update client_portal_invites set aceito_em = now() where token = inv.token;
      return new;
    end if;
  end if;

  insert into organizations (name)
  values (left(coalesce(new.raw_user_meta_data->>'org_name', 'Minha Empresa'), 200))
  returning id into new_org;

  insert into profiles (id, org_id, role, full_name, email)
  values (new.id, new_org, 'owner',
          left(coalesce(new.raw_user_meta_data->>'full_name',''), 200), new.email);
  return new;
end $$;
