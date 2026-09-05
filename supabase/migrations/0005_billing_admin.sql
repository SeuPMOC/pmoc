-- Assinatura do SaaS (você cobrando as empresas que usam o SeuPMOC) e limites
-- de plano. Separado de `invoices`, que é a empresa cobrando os clientes DELA.

-- limites do plano 'gratis' (ver src/lib/admin/planos.ts) como default de coluna,
-- assim todo signup novo já nasce no free tier sem precisar tocar no trigger de auth.
alter table organizations
  add column if not exists plano              text not null default 'gratis',
  add column if not exists max_clientes       integer default 1,   -- null = ilimitado
  add column if not exists max_equipamentos   integer default 15,  -- null = ilimitado
  add column if not exists assinatura_status  text not null default 'trial', -- trial|ativa|atrasada|cancelada
  add column if not exists trial_termina_em   date default (current_date + 10);

create table if not exists subscription_payments (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  competencia text not null,      -- 'YYYY-MM'
  valor       numeric not null,
  vencimento  date not null,
  status      text not null default 'pendente', -- pendente|pago|atrasado|cancelado
  pago_em     date,
  observacao  text,
  created_at  timestamptz not null default now()
);
create index if not exists subscription_payments_org_idx on subscription_payments(org_id);

-- Dados do negócio do SaaS: sem policy nenhuma (RLS ligado = ninguém acessa via
-- browser). Só a área /admin, usando o service role, lê e escreve aqui.
alter table subscription_payments enable row level security;

-- organizations já tem policy de UPDATE pro próprio owner (nome/cnpj/etc. em
-- /empresa). Sem isso, o owner também conseguiria alterar seu próprio plano/
-- status de assinatura chamando a API do Supabase direto. Trava as colunas de
-- billing pra só o service role (usado em /admin) poder mudá-las.
create or replace function protect_billing_columns() returns trigger
language plpgsql as $$
begin
  if auth.role() <> 'service_role' then
    new.plano             := old.plano;
    new.max_clientes      := old.max_clientes;
    new.max_equipamentos  := old.max_equipamentos;
    new.assinatura_status := old.assinatura_status;
    new.trial_termina_em  := old.trial_termina_em;
  end if;
  return new;
end $$;

drop trigger if exists organizations_protect_billing on organizations;
create trigger organizations_protect_billing
  before update on organizations
  for each row execute function protect_billing_columns();
