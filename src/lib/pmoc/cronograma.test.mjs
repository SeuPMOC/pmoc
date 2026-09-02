// node --experimental-strip-types src/lib/pmoc/cronograma.test.mjs
import assert from "node:assert";
import { mesesPrevistos, cronogramaEquipamento } from "./cronograma.ts";

assert.deepEqual(mesesPrevistos("mensal"), [1,2,3,4,5,6,7,8,9,10,11,12]);
assert.deepEqual(mesesPrevistos("trimestral"), [1,4,7,10]);
assert.deepEqual(mesesPrevistos("semestral"), [1,7]);
assert.deepEqual(mesesPrevistos("anual"), [1]);
assert.deepEqual(mesesPrevistos("bimestral"), [1,3,5,7,9,11]);
assert.deepEqual(mesesPrevistos("eventual"), []);
// início em março
assert.deepEqual(mesesPrevistos("trimestral", 3), [3,6,9,12]);
assert.deepEqual(mesesPrevistos("semestral", 11), [11,5]);

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

console.log("cronograma OK");
