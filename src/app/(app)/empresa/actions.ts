"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isStaff } from "@/lib/supabase/auth";

const str = (v: FormDataEntryValue | null) =>
  v === null || v === "" ? null : String(v);

async function staff() {
  const ctx = await requireUser();
  if (!isStaff(ctx.profile.role)) throw new Error("Sem permissão");
  return ctx;
}

export async function salvarEmpresa(f: FormData) {
  const { supabase, profile } = await staff();
  const { error } = await supabase
    .from("organizations")
    .update({
      name: String(f.get("name")),
      cnpj: str(f.get("cnpj")),
      telefone: str(f.get("telefone")),
      email: str(f.get("email")),
    })
    .eq("id", profile.org_id);
  if (error) throw error;
  revalidatePath("/empresa");
}

export async function criarTecnico(f: FormData) {
  const { supabase, profile } = await staff();
  const { error } = await supabase.from("technicians").insert({
    org_id: profile.org_id,
    nome: String(f.get("nome")),
    formacao: str(f.get("formacao")),
    conselho: str(f.get("conselho")),
    numero_registro: str(f.get("numero_registro")),
    art_numero: str(f.get("art_numero")),
  });
  if (error) throw error;
  revalidatePath("/empresa");
}

export async function excluirTecnico(techId: string) {
  const { supabase } = await staff();
  const { error } = await supabase.from("technicians").delete().eq("id", techId);
  if (error) throw error;
  revalidatePath("/empresa");
}
