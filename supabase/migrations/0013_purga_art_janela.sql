-- 0013 — A purga ignora ART gravada na última hora: anexarArt grava o PDF antes
-- de gravar pmoc_documents.art_path, e a limpeza noturna não pode cair no meio.
create or replace function purge_lixeira() returns void
language sql security definer set search_path = public as $$
  delete from clients   where deleted_at < now() - interval '90 days';
  delete from units     where deleted_at < now() - interval '90 days';
  delete from equipment where deleted_at < now() - interval '90 days';
  delete from art_files a
   where a.updated_at < now() - interval '1 hour'
     and not exists (select 1 from pmoc_documents d where d.art_path = a.path);
$$;
revoke all on function purge_lixeira() from public, anon, authenticated;
