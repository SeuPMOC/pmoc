-- 0010 — Exclusão definitiva automática: itens na lixeira há mais de 90 dias.
-- Compromisso da Política de Privacidade. Filhos de clients caem por ON DELETE CASCADE.

create or replace function purge_lixeira() returns void
language sql security definer set search_path = public as $$
  delete from clients   where deleted_at < now() - interval '90 days';
  delete from units     where deleted_at < now() - interval '90 days';
  delete from equipment where deleted_at < now() - interval '90 days';
$$;

revoke all on function purge_lixeira() from public, anon, authenticated;

-- Agenda via pg_cron quando disponível (Supabase). No Postgres auto-hospedado
-- sem pg_cron, o cron do host chama `select purge_lixeira()` diariamente.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.unschedule('purga-lixeira') where exists (select 1 from cron.job where jobname = 'purga-lixeira');
    perform cron.schedule('purga-lixeira', '0 3 * * *', 'select public.purge_lixeira()');
  end if;
end $$;
