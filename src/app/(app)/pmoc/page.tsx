import Link from "next/link";
import { requireUser } from "@/lib/supabase/auth";
import { PageHeader, Panel } from "@/components/ui";

export default async function PmocPage() {
  const { supabase } = await requireUser();
  const { data: docs } = await supabase
    .from("pmoc_documents")
    .select("id, versao, periodo_inicio, periodo_fim, emitido_em, status, clients(id, razao_social)")
    .order("emitido_em", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="PMOCs emitidos" />
      <Panel>
        {!docs?.length ? (
          <p className="text-sm text-neutral-500">
            Nenhum PMOC emitido. Abra um cliente e use “Emitir PMOC”.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-left text-neutral-500">
              <tr>
                <th className="p-2">Cliente</th>
                <th className="p-2">Versão</th>
                <th className="p-2">Período</th>
                <th className="p-2">Emitido</th>
                <th className="p-2">PDF</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-b last:border-0">
                  <td className="p-2">
                    {/* @ts-expect-error relação aninhada */}
                    <Link href={`/clientes/${d.clients?.id}`} className="text-blue-600 hover:underline">
                      {/* @ts-expect-error relação aninhada */}
                      {d.clients?.razao_social}
                    </Link>
                  </td>
                  <td className="p-2">v{d.versao}</td>
                  <td className="p-2">
                    {d.periodo_inicio} a {d.periodo_fim}
                  </td>
                  <td className="p-2">
                    {d.emitido_em ? new Date(d.emitido_em).toLocaleDateString("pt-BR") : "-"}
                  </td>
                  <td className="p-2">
                    <a className="text-blue-600 underline" href={`/api/pmoc/${d.id}/pdf`} target="_blank">
                      abrir
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
