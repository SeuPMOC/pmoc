-- ART (Anotação de Responsabilidade Técnica) por PMOC emitido.
-- Cada emissão tem sua própria ART: número + arquivo PDF anexado.

alter table pmoc_documents
  add column if not exists art_numero        text,
  add column if not exists art_path          text,   -- caminho no bucket 'art'
  add column if not exists art_registrada_em date;

-- bucket privado para os PDFs de ART (acesso via service role no servidor)
insert into storage.buckets (id, name, public)
values ('art', 'art', false)
on conflict (id) do nothing;

-- ponytail: sem policies em storage.objects — upload/download passam pelo
-- service role nas rotas do servidor. Adicionar policies se algum dia o
-- browser precisar acessar o arquivo direto.
