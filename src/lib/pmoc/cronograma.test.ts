import { test } from "node:test";
import assert from "node:assert/strict";
import { mesesPrevistos, cronogramaEquipamento } from "./cronograma.ts";
import { proximaData } from "./catalogo.ts";

test("mesesPrevistos por periodicidade", () => {
  assert.deepEqual(mesesPrevistos("mensal"), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.deepEqual(mesesPrevistos("bimestral"), [1, 3, 5, 7, 9, 11]);
  assert.deepEqual(mesesPrevistos("trimestral"), [1, 4, 7, 10]);
  assert.deepEqual(mesesPrevistos("semestral"), [1, 7]);
  assert.deepEqual(mesesPrevistos("anual"), [1]);
  assert.deepEqual(mesesPrevistos("eventual"), []);
});

test("mesesPrevistos respeita o mês de início", () => {
  assert.deepEqual(mesesPrevistos("trimestral", 3), [3, 6, 9, 12]);
  assert.deepEqual(mesesPrevistos("semestral", 11), [11, 5]);
});

test("cronogramaEquipamento monta a matriz de 12 meses", () => {
  const cron = cronogramaEquipamento(
    [
      { atividade: "Limpar filtros", periodicidade: "mensal" },
      { atividade: "Verificar pressões", periodicidade: "trimestral" },
      { atividade: "Higienização", periodicidade: "anual" },
      { atividade: "Troca de filtro", periodicidade: "eventual" },
    ],
    1,
  );
  assert.equal(cron[0].meses.filter(Boolean).length, 12);
  assert.equal(cron[1].meses.filter(Boolean).length, 4);
  assert.ok(cron[1].meses[0] && cron[1].meses[3] && cron[1].meses[6] && cron[1].meses[9]);
  assert.equal(cron[2].meses.filter(Boolean).length, 1);
  assert.equal(cron[3].meses.filter(Boolean).length, 0);
});

test("proximaData avança pela periodicidade", () => {
  const base = new Date("2026-01-15");
  assert.equal(proximaData(base, "mensal")?.toISOString().slice(0, 7), "2026-02");
  assert.equal(proximaData(base, "trimestral")?.toISOString().slice(0, 7), "2026-04");
  assert.equal(proximaData(base, "anual")?.toISOString().slice(0, 7), "2027-01");
  assert.equal(proximaData(base, "eventual"), null);
});
