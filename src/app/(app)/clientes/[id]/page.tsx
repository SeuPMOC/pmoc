import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/auth";
import { PageHeader, Panel, Field, Submit, Crumb } from "@/components/ui";
import { EQUIP_TIPOS } from "@/lib/pmoc/catalogo";
import { checklistPmoc } from "@/lib/pmoc/checklist";
import { atualizarCliente, excluirCliente } from "../actions";
import {
  criarUnidade,
  criarEquipamento,
  aplicarPlanoPadrao,
  excluirEquipamento,
  excluirUnidade,
  emitir,
  anexarArt,
} from "./actions";

const anoAtual = new Date().getFullYear();

export default async function ClienteDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireUser();

  const { data: c } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!c) notFound();

  const { itens: checklist, pronto } = await checklistPmoc(supabase, id);

  const [{ data: units }, { data: equipamentos }, { data: tecnicos }, { data: pmocs }] =
    await Promise.all([
      supabase.from("units").select("*").eq("client_id", id).order("nome"),
      supabase
        .from("equipment")
        .select("*, maintenance_plan_items(id)")
        .eq("client_id", id)
        .order("tag"),
      supabase.from("technicians").select("id, nome").eq("org_id", profile.org_id).order("nome"),
      supabase
        .from("pmoc_documents")
        .select("id, versao, periodo_inicio, periodo_fim, emitido_em, art_numero, art_path, art_registrada_em")
        .eq("client_id", id)
        .order("versao", { ascending: false }),
    ]);

  const unitOpts = [
    { value: "", label: "— sem ambiente —" },
    ...(units ?? []).map((u) => ({ value: u.id, label: u.nome })),
  ];
  const tecOpts = [
    { value: "", label: "— nenhum —" },
    ...(tecnicos ?? []).map((t) => ({ value: t.id, label: t.nome })),
  ];
  const semTecnico = !tecnicos?.length;

  const Passo = ({ n, titulo, ok }: { n: number; titulo: string; ok: boolean }) => (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
          ok ? "bg-green-600 text-white" : "border border-neutral-300 text-neutral-400"
        }`}
      >
        {ok ? "✓" : n}
      </span>
      <span className={ok ? "text-neutral-900" : "text-neutral-500"}>{titulo}</span>
    </div>
  );

  const temAmbiente = (units?.length ?? 0) > 0;
  const equipComPlano =
    (equipamentos?.length ?? 0) > 0 &&
    (equipamentos ?? []).every((e) => (e.maintenance_plan_items?.length ?? 0) > 0);
  const cadastroOk = checklist.find((i) => i.chave === "cadastro")?.ok ?? false;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Crumb href="/clientes">← Clientes</Crumb>
        <div className="flex gap-4">
          <Crumb href={`/clientes/${id}/cronograma`}>Cronograma →</Crumb>
          <Crumb href={`/clientes/${id}/acompanhamento`}>Acompanhamento →</Crumb>
        </div>
      </div>
      <PageHeader title={c.razao_social} />

      {/* Progresso */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-lg border bg-neutral-50 p-4 text-sm">
        <Passo n={1} titulo="Dados do estabelecimento" ok={cadastroOk} />
        <Passo n={2} titulo="Ambientes" ok={temAmbiente} />
        <Passo n={3} titulo="Equipamentos + plano" ok={equipComPlano} />
        <Passo n={4} titulo="Documentos" ok={(pmocs?.length ?? 0) > 0} />
      </div>

      {/* Passo 1 */}
      <Panel title="1 · Dados do estabelecimento">
        <form action={atualizarCliente.bind(null, id)} className="grid gap-3 md:grid-cols-3">
          <Field label="Razão social" name="razao_social" required defaultValue={c.razao_social} />
          <Field label="Nome fantasia" name="nome_fantasia" defaultValue={c.nome_fantasia} />
          <Field label="CNPJ" name="cnpj" defaultValue={c.cnpj} />
          <Field label="Endereço" name="endereco" defaultValue={c.endereco} />
          <Field label="Número" name="numero" defaultValue={c.numero} />
          <Field label="Bairro" name="bairro" defaultValue={c.bairro} />
          <Field label="Cidade" name="cidade" defaultValue={c.cidade} />
          <Field label="UF" name="uf" defaultValue={c.uf} />
          <Field label="CEP" name="cep" defaultValue={c.cep} />
          <Field label="Área climatizada (m²)" name="area_climatizada_m2" type="number" step="0.01" defaultValue={c.area_climatizada_m2} />
          <Field label="População fixa" name="populacao_fixa" type="number" defaultValue={c.populacao_fixa} />
          <Field label="População flutuante" name="populacao_flutuante" type="number" defaultValue={c.populacao_flutuante} />
          <Field label="Contato" name="contato_nome" defaultValue={c.contato_nome} />
          <Field label="E-mail contato" name="contato_email" defaultValue={c.contato_email} />
          <Field label="Telefone contato" name="contato_fone" defaultValue={c.contato_fone} />
          <div className="md:col-span-3"><Submit /></div>
        </form>
      </Panel>

      {/* Passo 2 */}
      <Panel title="2 · Ambientes climatizados">
        <ul className="mb-4 divide-y text-sm">
          {(units ?? []).map((u) => (
            <li key={u.id} className="flex items-center justify-between py-2">
              <span>
                <b>{u.nome}</b> — {u.area_m2 ?? "?"} m² · ocupação {u.ocupacao ?? "?"}
                {u.finalidade ? ` · ${u.finalidade}` : ""}
              </span>
              <form action={excluirUnidade.bind(null, id, u.id)}>
                <button className="text-xs text-red-600 hover:underline">excluir</button>
              </form>
            </li>
          ))}
          {!units?.length && <li className="py-2 text-neutral-500">Nenhum ambiente.</li>}
        </ul>
        <form action={criarUnidade.bind(null, id)} className="grid gap-3 md:grid-cols-4">
          <Field label="Nome" name="nome" required placeholder="Recepção, Sala 1..." />
          <Field label="Área (m²)" name="area_m2" type="number" step="0.01" />
          <Field label="Ocupação" name="ocupacao" type="number" />
          <Field label="Finalidade" name="finalidade" />
          <div className="md:col-span-4"><Submit>Adicionar ambiente</Submit></div>
        </form>
      </Panel>

      {/* Passo 3 */}
      <Panel title="3 · Inventário de equipamentos">
        <ul className="mb-4 divide-y text-sm">
          {(equipamentos ?? []).map((e) => {
            const nPlano = e.maintenance_plan_items?.length ?? 0;
            return (
              <li key={e.id} className="flex items-center justify-between gap-3 py-2">
                <span>
                  <b className="font-mono">{e.tag}</b> · {e.tipo} ·{" "}
                  {[e.marca, e.modelo].filter(Boolean).join(" ")}{" "}
                  {e.capacidade_btu ? `· ${e.capacidade_btu} BTU/h` : ""}
                  <span
                    className={`block text-xs ${nPlano ? "text-neutral-500" : "text-amber-600"}`}
                  >
                    {nPlano ? `${nPlano} atividades no plano` : "sem plano — aplique o padrão"}
                  </span>
                </span>
                <span className="flex flex-none gap-2">
                  <form action={aplicarPlanoPadrao.bind(null, id, e.id, e.tipo)}>
                    <button className="text-xs text-blue-600 hover:underline">plano padrão</button>
                  </form>
                  <form action={excluirEquipamento.bind(null, id, e.id)}>
                    <button className="text-xs text-red-600 hover:underline">excluir</button>
                  </form>
                </span>
              </li>
            );
          })}
          {!equipamentos?.length && <li className="py-2 text-neutral-500">Nenhum equipamento.</li>}
        </ul>
        <p className="mb-3 text-xs text-neutral-500">
          O plano de manutenção da norma é aplicado automaticamente conforme o tipo.
        </p>
        <form action={criarEquipamento.bind(null, id)} className="grid gap-3 md:grid-cols-4">
          <Field label="TAG" name="tag" required placeholder="AC-01" />
          <Field label="Tipo" name="tipo" as="select" options={EQUIP_TIPOS} />
          <Field label="Ambiente" name="unit_id" as="select" options={unitOpts} />
          <Field label="Marca" name="marca" />
          <Field label="Modelo" name="modelo" />
          <Field label="Nº série" name="numero_serie" />
          <Field label="Capacidade (BTU/h)" name="capacidade_btu" type="number" />
          <Field label="Ano fabricação" name="ano_fabricacao" type="number" />
          <Field label="Fluido refrigerante" name="fluido_refrigerante" placeholder="R-410A" />
          <Field label="Vazão ar exterior (m³/h)" name="vazao_ar_exterior_m3h" type="number" step="0.1" />
          <Field label="Localização" name="localizacao" />
          <Field label="Ambientes atendidos" name="ambientes_atendidos" />
          <label className="flex items-center gap-2 text-sm md:col-span-4">
            <input type="checkbox" name="aplicar_plano" defaultChecked />
            Aplicar plano de manutenção padrão
          </label>
          <div className="md:col-span-4"><Submit>Adicionar equipamento</Submit></div>
        </form>
      </Panel>

      {/* Passo 4 */}
      <Panel title="4 · Gerar documentos">
        {!pronto && (
          <ul className="mb-4 flex flex-col gap-1 text-sm">
            {checklist
              .filter((i) => !i.ok)
              .map((i) => (
                <li key={i.chave} className="flex items-start gap-2 text-amber-700">
                  <span>!</span>
                  <span>
                    {i.label}
                    {i.detalhe && (
                      <span className="block text-xs text-neutral-500">{i.detalhe}</span>
                    )}
                  </span>
                </li>
              ))}
          </ul>
        )}
        {semTecnico && (
          <p className="mb-4 text-sm text-amber-700">
            Cadastre um responsável técnico em{" "}
            <a className="underline" href="/empresa">Minha empresa</a>.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">PMOC</h3>
            <p className="mb-3 text-xs text-neutral-500">
              Documento oficial com inventário, plano, cronograma e registros do período.
            </p>
            <form action={emitir.bind(null, id)} className="flex flex-col gap-3">
              <Field label="Período — início" name="periodo_inicio" type="date" required />
              <Field label="Período — fim" name="periodo_fim" type="date" required />
              <Field label="Responsável técnico" name="technician_id" as="select" options={tecOpts} />
              <Submit>Gerar PMOC (PDF)</Submit>
            </form>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Planilha de acompanhamento</h3>
            <p className="mb-3 text-xs text-neutral-500">
              Planilha física para o estabelecimento: equipamentos, atividades,
              periodicidade e grade de 12 meses para registrar cada manutenção.
            </p>
            <form
              method="get"
              action={`/api/clientes/${id}/planilha/pdf`}
              target="_blank"
              className="flex flex-col gap-3"
            >
              <Field label="Ano de referência" name="ano" type="number" defaultValue={anoAtual} />
              <Field label="Responsável técnico" name="tecnico" as="select" options={tecOpts} />
              <button className="rounded border border-black px-4 py-2 text-sm hover:bg-neutral-50">
                Gerar planilha (PDF)
              </button>
            </form>
          </div>
        </div>

        {!!pmocs?.length && (
          <div className="mt-6">
            <h3 className="mb-2 font-semibold">PMOCs emitidos</h3>
            <ul className="flex flex-col gap-3 text-sm">
              {pmocs.map((p) => (
                <li key={p.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span>
                      <b>v{p.versao}</b> · {p.periodo_inicio} a {p.periodo_fim}
                    </span>
                    <a
                      className="text-blue-600 underline"
                      href={`/api/pmoc/${p.id}/pdf`}
                      target="_blank"
                    >
                      abrir PDF{p.art_path ? " (com ART)" : ""}
                    </a>
                  </div>
                  <div className="mt-2 text-xs text-neutral-500">
                    ART:{" "}
                    {p.art_numero ? (
                      <span className="text-neutral-700">
                        nº {p.art_numero}
                        {p.art_registrada_em ? ` · ${p.art_registrada_em}` : ""}
                        {p.art_path ? " · PDF anexado" : " · sem arquivo"}
                      </span>
                    ) : (
                      "não registrada"
                    )}
                  </div>
                  <form
                    action={anexarArt.bind(null, id, p.id)}
                    className="mt-2 flex flex-wrap items-end gap-2"
                  >
                    <label className="text-xs text-neutral-600">
                      Nº da ART
                      <input
                        name="art_numero"
                        defaultValue={p.art_numero ?? ""}
                        className="mt-1 block rounded border px-2 py-1 text-sm"
                      />
                    </label>
                    <label className="text-xs text-neutral-600">
                      Data
                      <input
                        type="date"
                        name="art_registrada_em"
                        defaultValue={p.art_registrada_em ?? ""}
                        className="mt-1 block rounded border px-2 py-1 text-sm"
                      />
                    </label>
                    <label className="text-xs text-neutral-600">
                      Arquivo (PDF)
                      <input
                        type="file"
                        name="art_file"
                        accept="application/pdf"
                        className="mt-1 block text-sm"
                      />
                    </label>
                    <button className="rounded bg-black px-3 py-1.5 text-xs text-white hover:opacity-90">
                      {p.art_path ? "Atualizar ART" : "Anexar ART"}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      <details className="rounded-lg border border-red-200 bg-red-50/40 p-4 text-sm">
        <summary className="cursor-pointer font-semibold text-red-700">
          Zona de perigo
        </summary>
        <p className="mt-2 text-neutral-600">
          Excluir manda o cliente e tudo dele (ambientes, equipamentos, PMOCs)
          para a lixeira. Dá para restaurar em <b>Clientes → Lixeira</b>.
        </p>
        <form action={excluirCliente.bind(null, id)} className="mt-3">
          <button className="rounded border border-red-400 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">
            Excluir cliente
          </button>
        </form>
      </details>
    </div>
  );
}
