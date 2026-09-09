export const metadata = { title: "Política de Privacidade — SeuPMOC" };

// RASCUNHO — revisar com advogado antes de publicar. Preencher os [colchetes].
export default function PrivacidadePage() {
  return (
    <>
      <h1>Política de Privacidade</h1>
      <p>
        <em>
          Última atualização: [data]. Este documento é um rascunho e deve ser
          revisado por assessoria jurídica antes de entrar em vigor.
        </em>
      </p>

      <h2>1. Quem somos</h2>
      <p>
        O SeuPMOC é operado por [razão social], CNPJ [nº], com sede em [endereço]
        (&quot;nós&quot;). Contato do encarregado de dados (DPO): [e-mail].
      </p>

      <h2>2. A quem esta política se aplica</h2>
      <p>
        Aos <strong>usuários</strong> das empresas de climatização que assinam o
        SeuPMOC (&quot;clientes&quot;) e aos dados que essas empresas inserem na
        plataforma sobre os <strong>estabelecimentos</strong> que atendem.
      </p>

      <h2>3. Papéis (LGPD)</h2>
      <ul>
        <li>
          <strong>Controlador</strong> dos dados dos estabelecimentos e das
          manutenções: a empresa de climatização que os cadastra.
        </li>
        <li>
          <strong>Operador</strong> desses dados: o SeuPMOC, que os trata em nome
          da empresa, conforme o Contrato de Tratamento de Dados (DPA).
        </li>
        <li>
          <strong>Controlador</strong> dos dados de cadastro e cobrança da
          própria empresa assinante: o SeuPMOC.
        </li>
      </ul>

      <h2>4. Dados que tratamos</h2>
      <ul>
        <li>Cadastro da conta: nome, e-mail, senha (com hash), empresa, CNPJ, telefone.</li>
        <li>
          Dados inseridos pelo cliente: dados dos estabelecimentos (razão social,
          CNPJ, endereço, população), inventário de equipamentos, responsáveis
          técnicos, registros de manutenção, laudos de qualidade do ar, ART.
        </li>
        <li>Dados de uso: logs de acesso, endereço IP, ações registradas na auditoria.</li>
        <li>Cobrança: histórico de mensalidades e status de pagamento.</li>
      </ul>

      <h2>5. Bases legais e finalidades</h2>
      <ul>
        <li>Execução de contrato: operar a plataforma e gerar os documentos (PMOC, planilha, ART).</li>
        <li>Cumprimento de obrigação legal/regulatória: guarda de documentos exigidos pela Lei 13.589/2018 e Portaria MS 3.523/1998.</li>
        <li>Legítimo interesse: segurança, prevenção a fraude, melhoria do serviço.</li>
      </ul>

      <h2>6. Compartilhamento</h2>
      <p>
        Não vendemos dados. Compartilhamos apenas com sub-operadores necessários à
        prestação do serviço: [Supabase — banco de dados e autenticação],
        [Netlify — hospedagem], [gateway de pagamento], [provedor de e-mail].
        A lista atualizada de sub-operadores está em [link].
      </p>

      <h2>7. Armazenamento e segurança</h2>
      <p>
        Dados armazenados em servidores em [região], com criptografia em trânsito
        (HTTPS) e em repouso, isolamento por organização (RLS), registro de
        auditoria e backups. Detalhes de segurança sob demanda.
      </p>

      <h2>8. Retenção</h2>
      <p>
        Dados de PMOC e manutenção são mantidos enquanto a conta estiver ativa e
        por [prazo] após o encerramento, para fins de comprovação regulatória.
        Registros excluídos vão para a lixeira e são apagados definitivamente
        após [90] dias, salvo pedido de exclusão imediata.
      </p>

      <h2>9. Direitos do titular</h2>
      <p>
        Você pode solicitar confirmação de tratamento, acesso, correção,
        portabilidade, anonimização, eliminação e informações sobre
        compartilhamento pelo e-mail [e-mail]. Para dados de estabelecimentos, o
        pedido deve ser direcionado à empresa de climatização controladora; o
        SeuPMOC dá suporte à execução.
      </p>

      <h2>10. Cookies</h2>
      <p>
        Usamos apenas cookies essenciais de sessão e segurança. Não usamos cookies
        de publicidade ou rastreamento de terceiros.
      </p>

      <h2>11. Alterações</h2>
      <p>Avisaremos por e-mail e no aplicativo antes de mudanças relevantes.</p>
    </>
  );
}
