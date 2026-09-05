import type { SupabaseClient } from "@supabase/supabase-js";

// Barra a criação de mais clientes/equipamentos do que o plano permite.
// Lança erro (a action propaga pro form) — null no limite = ilimitado.
export async function checarLimiteClientes(supabase: SupabaseClient, orgId: string) {
  const { data: org } = await supabase
    .from("organizations")
    .select("max_clientes")
    .eq("id", orgId)
    .single();
  if (org?.max_clientes == null) return;

  const { count } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId);
  if ((count ?? 0) >= org.max_clientes) {
    throw new Error(
      `Limite do plano atingido: ${org.max_clientes} cliente(s). Fale com o suporte para fazer upgrade.`,
    );
  }
}

export async function checarLimiteEquipamentos(supabase: SupabaseClient, orgId: string) {
  const { data: org } = await supabase
    .from("organizations")
    .select("max_equipamentos")
    .eq("id", orgId)
    .single();
  if (org?.max_equipamentos == null) return;

  const { count } = await supabase
    .from("equipment")
    .select("id, clients!inner(org_id)", { count: "exact", head: true })
    .eq("clients.org_id", orgId);
  if ((count ?? 0) >= org.max_equipamentos) {
    throw new Error(
      `Limite do plano atingido: ${org.max_equipamentos} equipamento(s). Fale com o suporte para fazer upgrade.`,
    );
  }
}
