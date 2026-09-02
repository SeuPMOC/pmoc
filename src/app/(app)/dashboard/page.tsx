import { supabaseServer } from "@/lib/supabase/server";

const hoje = new Date().toISOString().slice(0, 10);

function Card({ titulo, valor, sub }: { titulo: string; valor: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm text-neutral-500">{titulo}</div>
      <div className="mt-1 text-2xl font-bold">{valor}</div>
      {sub && <div className="text-xs text-neutral-400">{sub}</div>}
    </div>
  );
}

export default async function Dashboard() {
  const supabase = await supabaseServer();

  const [clientes, osAtrasadas, osAgendadas, faturasVencidas, pmocs] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase
      .from("maintenance_orders")
      .select("id", { count: "exact", head: true })
      .lt("data_prevista", hoje)
      .in("status", ["agendada", "atrasada"]),
    supabase
      .from("maintenance_orders")
      .select("id", { count: "exact", head: true })
      .gte("data_prevista", hoje)
      .eq("status", "agendada"),
    supabase
      .from("invoices")
      .select("valor")
      .lt("vencimento", hoje)
      .eq("status", "pendente"),
    supabase
      .from("pmoc_documents")
      .select("id, versao, emitido_em, clients(razao_social)")
      .order("emitido_em", { ascending: false })
      .limit(10),
  ]);

  const totalVencido =
    faturasVencidas.data?.reduce((s, f) => s + Number(f.valor), 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Visão geral</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card titulo="Clientes" valor={clientes.count ?? 0} />
        <Card
          titulo="Manutenções atrasadas"
          valor={osAtrasadas.count ?? 0}
          sub="vencidas e não concluídas"
        />
        <Card titulo="Agendadas" valor={osAgendadas.count ?? 0} sub="próximas" />
        <Card
          titulo="Cobrança vencida"
          valor={totalVencido.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          sub={`${faturasVencidas.data?.length ?? 0} faturas`}
        />
      </div>

      <section>
        <h2 className="mb-2 font-semibold">PMOCs emitidos recentemente</h2>
        <div className="rounded-lg border">
          {(pmocs.data ?? []).length === 0 ? (
            <p className="p-4 text-sm text-neutral-500">Nenhum PMOC emitido ainda.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left text-neutral-500">
                <tr>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Versão</th>
                  <th className="p-3">Emitido em</th>
                  <th className="p-3">PDF</th>
                </tr>
              </thead>
              <tbody>
                {pmocs.data!.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    {/* @ts-expect-error relação aninhada */}
                    <td className="p-3">{p.clients?.razao_social}</td>
                    <td className="p-3">v{p.versao}</td>
                    <td className="p-3">
                      {p.emitido_em
                        ? new Date(p.emitido_em).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td className="p-3">
                      <a
                        className="text-blue-600 underline"
                        href={`/api/pmoc/${p.id}/pdf`}
                        target="_blank"
                      >
                        abrir
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
