"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PLANOS, type PlanoKey } from "@/lib/admin/planos";

const str = (v: FormDataEntryValue | null) =>
  v === null || v === "" ? null : String(v);

export async function atualizarAssinatura(orgId: string, f: FormData) {
  await requirePlatformAdmin();
  const plano = String(f.get("plano")) as PlanoKey;
  const status = String(f.get("assinatura_status"));
  const limites = PLANOS[plano];

  const { error } = await supabaseAdmin()
    .from("organizations")
    .update({
      plano,
      assinatura_status: status,
      max_clientes: limites?.max_clientes ?? null,
      max_equipamentos: limites?.max_equipamentos ?? null,
    })
    .eq("id", orgId);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath(`/admin/${orgId}`);
}

export async function registrarMensalidade(orgId: string, f: FormData) {
  await requirePlatformAdmin();
  const { error } = await supabaseAdmin().from("subscription_payments").insert({
    org_id: orgId,
    competencia: String(f.get("competencia")),
    valor: Number(f.get("valor")),
    vencimento: String(f.get("vencimento")),
    status: "pendente",
    observacao: str(f.get("observacao")),
  });
  if (error) throw error;
  revalidatePath(`/admin/${orgId}`);
}

export async function marcarMensalidadePaga(orgId: string, paymentId: string) {
  await requirePlatformAdmin();
  const { error } = await supabaseAdmin()
    .from("subscription_payments")
    .update({ status: "pago", pago_em: new Date().toISOString().slice(0, 10) })
    .eq("id", paymentId);
  if (error) throw error;
  revalidatePath(`/admin/${orgId}`);
  revalidatePath("/admin");
}

export async function marcarMensalidadeAtrasada(orgId: string, paymentId: string) {
  await requirePlatformAdmin();
  const { error } = await supabaseAdmin()
    .from("subscription_payments")
    .update({ status: "atrasado" })
    .eq("id", paymentId);
  if (error) throw error;
  revalidatePath(`/admin/${orgId}`);
  revalidatePath("/admin");
}
