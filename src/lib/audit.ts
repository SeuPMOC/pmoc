import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

type Entrada = {
  acao: "criou" | "atualizou" | "excluiu" | "restaurou" | "emitiu" | "anexou";
  entidade: "cliente" | "equipamento" | "pmoc" | "art" | "execução";
  entidadeId?: string | null;
  descricao?: string;
};

// Registra a ação no audit_logs. Falha de log nunca derruba a ação real.
export async function logAudit(
  supabase: SupabaseClient,
  orgId: string,
  user: Pick<User, "id" | "email">,
  e: Entrada,
) {
  try {
    await supabase.from("audit_logs").insert({
      org_id: orgId,
      actor_id: user.id,
      actor_email: user.email ?? null,
      acao: e.acao,
      entidade: e.entidade,
      entidade_id: e.entidadeId ?? null,
      descricao: e.descricao ?? null,
    });
  } catch {
    // silencioso de propósito
  }
}
