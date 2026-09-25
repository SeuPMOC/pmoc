-- 0010 — Exclusão definitiva automática: itens na lixeira há mais de 90 dias.
-- Compromisso da Política de Privacidade. Filhos de clients caem por ON DELETE CASCADE.

create extension if not exists pg_cron;

create or replace function purge_lixeira() returns void
language sql security definer set search_path = public as $$
  delete from clients   where deleted_at < now() - interval '90 days';
  delete from units     where deleted_at < now() - interval '90 days';
  delete from equipment where deleted_at < now() - interval '90 days';
$$;

revoke all on function purge_lixeira() from public, anon, authenticated;

select cron.unschedule('purga-lixeira') where exists (select 1 from cron.job where jobname = 'purga-lixeira');
select cron.schedule('purga-lixeira', '0 3 * * *', 'select public.purge_lixeira()');
