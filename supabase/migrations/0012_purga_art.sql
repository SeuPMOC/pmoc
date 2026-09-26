-- 0012 — A purga da lixeira também apaga PDFs de ART órfãos (art_files não tem FK
-- para pmoc_documents; ficavam para trás quando o cliente era excluído).
create or replace function purge_lixeira() returns void
language sql security definer set search_path = public as $$
  delete from clients   where deleted_at < now() - interval '90 days';
  delete from units     where deleted_at < now() - interval '90 days';
  delete from equipment where deleted_at < now() - interval '90 days';
  delete from art_files a
   where not exists (select 1 from pmoc_documents d where d.art_path = a.path);
$$;
revoke all on function purge_lixeira() from public, anon, authenticated;
