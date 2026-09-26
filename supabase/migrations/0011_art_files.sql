-- 0011 — PDFs de ART no próprio banco (substitui o bucket 'art' do Supabase
-- Storage no ambiente auto-hospedado; entra no backup junto com os dados).
-- Mesma regra do bucket: RLS ligado e sem policy = só o service role acessa.

create table if not exists art_files (
  path        text primary key,          -- '<org_id>/<pmoc_id>.pdf' (= pmoc_documents.art_path)
  org_id      uuid not null references organizations(id) on delete cascade,
  content_b64 text not null,
  updated_at  timestamptz not null default now()
);
create index if not exists art_files_org_idx on art_files(org_id);

alter table art_files enable row level security;
