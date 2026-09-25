export const metadata = { title: "LGPD — SeuPMOC" };

// RASCUNHO — revisar com advogado antes de publicar. Preencher os [colchetes].
export default function LgpdPage() {
  return (
    <>
      <h1>LGPD — como protegemos os dados</h1>
      <p>
        <em>
          Resumo da nossa conformidade com a Lei Geral de Proteção de Dados (Lei
          13.709/2018). Rascunho sujeito a revisão jurídica.
        </em>
      </p>

      <h2>Quem é quem</h2>
      <ul>
        <li>
          <strong>Controlador:</strong> a empresa de climatização que assina o
          SeuPMOC. Ela decide quais dados dos estabelecimentos atendidos cadastrar.
        </li>
        <li>
          <strong>Operador:</strong> o SeuPMOC, que trata esses dados em nome da
          empresa, apenas para emitir e acompanhar o PMOC.
        </li>
      </ul>

      <h2>Quais dados tratamos</h2>
      <ul>
        <li>Dados de cadastro do usuário: nome, e-mail e empresa.</li>
        <li>Dados dos estabelecimentos: razão social, CNPJ, endereço, contato e população.</li>
        <li>Dados técnicos: responsáveis técnicos, ART, equipamentos, manutenções e laudos.</li>
      </ul>
      <p>Não pedimos nem tratamos dados pessoais sensíveis. Não os insira na plataforma.</p>

      <h2>Como protegemos</h2>
      <ul>
        <li>Isolamento total dos dados entre empresas (nenhuma empresa vê os dados de outra).</li>
        <li>Criptografia em trânsito (HTTPS) e em repouso.</li>
        <li>Controle de acesso por usuário e histórico de atividades.</li>
        <li>Limite de requisições e proteção contra abuso.</li>
      </ul>

      <h2>Seus direitos</h2>
      <p>
        Você pode solicitar acesso, correção, portabilidade e eliminação dos seus
        dados. Dentro da plataforma, a empresa pode <strong>exportar</strong> os dados
        de cada estabelecimento e <strong>excluí-los definitivamente</strong>. Para
        outros pedidos, fale com o encarregado (DPO): [e-mail].
      </p>

      <h2>Compartilhamento</h2>
      <p>
        Não vendemos dados. Usamos apenas os prestadores necessários ao serviço:
        Supabase (banco de dados e autenticação), Netlify (hospedagem) e, quando
        aplicável, provedor de e-mail e de pagamento.
      </p>

      <h2>Retenção</h2>
      <p>
        Mantemos os dados enquanto a conta estiver ativa. Itens excluídos ficam na
        lixeira até a exclusão definitiva. Ao encerrar a conta, os dados podem ser
        exportados por 30 (trinta) dias e depois são eliminados, salvo obrigação legal.
      </p>

      <p>
        Veja também a <a href="/privacidade">Política de Privacidade</a> e os{" "}
        <a href="/termos">Termos de Uso</a>.
      </p>
    </>
  );
}
