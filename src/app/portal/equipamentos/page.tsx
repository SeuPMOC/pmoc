import { requireClient } from "@/lib/supabase/auth";
import { PageHeader, Panel, Field, Submit } from "@/components/ui";
import { EQUIP_TIPOS } from "@/lib/pmoc/catalogo";
import { criarEquipamento, excluirEquipamento } from "../actions";

export default async function EquipamentosPage() {
  const { supabase, clientId } = await requireClient();

  const [{ data: units }, { data: equip }] = await Promise.all([
    supabase.from("units").select("id, nome").eq("client_id", clientId).order("nome"),
    supabase
      .from("equipment")
      .select("*, units(nome), maintenance_plan_items(id)")
      .eq("client_id", clientId)
      .order("tag"),
  ]);

  const unitOpts = [
    { value: "", label: "— sem ambiente —" },
    ...(units ?? []).map((u) => ({ value: u.id, label: u.nome })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Inventário de equipamentos" />

      <Panel title={`${equip?.length ?? 0} equipamento(s)`}>
        {!equip?.length ? (
          <p className="text-sm text-neutral-500">Nenhum equipamento cadastrado.</p>
        ) : (
          <ul className="divide-y text-sm">
            {equip.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-2">
                <span>
                  <b className="font-mono">{e.tag}</b> · {e.tipo} ·{" "}
                  {[e.marca, e.modelo].filter(Boolean).join(" ")}{" "}
                  {e.capacidade_btu ? `· ${e.capacidade_btu} BTU/h` : ""}
                  <span className="block text-xs text-neutral-500">
                    {(e.units as { nome?: string } | null)?.nome ?? "sem ambiente"} ·{" "}
                    {e.maintenance_plan_items?.length ?? 0} atividade(s) no plano
                  </span>
                </span>
                <form action={excluirEquipamento.bind(null, e.id)}>
                  <button className="text-xs text-red-600 hover:underline">excluir</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Novo equipamento">
        <p className="mb-3 text-xs text-neutral-500">
          O plano de manutenção padrão da norma é aplicado automaticamente conforme o tipo.
        </p>
        <form action={criarEquipamento} className="grid gap-3 md:grid-cols-4">
          <Field label="TAG / identificação" name="tag" required placeholder="AC-01" />
          <Field label="Tipo" name="tipo" as="select" options={EQUIP_TIPOS} />
          <Field label="Ambiente atendido" name="unit_id" as="select" options={unitOpts} />
          <Field label="Marca" name="marca" />
          <Field label="Modelo" name="modelo" />
          <Field label="Nº de série" name="numero_serie" />
          <Field label="Capacidade (BTU/h)" name="capacidade_btu" type="number" />
          <Field label="Ano de fabricação" name="ano_fabricacao" type="number" />
          <Field label="Fluido refrigerante" name="fluido_refrigerante" placeholder="R-410A" />
          <Field label="Vazão de ar exterior (m³/h)" name="vazao_ar_exterior_m3h" type="number" step="0.1" />
          <Field label="Localização física" name="localizacao" placeholder="Cobertura, casa de máquinas..." />
          <Field label="Ambientes atendidos (texto)" name="ambientes_atendidos" />
          <div className="md:col-span-4"><Submit>Adicionar equipamento</Submit></div>
        </form>
      </Panel>
    </div>
  );
}
