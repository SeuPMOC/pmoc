-- Portal do cliente final: o estabelecimento preenche os próprios dados.
-- Fluxo: staff gera um convite -> cliente acessa o link, cria senha,
-- o trigger liga o novo usuário à org + client certos com role='client'.

create table client_portal_invites (
  token       uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  client_id   uuid not null references clients(id) on delete cascade,
  email       text not null,
  criado_por  uuid references auth.users(id) on delete set null,
  criado_em   timestamptz not null default now(),
  aceito_em   timestamptz
);
create index on client_portal_invites(org_id);
create index on client_portal_invites(client_id);

alter table client_portal_invites enable row level security;

-- staff da org gerencia os convites
create policy invites_staff on client_portal_invites for all
  using (org_id = current_org_id() and current_role_name() in ('owner','tech'))
  with check (org_id = current_org_id());

-- ---------------------------------------------------------------------------
-- Trigger de signup: reconhece convite de portal
-- ---------------------------------------------------------------------------
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
              new.raw_user_meta_data->>'full_name', new.email, inv.client_id);
      update client_portal_invites set aceito_em = now() where token = inv.token;
      return new;
    end if;
  end if;

  -- fluxo padrão: primeiro usuário vira owner de uma org nova
  insert into organizations (name)
  values (coalesce(new.raw_user_meta_data->>'org_name', 'Minha Empresa'))
  returning id into new_org;

  insert into profiles (id, org_id, role, full_name, email)
  values (new.id, new_org, 'owner',
          new.raw_user_meta_data->>'full_name', new.email);
  return new;
end $$;
