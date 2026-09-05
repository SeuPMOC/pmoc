import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/auth";
import { PageHeader, Panel, Field, Submit, Crumb } from "@/components/ui";
import { registrarExecucao, registrarLaudoAr } from "../actions";

const OS_TIPOS = [
  { value: "preventiva", label: "Preventiva" },
  { value: "corretiva", label: "Corretiva" },
  { value: "preditiva", label: "Preditiva" },
];

export default async function AcompanhamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireUser();

  const { data: c } = await supabase
    .from("clients")
    .select("razao_social")
    .eq("id", id)
    .single();
  if (!c) notFound();

  const [{ data: units }, { data: equip }, { data: funcionarios }, { data: execucoes }, { data: laudos }] =
    await Promise.all([
      supabase.from("units").select("id, nome").eq("client_id", id).order("nome"),
      supabase.from("equipment").select("id, tag").eq("client_id", id).order("tag"),
      supabase
        .from("employees")
        .select("id, nome")
        .eq("org_id", profile.org_id)
        .eq("ativo", true)
        .order("nome"),
      supabase
        .from("maintenance_orders")
        .select("*, equipment(tag), employees(nome)")
        .eq("client_id", id)
        .order("data_execucao", { ascending: false })
        .limit(30),
      supabase
        .from("air_quality_readings")
        .select("*, units(nome)")
        .eq("client_id", id)
        .order("data_medicao", { ascending: false })
        .limit(30),
    ]);

  const unitOpts = [
    { value: "", label: "— sem ambiente —" },
    ...(units ?? []).map((u) => ({ value: u.id, label: u.nome })),
  ];
  const equipOpts = [
    { value: "", label: "— geral —" },
    ...(equip ?? []).map((e) => ({ value: e.id, label: e.tag })),
  ];
  const funcOpts = [
    { value: "", label: "— não informado —" },
    ...(funcionarios ?? []).map((f) => ({ value: f.id, label: f.nome })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <Crumb href={`/clientes/${id}`}>← {c.razao_social}</Crumb>
      <PageHeader title="Acompanhamento das manutenções" />

      <Panel title="Registrar execução">
        <form action={registrarExecucao.bind(null, id)} className="grid gap-3 md:grid-cols-3">
          <Field label="Equipamento" name="equipment_id" as="select" options={equipOpts} />
          <Field label="Funcionário" name="employee_id" as="select" options={funcOpts} />
          <Field label="Tipo" name="tipo" as="select" options={OS_TIPOS} />
          <Field label="Data prevista" name="data_prevista" type="date" />
          <Field label="Data execução" name="data_execucao" type="date" required />
          <Field label="Serviço executado" name="descricao_servico" as="textarea" />
          <Field label="Ocorrências" name="ocorrencias" as="textarea" />
          <Field label="Peças substituídas" name="pecas_substituidas" as="textarea" />
          <Field label="Recomendações" name="recomendacoes" as="textarea" />
          <div className="md:col-span-3"><Submit>Registrar execução</Submit></div>
        </form>
        <ul className="mt-4 divide-y text-sm">
          {(execucoes ?? []).map((x) => (
            <li key={x.id} className="py-2">
              {x.data_execucao ?? "s/ data"} · {(x.equipment as { tag?: string } | null)?.tag ?? "geral"} ·{" "}
              {x.tipo} ·{" "}
              <span className="text-neutral-500">
                {(x.employees as { nome?: string } | null)?.nome ?? "sem funcionário"}
              </span>
              {" · "}
              {x.descricao_servico ?? ""}
              {x.ocorrencias ? ` — ${x.ocorrencias}` : ""}
            </li>
          ))}
          {!execucoes?.length && <li className="py-2 text-neutral-500">Nenhuma execução.</li>}
        </ul>
      </Panel>

      <Panel title="Qualidade do ar interior (RE 09/2003)">
        <form action={registrarLaudoAr.bind(null, id)} className="grid gap-3 md:grid-cols-4">
          <Field label="Data medição" name="data_medicao" type="date" required />
          <Field label="Ambiente" name="unit_id" as="select" options={unitOpts} />
          <Field label="Temperatura (°C)" name="temperatura_c" type="number" step="0.1" />
          <Field label="Umidade relativa (%)" name="umidade_rel" type="number" step="0.1" />
          <Field label="CO₂ (ppm)" name="co2_ppm" type="number" />
          <Field label="Velocidade ar (m/s)" name="velocidade_ar_ms" type="number" step="0.01" />
          <Field label="Contagem fúngica (UFC/m³)" name="contagem_fungica_ufc" type="number" />
          <Field label="Aerodispersóides" name="aerodispersoides" type="number" step="0.01" />
          <Field label="Observações" name="observacoes" as="textarea" />
          <div className="md:col-span-4"><Submit>Registrar laudo</Submit></div>
        </form>
        <ul className="mt-4 divide-y text-sm">
          {(laudos ?? []).map((q) => (
            <li key={q.id} className="py-2">
              {q.data_medicao} · {(q.units as { nome?: string } | null)?.nome ?? "geral"} ·{" "}
              {q.temperatura_c ?? "?"}°C · UR {q.umidade_rel ?? "?"}% · CO₂ {q.co2_ppm ?? "?"} ppm ·{" "}
              <b className={q.dentro_padrao ? "text-green-600" : "text-red-600"}>
                {q.dentro_padrao ? "conforme" : "não conforme"}
              </b>
            </li>
          ))}
          {!laudos?.length && <li className="py-2 text-neutral-500">Nenhum laudo.</li>}
        </ul>
      </Panel>
    </div>
  );
}
