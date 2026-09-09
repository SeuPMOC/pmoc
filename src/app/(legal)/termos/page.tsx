export const metadata = { title: "Termos de Uso — SeuPMOC" };

// RASCUNHO — revisar com advogado antes de publicar. Preencher os [colchetes].
export default function TermosPage() {
  return (
    <>
      <h1>Termos de Uso</h1>
      <p>
        <em>
          Última atualização: [data]. Rascunho — revisar com assessoria jurídica.
        </em>
      </p>

      <h2>1. Objeto</h2>
      <p>
        O SeuPMOC é um software como serviço (SaaS) para empresas de climatização
        elaborarem, emitirem e acompanharem Planos de Manutenção, Operação e
        Controle (PMOC) e documentos correlatos.
      </p>

      <h2>2. Cadastro e conta</h2>
      <ul>
        <li>É necessário fornecer dados verdadeiros e um e-mail válido, confirmado.</li>
        <li>Você é responsável por manter a senha em sigilo e por toda atividade na sua conta.</li>
        <li>Uma conta é de uso de uma única empresa; o compartilhamento indevido pode levar à suspensão.</li>
      </ul>

      <h2>3. Planos e pagamento</h2>
      <ul>
        <li>Os planos e limites vigentes estão em [link de preços].</li>
        <li>A assinatura é mensal, sem fidelidade, renovada automaticamente até o cancelamento.</li>
        <li>O não pagamento após [prazo] pode levar à suspensão do acesso; os dados são mantidos por [prazo] antes de eventual exclusão.</li>
        <li>Há período de teste gratuito de [10] dias.</li>
      </ul>

      <h2>4. Responsabilidade técnica</h2>
      <p>
        O SeuPMOC é uma ferramenta. A <strong>responsabilidade técnica</strong>{" "}
        pelo conteúdo do PMOC, pela veracidade dos dados, pela execução das
        manutenções e pela Anotação de Responsabilidade Técnica (ART) é
        exclusivamente do profissional habilitado e da empresa usuária. O SeuPMOC
        não presta serviço de engenharia nem assina documentos técnicos.
      </p>

      <h2>5. Uso aceitável</h2>
      <p>É proibido: tentar burlar limites de plano ou o isolamento entre contas; acessar dados de terceiros; realizar testes de intrusão sem autorização por escrito; usar a plataforma para fim ilícito; sobrecarregar a infraestrutura.</p>

      <h2>6. Propriedade dos dados</h2>
      <p>
        Os dados que você insere são seus. Você nos concede licença para
        processá-los apenas para prestar o serviço. Você pode exportar seus dados
        a qualquer momento e solicitar a exclusão conforme a Política de
        Privacidade.
      </p>

      <h2>7. Disponibilidade e limitação de responsabilidade</h2>
      <p>
        Empregamos esforços para manter o serviço disponível, mas ele é fornecido
        &quot;no estado em que se encontra&quot;. Nossa responsabilidade, quando
        cabível, limita-se ao valor pago nos últimos [12] meses. Não respondemos
        por multas ou sanções decorrentes de dados incorretos fornecidos por você
        ou de manutenções não realizadas.
      </p>

      <h2>8. Encerramento</h2>
      <p>
        Você pode cancelar a qualquer momento. Podemos encerrar contas que violem
        estes termos, com aviso prévio quando possível.
      </p>

      <h2>9. Foro</h2>
      <p>Fica eleito o foro da comarca de [cidade/UF].</p>
    </>
  );
}
