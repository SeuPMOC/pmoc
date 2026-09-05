import { requireUser } from "@/lib/supabase/auth";
import { PageHeader, Panel, Field, Submit } from "@/components/ui";
import {
  salvarEmpresa,
  criarTecnico,
  excluirTecnico,
  criarFuncionario,
  alternarFuncionarioAtivo,
  excluirFuncionario,
} from "./actions";

export default async function EmpresaPage() {
  const { supabase, profile } = await requireUser();

  const [{ data: org }, { data: tecnicos }, { data: funcionarios }] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", profile.org_id).single(),
    supabase.from("technicians").select("*").eq("org_id", profile.org_id).order("nome"),
    supabase.from("employees").select("*").eq("org_id", profile.org_id).order("nome"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Minha empresa" />

      <Panel title="Dados da empresa prestadora">
        <form action={salvarEmpresa} className="grid gap-3 md:grid-cols-2">
          <Field label="Nome / razão social" name="name" required defaultValue={org?.name} />
          <Field label="CNPJ" name="cnpj" defaultValue={org?.cnpj} />
          <Field label="Telefone" name="telefone" defaultValue={org?.telefone} />
          <Field label="E-mail" name="email" defaultValue={org?.email} />
          <div className="md:col-span-2"><Submit /></div>
        </form>
      </Panel>

      <Panel title="Responsáveis técnicos">
        <p className="mb-3 text-sm text-neutral-500">
          Usados na emissão do PMOC e da planilha de acompanhamento (assinam pela ART).
        </p>
        <ul className="mb-4 divide-y text-sm">
          {(tecnicos ?? []).map((t) => (
            <li key={t.id} className="flex items-center justify-between py-2">
              <span>
                <b>{t.nome}</b> · {t.formacao ?? ""} · {t.conselho} {t.numero_registro} · ART{" "}
                {t.art_numero ?? "—"}
              </span>
              <form action={excluirTecnico.bind(null, t.id)}>
                <button className="text-xs text-red-600 hover:underline">excluir</button>
              </form>
            </li>
          ))}
          {!tecnicos?.length && (
            <li className="py-2 text-neutral-500">Nenhum responsável técnico.</li>
          )}
        </ul>
        <form action={criarTecnico} className="grid gap-3 md:grid-cols-3">
          <Field label="Nome" name="nome" required />
          <Field label="Formação" name="formacao" placeholder="Eng. Mecânico" />
          <Field label="Conselho" name="conselho" placeholder="CREA / CFT" />
          <Field label="Nº registro" name="numero_registro" />
          <Field label="ART/TRT nº" name="art_numero" />
          <div className="md:col-span-3"><Submit>Adicionar responsável</Submit></div>
        </form>
      </Panel>

      <Panel title="Funcionários / equipe de campo">
        <p className="mb-3 text-sm text-neutral-500">
          Quem sai a campo executando a manutenção. Aparecem no "Registrar execução"
          de cada cliente, pra apontar quem fez cada serviço.
        </p>
        <ul className="mb-4 divide-y text-sm">
          {(funcionarios ?? []).map((e) => (
            <li key={e.id} className="flex items-center justify-between py-2">
              <span className={e.ativo ? "" : "text-neutral-400 line-through"}>
                <b>{e.nome}</b>
                {e.cargo ? ` · ${e.cargo}` : ""}
                {e.telefone ? ` · ${e.telefone}` : ""}
              </span>
              <span className="flex gap-3 text-xs">
                <form action={alternarFuncionarioAtivo.bind(null, e.id, !e.ativo)}>
                  <button className="text-blue-600 hover:underline">
                    {e.ativo ? "desativar" : "reativar"}
                  </button>
                </form>
                <form action={excluirFuncionario.bind(null, e.id)}>
                  <button className="text-red-600 hover:underline">excluir</button>
                </form>
              </span>
            </li>
          ))}
          {!funcionarios?.length && (
            <li className="py-2 text-neutral-500">Nenhum funcionário cadastrado.</li>
          )}
        </ul>
        <form action={criarFuncionario} className="grid gap-3 md:grid-cols-4">
          <Field label="Nome" name="nome" required />
          <Field label="Cargo / função" name="cargo" placeholder="Técnico de refrigeração" />
          <Field label="Telefone" name="telefone" />
          <Field label="E-mail" name="email" />
          <div className="md:col-span-4"><Submit>Adicionar funcionário</Submit></div>
        </form>
      </Panel>
    </div>
  );
}
