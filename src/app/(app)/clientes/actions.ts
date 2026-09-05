"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, isStaff } from "@/lib/supabase/auth";
import { checarLimiteClientes } from "@/lib/pmoc/limites";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";

const num = (v: FormDataEntryValue | null) =>
  v === null || v === "" ? null : Number(v);
const str = (v: FormDataEntryValue | null) =>
  v === null || v === "" ? null : String(v);

function payload(f: FormData) {
  return {
    razao_social: String(f.get("razao_social")),
    nome_fantasia: str(f.get("nome_fantasia")),
    cnpj: str(f.get("cnpj")),
    endereco: str(f.get("endereco")),
    numero: str(f.get("numero")),
    bairro: str(f.get("bairro")),
    cidade: str(f.get("cidade")),
    uf: str(f.get("uf")),
    cep: str(f.get("cep")),
    contato_nome: str(f.get("contato_nome")),
    contato_email: str(f.get("contato_email")),
    contato_fone: str(f.get("contato_fone")),
    area_climatizada_m2: num(f.get("area_climatizada_m2")),
    populacao_fixa: num(f.get("populacao_fixa")),
    populacao_flutuante: num(f.get("populacao_flutuante")),
  };
}

export async function criarCliente(f: FormData) {
  const { supabase, user, profile } = await requireUser();
  if (!isStaff(profile.role)) throw new Error("Sem permissão");
  await checarLimiteClientes(supabase, profile.org_id);

  const dados = payload(f);
  const { data, error } = await supabase
    .from("clients")
    .insert({ ...dados, org_id: profile.org_id })
    .select("id")
    .single();
  if (error) throw error;

  await logAudit(supabase, profile.org_id, user, {
    acao: "criou",
    entidade: "cliente",
    entidadeId: data.id,
    descricao: dados.razao_social,
  });

  revalidatePath("/clientes");
  redirect(`/clientes/${data.id}`);
}

export async function atualizarCliente(id: string, f: FormData) {
  const { supabase, profile } = await requireUser();
  if (!isStaff(profile.role)) throw new Error("Sem permissão");

  const { error } = await supabase.from("clients").update(payload(f)).eq("id", id);
  if (error) throw error;
  revalidatePath(`/clientes/${id}`);
}

// ---------- Soft delete / lixeira ----------
export async function excluirCliente(id: string) {
  const { supabase, user, profile } = await requireUser();
  if (!isStaff(profile.role)) throw new Error("Sem permissão");

  const { data: c } = await supabase
    .from("clients")
    .select("razao_social")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("clients")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  await logAudit(supabase, profile.org_id, user, {
    acao: "excluiu",
    entidade: "cliente",
    entidadeId: id,
    descricao: c?.razao_social,
  });

  revalidatePath("/clientes");
  redirect("/clientes");
}

// A RLS esconde os apagados até do dono; a lixeira usa service role,
// escopada ao org de quem chamou.
export async function listarClientesExcluidos() {
  const { profile } = await requireUser();
  const { data } = await supabaseAdmin()
    .from("clients")
    .select("id, razao_social, deleted_at")
    .eq("org_id", profile.org_id)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });
  return data ?? [];
}

export async function restaurarCliente(id: string) {
  const { supabase, user, profile } = await requireUser();
  if (!isStaff(profile.role)) throw new Error("Sem permissão");

  const admin = supabaseAdmin();
  const { data: c } = await admin
    .from("clients")
    .select("id, org_id, razao_social")
    .eq("id", id)
    .single();
  if (!c || c.org_id !== profile.org_id) throw new Error("Cliente não encontrado");

  await admin.from("clients").update({ deleted_at: null }).eq("id", id);
  await logAudit(supabase, profile.org_id, user, {
    acao: "restaurou",
    entidade: "cliente",
    entidadeId: id,
    descricao: c.razao_social,
  });
  revalidatePath("/clientes");
}
