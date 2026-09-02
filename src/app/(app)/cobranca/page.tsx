import { requireUser } from "@/lib/supabase/auth";
import { PageHeader, Panel, Field, Submit } from "@/components/ui";
import { criarFatura, marcarPago, cancelarFatura } from "./actions";

const hoje = new Date().toISOString().slice(0, 10);
const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default async function CobrancaPage() {
  const { supabase } = await requireUser();

  const [{ data: clientes }, { data: faturas }] = await Promise.all([
    supabase.from("clients").select("id, razao_social").order("razao_social"),
    supabase
      .from("invoices")
      .select("*, clients(razao_social)")
      .order("vencimento", { ascending: false }),
  ]);

  const clientOpts = (clientes ?? []).map((c) => ({
    value: c.id,
    label: c.razao_social,
  }));

  const situacao = (f: { status: string; vencimento: string }) =>
    f.status === "pendente" && f.vencimento < hoje ? "vencido" : f.status;

  const aberto = (faturas ?? [])
    .filter((f) => f.status === "pendente")
    .reduce((s, f) => s + Number(f.valor), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Cobrança" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-neutral-500">Em aberto</div>
          <div className="mt-1 text-2xl font-bold">{brl(aberto)}</div>
        </div>
      </div>

      <Panel title="Nova fatura">
        <form action={criarFatura} className="grid gap-3 md:grid-cols-3">
          <Field label="Cliente" name="client_id" as="select" options={clientOpts} required />
          <Field label="Nº" name="numero" />
          <Field label="Competência" name="competencia" placeholder="2026-08" />
          <Field label="Descrição" name="descricao" placeholder="Manutenção mensal PMOC" />
          <Field label="Valor (R$)" name="valor" type="number" step="0.01" required />
          <Field label="Vencimento" name="vencimento" type="date" required />
          <Field label="Link de pagamento" name="link_pagamento" placeholder="Pix / boleto / checkout" />
          <div className="md:col-span-3"><Submit>Criar fatura</Submit></div>
        </form>
      </Panel>

      <Panel title={`${faturas?.length ?? 0} fatura(s)`}>
        {!faturas?.length ? (
          <p className="text-sm text-neutral-500">Nenhuma fatura.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-left text-neutral-500">
              <tr>
                <th className="p-2">Cliente</th>
                <th className="p-2">Descrição</th>
                <th className="p-2">Valor</th>
                <th className="p-2">Vencimento</th>
                <th className="p-2">Situação</th>
                <th className="p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {faturas.map((f) => {
                const st = situacao(f);
                return (
                  <tr key={f.id} className="border-b last:border-0">
                    <td className="p-2">
                      {(f.clients as { razao_social?: string } | null)?.razao_social}
                    </td>
                    <td className="p-2">{f.descricao}</td>
                    <td className="p-2">{brl(Number(f.valor))}</td>
                    <td className="p-2">{f.vencimento}</td>
                    <td className="p-2">
                      <span
                        className={
                          st === "pago"
                            ? "text-green-600"
                            : st === "vencido"
                              ? "text-red-600"
                              : st === "cancelado"
                                ? "text-neutral-400"
                                : "text-amber-600"
                        }
                      >
                        {st}
                      </span>
                    </td>
                    <td className="p-2">
                      {f.status === "pendente" && (
                        <span className="flex gap-2">
                          <form action={marcarPago.bind(null, f.id)}>
                            <button className="text-xs text-green-700 hover:underline">
                              marcar pago
                            </button>
                          </form>
                          <form action={cancelarFatura.bind(null, f.id)}>
                            <button className="text-xs text-red-600 hover:underline">
                              cancelar
                            </button>
                          </form>
                          {f.link_pagamento && (
                            <a
                              href={f.link_pagamento}
                              target="_blank"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              link
                            </a>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
