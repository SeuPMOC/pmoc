// Prova que a RLS isola os dados entre organizações.
// Cria 2 contas descartáveis, uma cria um cliente, a outra tenta enxergar/mexer.
//
//   node --experimental-strip-types scripts/test-rls.mjs
//
// Lê .env.local (URL + anon + service_role). Roda contra o projeto Supabase de
// verdade (use um de staging). Limpa os usuários criados no fim.

import { readFileSync } from "node:fs";
import assert from "node:assert";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const stamp = Date.now();
const emailA = `rls-a-${stamp}@example.com`;
const emailB = `rls-b-${stamp}@example.com`;
const senha = "senha-teste-123";
let idA, idB;

async function novoUsuario(email, orgName) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { org_name: orgName, full_name: orgName },
  });
  if (error) throw error;
  return data.user.id;
}

async function comoUsuario(email) {
  const c = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: senha });
  if (error) throw error;
  return c;
}

try {
  idA = await novoUsuario(emailA, "Org A (teste RLS)");
  idB = await novoUsuario(emailB, "Org B (teste RLS)");
  // o trigger handle_new_user pode levar um instante
  await new Promise((r) => setTimeout(r, 1500));

  const a = await comoUsuario(emailA);
  const b = await comoUsuario(emailB);

  const { data: cliente, error: e1 } = await a
    .from("clients")
    .insert({ razao_social: "Cliente secreto da Org A" })
    .select("id, org_id")
    .single();
  assert.ok(!e1 && cliente, `A deveria criar cliente: ${e1?.message}`);

  // B lista clientes -> não pode ver o da A
  const { data: listaB } = await b.from("clients").select("id");
  assert.equal(
    (listaB ?? []).some((c) => c.id === cliente.id),
    false,
    "FALHA: B enxergou o cliente da A na listagem",
  );

  // B tenta buscar pelo id direto
  const { data: getB } = await b.from("clients").select("*").eq("id", cliente.id);
  assert.equal((getB ?? []).length, 0, "FALHA: B buscou o cliente da A pelo id");

  // B tenta alterar
  const { data: updB } = await b
    .from("clients")
    .update({ razao_social: "invadido" })
    .eq("id", cliente.id)
    .select("id");
  assert.equal((updB ?? []).length, 0, "FALHA: B alterou o cliente da A");

  // B tenta ler o audit log da A
  const { data: auditB } = await b
    .from("audit_logs")
    .select("id")
    .eq("org_id", cliente.org_id);
  assert.equal((auditB ?? []).length, 0, "FALHA: B leu o audit_logs da A");

  console.log("RLS OK — Org B não vê, não busca, não altera dados da Org A");
} finally {
  if (idA) await admin.auth.admin.deleteUser(idA);
  if (idB) await admin.auth.admin.deleteUser(idB);
  console.log("usuários de teste removidos");
}
