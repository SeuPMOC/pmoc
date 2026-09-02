import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/auth";
import { PageHeader, Panel, Field, Submit, Crumb } from "@/components/ui";
import { cronogramaEquipamento, MESES_ABREV } from "@/lib/pmoc/cronograma";
import { gerarOrdensDoAno } from "../actions";

export default async function CronogramaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ inicio?: string }>;
}) {
  const { id } = await params;
  const { inicio } = await searchParams;
  const { supabase } = await requireUser();

  const { data: c } = await supabase
    .from("clients")
    .select("razao_social")
    .eq("id", id)
    .single();
  if (!c) notFound();

  const inicioISO = inicio ?? `${new Date().getFullYear()}-01-01`;
  const mesInicio = new Date(inicioISO).getMonth() + 1;

  const [{ data: equipamentos }, { data: orders }] = await Promise.all([
    supabase
      .from("equipment")
      .select("id, tag, tipo, localizacao, status, maintenance_plan_items(id, atividade, periodicidade, norma_ref, responsavel)")
      .eq("client_id", id)
      .eq("status", "ativo")
      .order("tag"),
    supabase
      .from("maintenance_orders")
      .select("plan_item_id, data_prevista, status")
      .eq("client_id", id)
      .not("plan_item_id", "is", null),
  ]);

  // status por atividade+mês: chave = atividade|mes  (plan_item_id não vem no join acima)
  // usamos data_prevista -> mês
  const statusPorMes = new Map<string, string>();
  for (const o of orders ?? []) {
    if (!o.data_prevista) continue;
    const m = Number(o.data_prevista.slice(5, 7));
    statusPorMes.set(`${o.plan_item_id}|${m}`, o.status);
  }

  return (
    <div className="flex flex-col gap-6">
      <Crumb href={`/clientes/${id}`}>← {c.razao_social}</Crumb>
      <PageHeader title="Cronograma anual de execução" />

      <Panel title="Período do plano">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <Field label="Início do plano" name="inicio" type="date" defaultValue={inicioISO} />
          <Submit>Aplicar</Submit>
        </form>
        <form action={gerarOrdensDoAno.bind(null, id)} className="mt-4">
          <input type="hidden" name="inicio" value={inicioISO} />
          <button className="rounded border border-black px-4 py-2 text-sm hover:bg-neutral-50">
            Gerar ordens de serviço dos 12 meses
          </button>
          <p className="mt-1 text-xs text-neutral-500">
            Cria as OS agendadas de cada atividade nos meses previstos (não duplica as já geradas).
          </p>
        </form>
      </Panel>

      {!equipamentos?.length && (
        <Panel>
          <p className="text-sm text-neutral-500">Nenhum equipamento ativo.</p>
        </Panel>
      )}

      {(equipamentos ?? []).map((e) => {
        const linhas = cronogramaEquipamento(e.maintenance_plan_items ?? [], mesInicio);
        return (
          <Panel key={e.id} title={`${e.tag} — ${e.tipo}${e.localizacao ? ` · ${e.localizacao}` : ""}`}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-100 text-left">
                    <th className="border p-1.5">Atividade</th>
                    <th className="border p-1.5 whitespace-nowrap">Periodic.</th>
                    <th className="border p-1.5">Resp.</th>
                    {MESES_ABREV.map((m) => (
                      <th key={m} className="border p-1.5 text-center w-8">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((l, j) => {
                    const planItem = (e.maintenance_plan_items ?? [])[j] as { id: string };
                    return (
                      <tr key={j}>
                        <td className="border p-1.5">
                          {l.atividade}
                          {l.norma_ref && (
                            <span className="block text-[10px] text-neutral-400">{l.norma_ref}</span>
                          )}
                        </td>
                        <td className="border p-1.5 whitespace-nowrap">{l.periodicidade}</td>
                        <td className="border p-1.5">{l.responsavel ?? "-"}</td>
                        {l.meses.map((prev, k) => {
                          const st = statusPorMes.get(`${planItem?.id}|${k + 1}`);
                          return (
                            <td key={k} className="border p-1 text-center">
                              {!prev ? (
                                ""
                              ) : st === "concluida" ? (
                                <span className="text-green-600">✓</span>
                              ) : st === "atrasada" ? (
                                <span className="text-red-600">●</span>
                              ) : (
                                <span className="text-neutral-500">●</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        );
      })}

      <p className="text-xs text-neutral-500">
        ● previsto · <span className="text-green-600">✓</span> executado ·{" "}
        <span className="text-red-600">●</span> atrasado. O PDF do PMOC traz este
        cronograma em página paisagem para impressão e coleta de assinatura.
      </p>
    </div>
  );
}
