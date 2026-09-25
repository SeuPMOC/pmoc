import Link from "next/link";

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

      <h2>1. Aceitação</h2>
      <p>
        Ao criar uma conta e marcar a caixa de aceite, você declara que leu e
        concorda com estes Termos, com a <a href="/privacidade">Política de Privacidade</a>{" "}
        e com as informações da <a href="/lgpd">página de LGPD</a>. Se não concordar,
        não utilize o serviço.
      </p>

      <h2>2. Objeto</h2>
      <p>
        O SeuPMOC é um software como serviço (SaaS) para empresas de climatização
        elaborarem, emitirem e acompanharem Planos de Manutenção, Operação e
        Controle (PMOC) e documentos correlatos.
      </p>

      <h2>3. Cadastro e conta</h2>
      <ul>
        <li>É necessário fornecer dados verdadeiros e um e-mail válido, confirmado.</li>
        <li>Você é responsável por manter a senha em sigilo e por toda atividade na sua conta.</li>
        <li>Uma conta é de uso de uma única empresa; o compartilhamento indevido pode levar à suspensão.</li>
      </ul>

      <h2>4. Planos e pagamento</h2>
      <ul>
        <li>Os planos e limites vigentes estão na <Link href="/#planos">página inicial</Link>.</li>
        <li>A assinatura é mensal, sem fidelidade, renovada automaticamente até o cancelamento.</li>
        <li>O não pagamento por mais de 10 (dez) dias após o vencimento pode levar à suspensão do acesso. Durante a suspensão você ainda pode exportar seus dados, que são mantidos por 90 (noventa) dias antes de eventual exclusão.</li>
        <li>Há um plano gratuito, sem prazo de validade e com limites de uso, para você testar o serviço.</li>
        <li><strong>Arrependimento:</strong> nas contratações de planos pagos feitas pela internet, você pode desistir em até 7 (sete) dias corridos da contratação e receber de volta o valor pago, integralmente.</li>
      </ul>

      <h2>5. Responsabilidade técnica</h2>
      <p>
        O SeuPMOC é uma ferramenta. A <strong>responsabilidade técnica</strong>{" "}
        pelo conteúdo do PMOC, pela veracidade dos dados, pela execução das
        manutenções e pela Anotação de Responsabilidade Técnica (ART) é
        exclusivamente do profissional habilitado e da empresa usuária. O SeuPMOC
        não presta serviço de engenharia nem assina documentos técnicos.
      </p>

      <h2>6. Uso aceitável</h2>
      <p>É proibido: tentar burlar limites de plano ou o isolamento entre contas; acessar dados de terceiros; realizar testes de intrusão sem autorização por escrito; usar a plataforma para fim ilícito; sobrecarregar a infraestrutura.</p>

      <h2>7. Propriedade dos dados</h2>
      <p>
        Os dados que você insere são seus. Você nos concede licença para
        processá-los apenas para prestar o serviço. Você pode exportar seus dados
        a qualquer momento e solicitar a exclusão conforme a Política de
        Privacidade.
      </p>

      <h2>8. Disponibilidade e limitação de responsabilidade</h2>
      <p>
        Empregamos esforços para manter o serviço disponível, mas ele é fornecido
        &quot;no estado em que se encontra&quot;. Nossa responsabilidade, quando
        cabível, limita-se ao valor pago nos últimos 12 (doze) meses. Não respondemos
        por multas ou sanções decorrentes de dados incorretos fornecidos por você
        ou de manutenções não realizadas.
      </p>

      <h2>9. Encerramento</h2>
      <p>
        Você pode cancelar a qualquer momento. Podemos encerrar contas que violem
        estes termos, com aviso prévio quando possível.
      </p>

      <h2>10. Propriedade intelectual e licença de uso</h2>
      <p>
        O software, a marca SeuPMOC, o layout e os modelos de documento pertencem
        ao SeuPMOC. Concedemos a você uma licença limitada, não exclusiva e
        intransferível para usar a plataforma enquanto sua assinatura estiver
        ativa. É vedado copiar, revender, fazer engenharia reversa ou criar
        produto derivado do software.
      </p>

      <h2>11. Alterações do serviço e dos planos</h2>
      <p>
        Podemos evoluir funcionalidades e ajustar preços e limites dos planos.
        Mudanças que afetem o que você paga serão comunicadas com antecedência de
        30 (trinta) dias pelo e-mail cadastrado.
      </p>

      <h2>12. Comunicações</h2>
      <p>
        Enviaremos avisos do serviço (cobrança, segurança, alterações) ao e-mail
        cadastrado. Mantenha-o atualizado.
      </p>

      <h2>13. Disposições gerais</h2>
      <p>
        Estes Termos, junto com a Política de Privacidade, formam o acordo
        integral entre as partes. Se alguma cláusula for considerada inválida, as
        demais continuam válidas. Aplica-se a legislação brasileira.
      </p>

      <h2>14. Foro</h2>
      <p>Fica eleito o foro da comarca de Uberlândia/MG.</p>
    </>
  );
}
