import { requireClient } from "@/lib/supabase/auth";
import { PageHeader, Panel, Field, Submit } from "@/components/ui";
import { criarAmbiente, excluirAmbiente } from "../actions";

export default async function AmbientesPage() {
  const { supabase, clientId } = await requireClient();
  const { data: units } = await supabase
    .from("units")
    .select("*")
    .eq("client_id", clientId)
    .order("nome");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Ambientes climatizados" />

      <Panel title={`${units?.length ?? 0} ambiente(s)`}>
        {!units?.length ? (
          <p className="text-sm text-neutral-500">Nenhum ambiente cadastrado.</p>
        ) : (
          <ul className="divide-y text-sm">
            {units.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-2">
                <span>
                  <b>{u.nome}</b> — {u.area_m2 ?? "?"} m² · ocupação {u.ocupacao ?? "?"}
                  {u.finalidade ? ` · ${u.finalidade}` : ""}
                </span>
                <form action={excluirAmbiente.bind(null, u.id)}>
                  <button className="text-xs text-red-600 hover:underline">excluir</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Novo ambiente">
        <form action={criarAmbiente} className="grid gap-3 md:grid-cols-4">
          <Field label="Nome" name="nome" required placeholder="Recepção, Sala 1..." />
          <Field label="Área (m²)" name="area_m2" type="number" step="0.01" />
          <Field label="Ocupação (pessoas)" name="ocupacao" type="number" />
          <Field label="Finalidade" name="finalidade" placeholder="Atendimento, escritório..." />
          <div className="md:col-span-4"><Submit>Adicionar ambiente</Submit></div>
        </form>
      </Panel>
    </div>
  );
}
