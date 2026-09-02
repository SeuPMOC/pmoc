-- PMOC SaaS — schema inicial
-- Hierarquia: organization (prestador PMOC) -> client (estabelecimento) -> equipment
-- Multi-tenant por org_id via RLS. Cliente final = profile role='client' ligado a um client.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role       as enum ('owner', 'tech', 'client');
create type periodicidade    as enum ('mensal','bimestral','trimestral','semestral','anual','eventual');
create type equip_tipo       as enum ('split','multi_split','self_contained','fancoil','chiller','vrf_vrv','janela','cassete','piso_teto','cortina_ar','exaustor','ventilador','uta','outro');
create type equip_status     as enum ('ativo','inativo','substituido');
create type os_tipo          as enum ('preventiva','corretiva','preditiva');
create type os_status        as enum ('agendada','em_execucao','concluida','atrasada','cancelada');
create type pmoc_status      as enum ('rascunho','emitido','assinado');
create type invoice_status   as enum ('pendente','pago','vencido','cancelado');

-- ---------------------------------------------------------------------------
-- Tenants + usuários
-- ---------------------------------------------------------------------------
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  cnpj        text,
  telefone    text,
  email       text,
  logo_url    text,
  created_at  timestamptz not null default now()
);

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  org_id      uuid not null references organizations(id) on delete cascade,
  role        user_role not null default 'tech',
  full_name   text,
  email       text,
  client_id   uuid,               -- preenchido só quando role='client'
  created_at  timestamptz not null default now()
);
create index on profiles(org_id);

-- ---------------------------------------------------------------------------
-- Responsáveis técnicos
-- ---------------------------------------------------------------------------
create table technicians (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references organizations(id) on delete cascade,
  nome           text not null,
  formacao       text,
  conselho       text,            -- CREA / CFT / CRQ ...
  numero_registro text,
  art_numero     text,
  art_url        text,
  assinatura_url text,
  created_at     timestamptz not null default now()
);
create index on technicians(org_id);

-- ---------------------------------------------------------------------------
-- Clientes / estabelecimentos
-- ---------------------------------------------------------------------------
create table clients (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references organizations(id) on delete cascade,
  razao_social       text not null,
  nome_fantasia      text,
  cnpj               text,
  endereco           text,
  numero             text,
  complemento        text,
  bairro             text,
  cidade             text,
  uf                 text,
  cep                text,
  contato_nome       text,
  contato_email      text,
  contato_fone       text,
  area_climatizada_m2 numeric,
  populacao_fixa     integer,
  populacao_flutuante integer,
  created_at         timestamptz not null default now()
);
create index on clients(org_id);
alter table profiles add constraint profiles_client_fk
  foreign key (client_id) references clients(id) on delete set null;

create table units (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id) on delete cascade,
  nome        text not null,
  area_m2     numeric,
  ocupacao    integer,
  finalidade  text,
  created_at  timestamptz not null default now()
);
create index on units(client_id);

-- ---------------------------------------------------------------------------
-- Inventário de equipamentos AVAC
-- ---------------------------------------------------------------------------
create table equipment (
  id                    uuid primary key default gen_random_uuid(),
  client_id             uuid not null references clients(id) on delete cascade,
  unit_id               uuid references units(id) on delete set null,
  tag                   text not null,
  tipo                  equip_tipo not null default 'split',
  marca                 text,
  modelo                text,
  numero_serie          text,
  capacidade_btu        integer,
  capacidade_tr         numeric,
  ano_fabricacao        integer,
  fluido_refrigerante   text,
  vazao_ar_exterior_m3h numeric,
  localizacao           text,
  ambientes_atendidos   text,
  data_instalacao       date,
  status                equip_status not null default 'ativo',
  created_at            timestamptz not null default now(),
  unique (client_id, tag)
);
create index on equipment(client_id);

-- Plano de manutenção: atividades + periodicidade por equipamento
create table maintenance_plan_items (
  id              uuid primary key default gen_random_uuid(),
  equipment_id    uuid not null references equipment(id) on delete cascade,
  atividade       text not null,
  periodicidade   periodicidade not null,
  norma_ref       text,
  responsavel     text,           -- 'Técnico' | 'Operador'
  created_at      timestamptz not null default now()
);
create index on maintenance_plan_items(equipment_id);

-- ---------------------------------------------------------------------------
-- Ordens de serviço / registro de execução
-- ---------------------------------------------------------------------------
create table maintenance_orders (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references organizations(id) on delete cascade,
  client_id          uuid not null references clients(id) on delete cascade,
  equipment_id       uuid references equipment(id) on delete set null,
  plan_item_id       uuid references maintenance_plan_items(id) on delete set null,
  technician_id      uuid references technicians(id) on delete set null,
  tipo               os_tipo not null default 'preventiva',
  status             os_status not null default 'agendada',
  data_prevista      date,
  data_execucao      date,
  descricao_servico  text,
  ocorrencias        text,
  pecas_substituidas text,
  recomendacoes      text,
  assinatura_cliente_url text,
  created_at         timestamptz not null default now()
);
create index on maintenance_orders(org_id);
create index on maintenance_orders(client_id, status);
create index on maintenance_orders(data_prevista);

create table execution_photos (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references maintenance_orders(id) on delete cascade,
  url        text not null,
  legenda    text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Parâmetros de qualidade do ar (RE 09/2003 ANVISA)
-- ---------------------------------------------------------------------------
create table air_quality_readings (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid not null references clients(id) on delete cascade,
  unit_id           uuid references units(id) on delete set null,
  data_medicao      date not null,
  temperatura_c     numeric,
  umidade_rel       numeric,
  co2_ppm           numeric,
  velocidade_ar_ms  numeric,
  contagem_fungica_ufc numeric,
  aerodispersoides  numeric,
  dentro_padrao     boolean,
  observacoes       text,
  created_at        timestamptz not null default now()
);
create index on air_quality_readings(client_id);

-- ---------------------------------------------------------------------------
-- Documento PMOC emitido (snapshot imutável dos dados)
-- ---------------------------------------------------------------------------
create table pmoc_documents (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references organizations(id) on delete cascade,
  client_id      uuid not null references clients(id) on delete cascade,
  technician_id  uuid references technicians(id) on delete set null,
  versao         integer not null default 1,
  periodo_inicio date,
  periodo_fim    date,
  status         pmoc_status not null default 'rascunho',
  pdf_url        text,
  dados_json     jsonb,           -- snapshot completo p/ reimpressão
  emitido_em     timestamptz,
  created_at     timestamptz not null default now()
);
create index on pmoc_documents(org_id);
create index on pmoc_documents(client_id);

-- ---------------------------------------------------------------------------
-- Cobrança (org -> client)
-- ---------------------------------------------------------------------------
create table invoices (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references organizations(id) on delete cascade,
  client_id      uuid not null references clients(id) on delete cascade,
  numero         text,
  descricao      text,
  competencia    text,            -- 'YYYY-MM'
  valor          numeric not null,
  vencimento     date not null,
  status         invoice_status not null default 'pendente',
  link_pagamento text,
  pago_em        date,
  created_at     timestamptz not null default now()
);
create index on invoices(org_id, status);
create index on invoices(vencimento);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
-- helper: org do usuário logado
create or replace function current_org_id() returns uuid
language sql stable security definer set search_path = public as $$
  select org_id from profiles where id = auth.uid()
$$;

create or replace function current_role_name() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function current_client_id() returns uuid
language sql stable security definer set search_path = public as $$
  select client_id from profiles where id = auth.uid()
$$;

alter table organizations          enable row level security;
alter table profiles               enable row level security;
alter table technicians            enable row level security;
alter table clients                enable row level security;
alter table units                  enable row level security;
alter table equipment              enable row level security;
alter table maintenance_plan_items enable row level security;
alter table maintenance_orders     enable row level security;
alter table execution_photos       enable row level security;
alter table air_quality_readings   enable row level security;
alter table pmoc_documents         enable row level security;
alter table invoices               enable row level security;

-- organizations: membro vê a própria
create policy org_member_read on organizations for select
  using (id = current_org_id());
create policy org_owner_write on organizations for update
  using (id = current_org_id() and current_role_name() = 'owner');

-- profiles: vê os do mesmo org; edita a si mesmo; owner gerencia
create policy profiles_read on profiles for select using (org_id = current_org_id());
create policy profiles_self on profiles for update using (id = auth.uid());
create policy profiles_owner on profiles for all
  using (org_id = current_org_id() and current_role_name() = 'owner')
  with check (org_id = current_org_id());

-- Macro p/ tabelas com org_id direto
-- (tech/owner: tudo do org; client: só o próprio client_id)
create policy tech_all_technicians on technicians for all
  using (org_id = current_org_id() and current_role_name() in ('owner','tech'))
  with check (org_id = current_org_id());

create policy clients_rw on clients for all
  using (
    org_id = current_org_id()
    and (current_role_name() in ('owner','tech') or id = current_client_id())
  )
  with check (org_id = current_org_id());

-- Tabelas ligadas a client_id (sem org_id): checa via clients
create policy units_rw on units for all
  using (exists (select 1 from clients c where c.id = units.client_id
        and c.org_id = current_org_id()
        and (current_role_name() in ('owner','tech') or c.id = current_client_id())))
  with check (exists (select 1 from clients c where c.id = units.client_id and c.org_id = current_org_id()));

create policy equipment_rw on equipment for all
  using (exists (select 1 from clients c where c.id = equipment.client_id
        and c.org_id = current_org_id()
        and (current_role_name() in ('owner','tech') or c.id = current_client_id())))
  with check (exists (select 1 from clients c where c.id = equipment.client_id and c.org_id = current_org_id()));

create policy plan_items_rw on maintenance_plan_items for all
  using (exists (select 1 from equipment e join clients c on c.id = e.client_id
        where e.id = maintenance_plan_items.equipment_id and c.org_id = current_org_id()
        and (current_role_name() in ('owner','tech') or c.id = current_client_id())))
  with check (exists (select 1 from equipment e join clients c on c.id = e.client_id
        where e.id = maintenance_plan_items.equipment_id and c.org_id = current_org_id()));

create policy orders_rw on maintenance_orders for all
  using (org_id = current_org_id()
        and (current_role_name() in ('owner','tech') or client_id = current_client_id()))
  with check (org_id = current_org_id());

create policy photos_rw on execution_photos for all
  using (exists (select 1 from maintenance_orders o where o.id = execution_photos.order_id
        and o.org_id = current_org_id()
        and (current_role_name() in ('owner','tech') or o.client_id = current_client_id())))
  with check (exists (select 1 from maintenance_orders o where o.id = execution_photos.order_id and o.org_id = current_org_id()));

create policy air_rw on air_quality_readings for all
  using (exists (select 1 from clients c where c.id = air_quality_readings.client_id
        and c.org_id = current_org_id()
        and (current_role_name() in ('owner','tech') or c.id = current_client_id())))
  with check (exists (select 1 from clients c where c.id = air_quality_readings.client_id and c.org_id = current_org_id()));

create policy pmoc_rw on pmoc_documents for all
  using (org_id = current_org_id()
        and (current_role_name() in ('owner','tech') or client_id = current_client_id()))
  with check (org_id = current_org_id());

-- Cobrança: tech/owner gerencia; cliente só lê a própria
create policy invoices_staff on invoices for all
  using (org_id = current_org_id() and current_role_name() in ('owner','tech'))
  with check (org_id = current_org_id());
create policy invoices_client_read on invoices for select
  using (org_id = current_org_id() and client_id = current_client_id());

-- ---------------------------------------------------------------------------
-- Trigger: cria org + profile no primeiro signup
-- ---------------------------------------------------------------------------
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare new_org uuid;
begin
  -- metadata.org_name definido no signup; se ausente, cria org genérica
  insert into organizations (name)
  values (coalesce(new.raw_user_meta_data->>'org_name', 'Minha Empresa'))
  returning id into new_org;

  insert into profiles (id, org_id, role, full_name, email)
  values (new.id, new_org, 'owner',
          new.raw_user_meta_data->>'full_name', new.email);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
