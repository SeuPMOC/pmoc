"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isStaff } from "@/lib/supabase/auth";

const str = (v: FormDataEntryValue | null) =>
  v === null || v === "" ? null : String(v);

export async function criarFatura(f: FormData) {
  const { supabase, profile } = await requireUser();
  if (!isStaff(profile.role)) throw new Error("Sem permissão");

  const { error } = await supabase.from("invoices").insert({
    org_id: profile.org_id,
    client_id: String(f.get("client_id")),
    numero: str(f.get("numero")),
    descricao: str(f.get("descricao")),
    competencia: str(f.get("competencia")),
    valor: Number(f.get("valor")),
    vencimento: String(f.get("vencimento")),
    link_pagamento: str(f.get("link_pagamento")),
  });
  if (error) throw error;
  revalidatePath("/cobranca");
}

export async function marcarPago(id: string) {
  const { supabase, profile } = await requireUser();
  if (!isStaff(profile.role)) throw new Error("Sem permissão");
  await supabase
    .from("invoices")
    .update({ status: "pago", pago_em: new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  revalidatePath("/cobranca");
}

export async function cancelarFatura(id: string) {
  const { supabase, profile } = await requireUser();
  if (!isStaff(profile.role)) throw new Error("Sem permissão");
  await supabase.from("invoices").update({ status: "cancelado" }).eq("id", id);
  revalidatePath("/cobranca");
}
