import { requireClient } from "@/lib/supabase/auth";
import { PageHeader, Panel, Field, Submit } from "@/components/ui";
import { salvarEstabelecimento } from "../actions";

export default async function EstabelecimentoPage() {
  const { supabase, clientId } = await requireClient();
  const { data: c } = await supabase.from("clients").select("*").eq("id", clientId).single();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Estabelecimento" />
      <Panel title="Dados cadastrais">
        <form action={salvarEstabelecimento} className="grid gap-3 md:grid-cols-3">
          <Field label="Razão social" name="razao_social" required defaultValue={c?.razao_social} />
          <Field label="Nome fantasia" name="nome_fantasia" defaultValue={c?.nome_fantasia} />
          <Field label="CNPJ" name="cnpj" defaultValue={c?.cnpj} />
          <Field label="Endereço" name="endereco" defaultValue={c?.endereco} />
          <Field label="Número" name="numero" defaultValue={c?.numero} />
          <Field label="Bairro" name="bairro" defaultValue={c?.bairro} />
          <Field label="Cidade" name="cidade" defaultValue={c?.cidade} />
          <Field label="UF" name="uf" defaultValue={c?.uf} />
          <Field label="CEP" name="cep" defaultValue={c?.cep} />
          <Field label="Área climatizada (m²)" name="area_climatizada_m2" type="number" step="0.01" defaultValue={c?.area_climatizada_m2} />
          <Field label="População fixa" name="populacao_fixa" type="number" defaultValue={c?.populacao_fixa} />
          <Field label="População flutuante" name="populacao_flutuante" type="number" defaultValue={c?.populacao_flutuante} />
          <Field label="Nome do contato" name="contato_nome" defaultValue={c?.contato_nome} />
          <Field label="E-mail do contato" name="contato_email" defaultValue={c?.contato_email} />
          <Field label="Telefone do contato" name="contato_fone" defaultValue={c?.contato_fone} />
          <div className="md:col-span-3"><Submit /></div>
        </form>
      </Panel>
    </div>
  );
}
