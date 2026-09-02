import type { SupabaseClient } from "@supabase/supabase-js";

export interface ChecklistItem {
  chave: string;
  label: string;
  ok: boolean;
  detalhe?: string;
}

// O que precisa estar preenchido para emitir um PMOC válido.
export async function checklistPmoc(
  supabase: SupabaseClient,
  clientId: string,
): Promise<{ itens: ChecklistItem[]; pronto: boolean }> {
  const [{ data: c }, { data: units }, { data: equip }, { data: tec }] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", clientId).single(),
      supabase.from("units").select("id").eq("client_id", clientId),
      supabase
        .from("equipment")
        .select("id, tag, status, maintenance_plan_items(id)")
        .eq("client_id", clientId),
      supabase
        .from("technicians")
        .select("id")
        .limit(1),
    ]);

  const ativos = (equip ?? []).filter((e) => e.status === "ativo");
  const semPlano = ativos.filter((e) => (e.maintenance_plan_items?.length ?? 0) === 0);

  const cad =
    !!c?.razao_social &&
    !!c?.cnpj &&
    !!c?.endereco &&
    !!c?.cidade &&
    c?.area_climatizada_m2 != null &&
    c?.populacao_fixa != null;

  const itens: ChecklistItem[] = [
    {
      chave: "cadastro",
      label: "Dados do estabelecimento completos",
      ok: cad,
      detalhe: cad
        ? undefined
        : "Faltam CNPJ, endereço, cidade, área climatizada ou população fixa.",
    },
    {
      chave: "ambientes",
      label: "Ao menos um ambiente climatizado",
      ok: (units?.length ?? 0) > 0,
    },
    {
      chave: "equipamentos",
      label: "Ao menos um equipamento ativo no inventário",
      ok: ativos.length > 0,
      detalhe: ativos.length ? `${ativos.length} equipamento(s) ativo(s)` : undefined,
    },
    {
      chave: "planos",
      label: "Todo equipamento ativo tem plano de manutenção",
      ok: ativos.length > 0 && semPlano.length === 0,
      detalhe: semPlano.length
        ? `Sem plano: ${semPlano.map((e) => e.tag).join(", ")}`
        : undefined,
    },
    {
      chave: "tecnico",
      label: "Responsável técnico cadastrado",
      ok: (tec?.length ?? 0) > 0,
    },
  ];

  return { itens, pronto: itens.every((i) => i.ok) };
}
