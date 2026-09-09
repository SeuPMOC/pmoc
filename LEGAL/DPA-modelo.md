# Contrato de Tratamento de Dados Pessoais (DPA) — modelo

> RASCUNHO. Revisar com assessoria jurídica. Anexo ao contrato de assinatura do SeuPMOC.

**Controlador:** o CLIENTE (empresa de climatização assinante).
**Operador:** [razão social do SeuPMOC], CNPJ [nº] (&ldquo;SeuPMOC&rdquo;).

## 1. Objeto

O SeuPMOC trata dados pessoais em nome do Controlador, exclusivamente para
executar o serviço de elaboração e acompanhamento de PMOC contratado.

## 2. Natureza dos dados

- Identificação de estabelecimentos e responsáveis (razão social, CNPJ, endereço,
  contatos, população fixa/flutuante).
- Dados de responsáveis técnicos (nome, registro em conselho, ART).
- Registros operacionais de manutenção e laudos de qualidade do ar.

Não há tratamento de dados sensíveis nem de crianças/adolescentes de forma
intencional; o Controlador se compromete a não inserir dados dessa natureza.

## 3. Obrigações do Operador

- Tratar os dados apenas conforme instruções documentadas do Controlador.
- Aplicar medidas técnicas e organizacionais de segurança (isolamento por
  organização via RLS, criptografia em trânsito e repouso, controle de acesso,
  registro de auditoria, rate limiting).
- Manter confidencialidade; obrigar seus colaboradores ao mesmo dever.
- Auxiliar o Controlador no atendimento a titulares e à ANPD.
- Notificar o Controlador em até [48] horas de qualquer incidente de segurança
  relevante.
- Não subcontratar sem autorização; sub-operadores atuais: Supabase (banco e
  autenticação), Netlify (hospedagem), [gateway de pagamento], [provedor de
  e-mail].

## 4. Direitos dos titulares

O SeuPMOC disponibiliza ao Controlador as funções de exportação (JSON) e
exclusão definitiva por estabelecimento, para atender pedidos de acesso,
portabilidade e eliminação.

## 5. Retenção e devolução

Ao término do contrato, o Controlador pode exportar os dados por [30] dias.
Após esse prazo, o SeuPMOC elimina os dados, salvo obrigação legal de guarda.

## 6. Transferência internacional

[Preencher conforme a região de hospedagem do Supabase. Se fora do Brasil,
indicar a base legal e as garantias.]

## 7. Responsabilidade

Cada parte responde pelas obrigações que lhe cabem na LGPD. O Operador não
responde por dados incorretos fornecidos pelo Controlador.

## 8. Vigência

Acompanha a vigência do contrato principal de assinatura.
