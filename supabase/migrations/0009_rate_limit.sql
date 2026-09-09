-- Rate limiting simples via Postgres (funciona em serverless multi-instância).
-- Janela fixa por bucket; o servidor chama bump_rate_limit() a cada request.

create table if not exists rate_limits (
  bucket       text not null,
  window_start timestamptz not null,
  count        integer not null default 0,
  primary key (bucket, window_start)
);
create index if not exists rate_limits_gc_idx on rate_limits(window_start);

alter table rate_limits enable row level security;
-- sem policy: só o service role (servidor) toca aqui.

-- incrementa e devolve a contagem da janela atual, de forma atômica
create or replace function bump_rate_limit(p_bucket text, p_window timestamptz)
returns integer
language plpgsql security definer set search_path = public as $$
declare c integer;
begin
  insert into rate_limits (bucket, window_start, count)
  values (p_bucket, p_window, 1)
  on conflict (bucket, window_start)
  do update set count = rate_limits.count + 1
  returning count into c;

  -- limpeza barata: some com janelas velhas de vez em quando
  if random() < 0.01 then
    delete from rate_limits where window_start < now() - interval '1 hour';
  end if;

  return c;
end $$;
