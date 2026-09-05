import Link from "next/link";
import { requireUser } from "@/lib/supabase/auth";
import { PageHeader, Panel } from "@/components/ui";
import { listarClientesExcluidos, restaurarCliente } from "./actions";

const hoje = new Date().toISOString().slice(0, 10);

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { supabase } = await requireUser();

  let query = supabase
    .from("clients")
    .select("id, razao_social, nome_fantasia, cidade, uf")
    .order("razao_social");
  if (q) query = query.or(`razao_social.ilike.%${q}%,nome_fantasia.ilike.%${q}%,cidade.ilike.%${q}%`);

  const [{ data: clientes }, { data: pmocs }, { data: atrasadas }] = await Promise.all([
    query,
    supabase.from("pmoc_documents").select("client_id"),
    supabase
      .from("maintenance_orders")
      .select("client_id")
      .lt("data_prevista", hoje)
      .in("status", ["agendada", "atrasada"]),
  ]);

  const temPmoc = new Set((pmocs ?? []).map((p) => p.client_id));
  const atraso = new Map<string, number>();
  for (const o of atrasadas ?? [])
    atraso.set(o.client_id, (atraso.get(o.client_id) ?? 0) + 1);

  const lixeira = await listarClientesExcluidos();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clientes"
        action={
          <Link
            href="/clientes/novo"
            className="rounded bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            + Novo cliente
          </Link>
        }
      />

      <Panel title={`${clientes?.length ?? 0} estabelecimento(s)`}>
        <form method="get" className="mb-4">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome ou cidade..."
            className="w-full rounded border px-3 py-2 text-sm md:w-80"
          />
        </form>

        {!clientes?.length ? (
          <p className="text-sm text-neutral-500">
            {q ? "Nenhum estabelecimento encontrado." : "Nenhum cliente cadastrado."}
          </p>
        ) : (
          <ul className="divide-y">
            {clientes.map((c) => {
              const n = atraso.get(c.id) ?? 0;
              return (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span>
                    <Link
                      href={`/clientes/${c.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {c.razao_social}
                    </Link>
                    <span className="ml-2 text-sm text-neutral-400">
                      {c.nome_fantasia}
                      {c.cidade ? ` · ${c.cidade}/${c.uf ?? ""}` : ""}
                    </span>
                  </span>
                  <span className="flex flex-none gap-2 text-xs">
                    {n > 0 && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 font-semibold text-red-700">
                        {n} atrasada{n > 1 ? "s" : ""}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 font-semibold ${
                        temPmoc.has(c.id)
                          ? "bg-green-50 text-green-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {temPmoc.has(c.id) ? "PMOC emitido" : "sem PMOC"}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {lixeira.length > 0 && (
        <Panel title={`Lixeira (${lixeira.length})`}>
          <ul className="divide-y text-sm">
            {lixeira.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2">
                <span className="text-neutral-500">
                  {c.razao_social}
                  <span className="ml-2 text-xs text-neutral-400">
                    excluído em{" "}
                    {new Date(c.deleted_at as string).toLocaleDateString("pt-BR")}
                  </span>
                </span>
                <form action={restaurarCliente.bind(null, c.id)}>
                  <button className="text-xs font-semibold text-blue-600 hover:underline">
                    restaurar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
