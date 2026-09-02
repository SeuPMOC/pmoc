import { PageHeader, Panel, Field, Submit, Crumb } from "@/components/ui";
import { criarCliente } from "../actions";

export default function NovoClientePage() {
  return (
    <div className="flex flex-col gap-6">
      <Crumb href="/clientes">← Clientes</Crumb>
      <PageHeader title="Novo cliente" />
      <Panel title="Dados do estabelecimento">
        <form action={criarCliente} className="grid gap-3 md:grid-cols-3">
          <Field label="Razão social" name="razao_social" required />
          <Field label="Nome fantasia" name="nome_fantasia" />
          <Field label="CNPJ" name="cnpj" />
          <Field label="Endereço" name="endereco" />
          <Field label="Número" name="numero" />
          <Field label="Bairro" name="bairro" />
          <Field label="Cidade" name="cidade" />
          <Field label="UF" name="uf" />
          <Field label="CEP" name="cep" />
          <Field label="Área climatizada (m²)" name="area_climatizada_m2" type="number" step="0.01" />
          <Field label="População fixa" name="populacao_fixa" type="number" />
          <Field label="População flutuante" name="populacao_flutuante" type="number" />
          <div className="md:col-span-3">
            <Submit>Cadastrar e continuar</Submit>
          </div>
        </form>
      </Panel>
      <p className="text-sm text-neutral-500">
        Depois de cadastrar você cai na tela do cliente para adicionar ambientes,
        equipamentos e gerar os documentos.
      </p>
    </div>
  );
}
