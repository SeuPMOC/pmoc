-- Endurecimento barato: soft delete + log de auditoria.

-- ===========================================================================
-- 1. Soft delete em clients / units / equipment
--    Adiciona deleted_at e recria as policies pra esconder linhas apagadas.
--    Nenhuma query da app muda — a RLS filtra sozinha.
-- ===========================================================================
alter table clients   add column if not exists deleted_at timestamptz;
alter table units     add column if not exists deleted_at timestamptz;
alter table equipment add column if not exists deleted_at timestamptz;
create index if not exists clients_ativos_idx   on clients(org_id)  where deleted_at is null;
create index if not exists equipment_ativos_idx on equipment(client_id) where deleted_at is null;

drop policy if exists clients_rw on clients;
create policy clients_rw on clients for all
  using (
    org_id = current_org_id()
    and deleted_at is null
    and (current_role_name() in ('owner','tech') or id = current_client_id())
  )
  with check (org_id = current_org_id());

drop policy if exists units_rw on units;
create policy units_rw on units for all
  using (exists (select 1 from clients c where c.id = units.client_id
        and c.org_id = current_org_id() and c.deleted_at is null
        and (current_role_name() in ('owner','tech') or c.id = current_client_id()))
        and units.deleted_at is null)
  with check (exists (select 1 from clients c where c.id = units.client_id and c.org_id = current_org_id()));

drop policy if exists equipment_rw on equipment;
create policy equipment_rw on equipment for all
  using (exists (select 1 from clients c where c.id = equipment.client_id
        and c.org_id = current_org_id() and c.deleted_at is null
        and (current_role_name() in ('owner','tech') or c.id = current_client_id()))
        and equipment.deleted_at is null)
  with check (exists (select 1 from clients c where c.id = equipment.client_id and c.org_id = current_org_id()));

drop policy if exists plan_items_rw on maintenance_plan_items;
create policy plan_items_rw on maintenance_plan_items for all
  using (exists (select 1 from equipment e join clients c on c.id = e.client_id
        where e.id = maintenance_plan_items.equipment_id and c.org_id = current_org_id()
        and c.deleted_at is null and e.deleted_at is null
        and (current_role_name() in ('owner','tech') or c.id = current_client_id())))
  with check (exists (select 1 from equipment e join clients c on c.id = e.client_id
        where e.id = maintenance_plan_items.equipment_id and c.org_id = current_org_id()));

drop policy if exists orders_rw on maintenance_orders;
create policy orders_rw on maintenance_orders for all
  using (org_id = current_org_id()
        and not exists (select 1 from clients c where c.id = maintenance_orders.client_id and c.deleted_at is not null)
        and (current_role_name() in ('owner','tech') or client_id = current_client_id()))
  with check (org_id = current_org_id());

drop policy if exists air_rw on air_quality_readings;
create policy air_rw on air_quality_readings for all
  using (exists (select 1 from clients c where c.id = air_quality_readings.client_id
        and c.org_id = current_org_id() and c.deleted_at is null
        and (current_role_name() in ('owner','tech') or c.id = current_client_id())))
  with check (exists (select 1 from clients c where c.id = air_quality_readings.client_id and c.org_id = current_org_id()));

drop policy if exists pmoc_rw on pmoc_documents;
create policy pmoc_rw on pmoc_documents for all
  using (org_id = current_org_id()
        and not exists (select 1 from clients c where c.id = pmoc_documents.client_id and c.deleted_at is not null)
        and (current_role_name() in ('owner','tech') or client_id = current_client_id()))
  with check (org_id = current_org_id());

-- ===========================================================================
-- 2. Log de auditoria (append-only)
-- ===========================================================================
create table audit_logs (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  actor_id    uuid references auth.users(id) on delete set null,
  actor_email text,
  acao        text not null,       -- criou | atualizou | excluiu | restaurou | emitiu | anexou
  entidade    text not null,       -- cliente | equipamento | pmoc | art | execução
  entidade_id uuid,
  descricao   text,
  created_at  timestamptz not null default now()
);
create index on audit_logs(org_id, created_at desc);

alter table audit_logs enable row level security;
create policy audit_read on audit_logs for select
  using (org_id = current_org_id());
create policy audit_insert on audit_logs for insert
  with check (org_id = current_org_id());
-- sem policy de update/delete: ninguém edita o log
