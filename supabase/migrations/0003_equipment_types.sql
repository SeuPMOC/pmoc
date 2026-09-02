-- Ampliação da lista de tipos de equipamento (inclui QDG, bombas, torres,
-- automação, gerador etc.). O enum vira TEXT — a lista canônica passa a viver
-- em src/lib/pmoc/catalogo.ts, evitando migração a cada novo tipo.

alter table equipment alter column tipo type text using tipo::text;
alter table equipment alter column tipo set default 'split_hi_wall';
drop type if exists equip_tipo;

-- periodicidade ganha 'semanal' (torre de resfriamento, caldeira, gerador)
alter type periodicidade add value if not exists 'semanal' before 'mensal';
