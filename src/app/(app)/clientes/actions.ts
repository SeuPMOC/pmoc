"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, isStaff } from "@/lib/supabase/auth";

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
  const { supabase, profile } = await requireUser();
  if (!isStaff(profile.role)) throw new Error("Sem permissão");

  const { data, error } = await supabase
    .from("clients")
    .insert({ ...payload(f), org_id: profile.org_id })
    .select("id")
    .single();
  if (error) throw error;

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
