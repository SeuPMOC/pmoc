import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EQUIP_TIPOS,
  PLANO_POR_TIPO,
  planoPadraoParaTipo,
  CATEGORIAS,
} from "./catalogo.ts";

test("toda categoria de tipo existe na lista oficial", () => {
  for (const t of EQUIP_TIPOS) {
    assert.ok(
      (CATEGORIAS as readonly string[]).includes(t.group),
      `categoria inválida: ${t.group}`,
    );
  }
});

test("todo aplicaA aponta para um tipo existente", () => {
  const valid = new Set(EQUIP_TIPOS.map((t) => t.value));
  for (const a of PLANO_POR_TIPO) {
    for (const k of a.aplicaA ?? []) {
      assert.ok(valid.has(k), `aplicaA aponta p/ tipo inexistente: ${k}`);
    }
  }
});

test("todo tipo (menos 'outro') gera pelo menos 1 atividade", () => {
  for (const t of EQUIP_TIPOS) {
    if (t.value === "outro") continue;
    assert.ok(planoPadraoParaTipo(t.value).length > 0, `sem plano para: ${t.value}`);
  }
});

test("DX herda o plano da Portaria; bomba não", () => {
  assert.ok(
    planoPadraoParaTipo("split_hi_wall").some((a) => a.norma_ref.includes("3.523")),
  );
  assert.ok(
    !planoPadraoParaTipo("bomba_agua_gelada").some((a) => a.norma_ref.includes("3.523")),
  );
});
