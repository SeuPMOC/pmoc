import Link from "next/link";
import { requireClient } from "@/lib/supabase/auth";
import { checklistPmoc } from "@/lib/pmoc/checklist";
import { PageHeader, Panel } from "@/components/ui";

export default async function PortalHome() {
  const { supabase, clientId } = await requireClient();
  const { itens, pronto } = await checklistPmoc(supabase, clientId);

  const { data: pmocs } = await supabase
    .from("pmoc_documents")
    .select("id, versao, periodo_inicio, periodo_fim, emitido_em")
    .eq("client_id", clientId)
    .order("versao", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Início" />

      <div
        className={`rounded-lg border p-4 text-sm ${
          pronto
            ? "border-green-300 bg-green-50 text-green-800"
            : "border-amber-300 bg-amber-50 text-amber-800"
        }`}
      >
        {pronto
          ? "Cadastro completo. A empresa responsável já pode emitir o PMOC do seu estabelecimento."
          : "Complete os itens abaixo para que a empresa responsável possa emitir o PMOC."}
      </div>

      <Panel title="O que falta para emitir o PMOC">
        <ul className="flex flex-col gap-2 text-sm">
          {itens.map((i) => (
            <li key={i.chave} className="flex items-start gap-2">
              <span className={i.ok ? "text-green-600" : "text-neutral-300"}>
                {i.ok ? "✔" : "○"}
              </span>
              <span>
                {i.label}
                {i.detalhe && (
                  <span className="block text-xs text-neutral-500">{i.detalhe}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-neutral-500">
          O responsável técnico é cadastrado pela empresa de manutenção.
        </p>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/portal/estabelecimento" className="rounded-lg border p-4 hover:bg-neutral-50">
          <div className="font-semibold">Estabelecimento</div>
          <div className="text-sm text-neutral-500">Dados cadastrais e ocupação</div>
        </Link>
        <Link href="/portal/ambientes" className="rounded-lg border p-4 hover:bg-neutral-50">
          <div className="font-semibold">Ambientes</div>
          <div className="text-sm text-neutral-500">Áreas climatizadas</div>
        </Link>
        <Link href="/portal/equipamentos" className="rounded-lg border p-4 hover:bg-neutral-50">
          <div className="font-semibold">Equipamentos</div>
          <div className="text-sm text-neutral-500">Inventário de climatização</div>
        </Link>
      </div>

      {!!pmocs?.length && (
        <Panel title="PMOCs emitidos">
          <ul className="divide-y text-sm">
            {pmocs.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <span>
                  v{p.versao} · {p.periodo_inicio} a {p.periodo_fim}
                </span>
                <a
                  className="text-blue-600 underline"
                  href={`/api/pmoc/${p.id}/pdf`}
                  target="_blank"
                >
                  abrir PDF
                </a>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
