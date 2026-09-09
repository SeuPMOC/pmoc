"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/supabase/auth";
import { str } from "@/lib/form";

export async function criarFatura(f: FormData) {
  const { supabase, profile } = await requireStaff();

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
  const { supabase } = await requireStaff();
  await supabase
    .from("invoices")
    .update({ status: "pago", pago_em: new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  revalidatePath("/cobranca");
}

export async function cancelarFatura(id: string) {
  const { supabase } = await requireStaff();
  await supabase.from("invoices").update({ status: "cancelado" }).eq("id", id);
  revalidatePath("/cobranca");
}
