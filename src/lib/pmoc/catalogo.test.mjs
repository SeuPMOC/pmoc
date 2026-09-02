// Sanidade do catálogo:
//   node --experimental-strip-types src/lib/pmoc/catalogo.test.mjs
import assert from "node:assert";
import { EQUIP_TIPOS, PLANO_POR_TIPO, planoPadraoParaTipo, CATEGORIAS } from "./catalogo.ts";

// toda categoria usada existe na lista oficial
for (const t of EQUIP_TIPOS) {
  assert.ok(CATEGORIAS.includes(t.group), `categoria inválida: ${t.group}`);
}

// todo aplicaA aponta para um tipo existente
const valid = new Set(EQUIP_TIPOS.map((t) => t.value));
for (const a of PLANO_POR_TIPO) {
  for (const k of a.aplicaA ?? []) {
    assert.ok(valid.has(k), `aplicaA aponta p/ tipo inexistente: ${k}`);
  }
}

// todo tipo (menos 'outro') gera pelo menos 1 atividade
for (const t of EQUIP_TIPOS) {
  if (t.value === "outro") continue;
  const plano = planoPadraoParaTipo(t.value);
  assert.ok(plano.length > 0, `sem plano para: ${t.value}`);
}

// DX herda o plano da Portaria; bomba não
assert.ok(planoPadraoParaTipo("split_hi_wall").some((a) => a.norma_ref.includes("3.523")));
assert.ok(!planoPadraoParaTipo("bomba_agua_gelada").some((a) => a.norma_ref.includes("3.523")));

console.log("catalogo OK —", EQUIP_TIPOS.length, "tipos,", PLANO_POR_TIPO.length, "atividades específicas");
