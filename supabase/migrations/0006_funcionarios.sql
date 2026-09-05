-- Funcionários (equipe de campo) da empresa prestadora, distintos dos
-- "responsáveis técnicos" (technicians = CREA/CFT, usados no PMOC/ART).
-- Servem pra apontar quem executou cada manutenção.

create table employees (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  nome       text not null,
  cargo      text,        -- 'Técnico de refrigeração', 'Auxiliar'...
  telefone   text,
  email      text,
  ativo      boolean not null default true,
  created_at timestamptz not null default now()
);
create index on employees(org_id);

alter table employees enable row level security;
create policy employees_staff on employees for all
  using (org_id = current_org_id() and current_role_name() in ('owner','tech'))
  with check (org_id = current_org_id());

-- cada OS passa a poder registrar o funcionário que executou, além do
-- responsável técnico (technician_id) que já existia
alter table maintenance_orders
  add column if not exists employee_id uuid references employees(id) on delete set null;
