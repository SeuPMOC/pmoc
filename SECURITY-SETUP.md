# Configuração de segurança — antes de comercializar

O código já cobre: anti-escalonamento de privilégio (RLS + triggers), isolamento
por organização, headers HTTP (CSP/HSTS/etc.), sanitização de input, rate limiting
nas rotas de PDF/export, audit log à prova de forja, soft delete + lixeira +
exclusão definitiva + exportação (LGPD), páginas de Termos e Privacidade.

O backend é auto-hospedado (GoTrue + PostgREST + Postgres atrás de um nginx,
publicado via túnel Cloudflare — ver `README.md`). As configurações abaixo ficam
no servidor: variáveis `PMOC_*` em `~/docker/.env`, serviços `pmoc-auth`,
`pmoc-rest` e `pmoc-gateway` em `~/docker/docker-compose.yml`. Depois de mudar,
`docker compose up -d <serviço>`.

Falta configurar / conferir (fora do repositório):

## 1. Confirmação de e-mail — OBRIGATÓRIO

Já ligada: `GOTRUE_MAILER_AUTOCONFIRM: "false"` no `pmoc-auth`. O app bloqueia
acesso de e-mail não confirmado (`/confirme-email`). Nunca ligar o autoconfirm:
sem ele, alguém cria conta com um e-mail que não é dele — inclusive um e-mail
que esteja em `PLATFORM_ADMIN_EMAILS`. Contas criadas por
`~/pmoc-criar-conta.sh` já nascem confirmadas (uso administrativo).

## 2. SMTP — OBRIGATÓRIO para cadastro e reset de senha pelo site

Sem SMTP o GoTrue não envia e-mail nenhum. Preencher em `~/docker/.env`:
`PMOC_SMTP_HOST`, `PMOC_SMTP_PORT`, `PMOC_SMTP_USER`, `PMOC_SMTP_PASS`,
`PMOC_SMTP_FROM` e recriar o `pmoc-auth`. Use um provedor transacional (Resend,
SES, Postmark) ou SMTP do provedor de e-mail do domínio (ex.: Proton pago com
endereço `@seupmoc.com.br`). Configurar SPF/DKIM do domínio para não cair em spam.
Templates em PT-BR: `GOTRUE_MAILER_TEMPLATES_*` / `GOTRUE_MAILER_SUBJECTS_*`.

## 3. CAPTCHA (Cloudflare Turnstile)

1. Cloudflare → Turnstile → criar widget → pegar **Site Key** e **Secret Key**.
2. No `pmoc-auth`: `GOTRUE_SECURITY_CAPTCHA_ENABLED: "true"`,
   `GOTRUE_SECURITY_CAPTCHA_PROVIDER: turnstile`,
   `GOTRUE_SECURITY_CAPTCHA_SECRET: <secret key>` (guardar em `~/docker/.env`).
3. Env do app na Netlify: `NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site key>` + redeploy.
   Com essa env presente, o login/cadastro passa a exigir o captcha.
4. Liberar `https://challenges.cloudflare.com` em `script-src` e `frame-src` da
   CSP (`next.config.ts`) — hoje a CSP bloqueia o widget.

## 4. Rate limiting

- Rotas de PDF (30/min por usuário) e export (10 / 5 min): via Postgres
  (`0009_rate_limit.sql`, tabela `rate_limits` + função `bump_rate_limit`).
- Login/cadastro: rate limit embutido do GoTrue, por IP real do visitante
  (`GOTRUE_RATE_LIMIT_HEADER: CF-Connecting-IP`). Ajustável com
  `GOTRUE_RATE_LIMIT_*` (ex.: `_EMAIL_SENT`, `_TOKEN_REFRESH`, `_VERIFY`).
- Camada extra opcional: regra de rate limit da Cloudflare (WAF) para
  `pmoc-api.server247.com.br/auth/v1/token`.

## 5. Backups

- `pg_dumpall` diário no servidor (inclui o banco `pmoc`, o schema `auth` e os
  PDFs de ART em `art_files`), retido 14 dias, com cópia no OneDrive (30 dias).
- Sem PITR (recuperação para um instante exato) — a perda máxima é de até 1 dia.
- **Testar a restauração pelo menos uma vez** (restaurar o dump num banco
  temporário e conferir contagem de linhas).

## 6. Criptografia em repouso

O disco do servidor e os arquivos de backup **não são criptografados** (o
Supabase hospedado fazia isso). Antes de dado real de cliente, avaliar:
criptografia do disco da VM/Proxmox (LUKS) e, no mínimo, criptografar os dumps
antes de irem para o OneDrive (ex.: `gpg --symmetric`). A política de
privacidade só promete criptografia em trânsito enquanto isso não existir.

## 7. Monitoramento de erros (Sentry)

```
npm i @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```
Gate o `Sentry.init` em `process.env.NEXT_PUBLIC_SENTRY_DSN` para não rodar em
dev. Configurar alerta para erros 5xx e para picos de 401/403/429.
No servidor, os containers `pmoc_*` são reiniciados pelo monitor
(`~/check-containers.sh`, a cada 5 min) se caírem.

## 8. HTTPS

Netlify serve o site em HTTPS e a Cloudflare serve a API em HTTPS (túnel — o
servidor não abre portas). `Strict-Transport-Security` está nos headers.
Confirmar que não há link `http://` fixo em lugar nenhum.

## 9. Rotação de chaves

As chaves `anon` e `service_role` são JWTs assinados com `PMOC_JWT_SECRET`. A
`service_role` é a mais poderosa (ignora RLS) — no app só é usada no servidor
(`src/lib/supabase/admin.ts` e quem o importa: audit log, ART, admin, portal).
Se vazar:
1. Gerar novo `PMOC_JWT_SECRET` e novas `PMOC_ANON_KEY` / `PMOC_SERVICE_ROLE_KEY`
   (mesmo procedimento da instalação) em `~/docker/.env`.
2. `docker compose up -d pmoc-auth pmoc-rest` (todas as sessões caem — usuários
   entram de novo).
3. Atualizar `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` na
   Netlify e redeploy.
4. Revisar `audit_logs` e os logs (`docker logs pmoc_auth`, `pmoc_rest`,
   `pmoc_gateway`) por acesso anômalo.
Nunca commitar as chaves.

## 10. Arquivos (ART)

PDFs de ART ficam na tabela `art_files` (RLS ligado, sem policy — só o service
role lê/escreve). Conferir que nenhuma migration futura crie policy nela.

## 11. CORS da API

Só as origens do site podem chamar a API pelo navegador — `map` no início de
`~/docker/pmoc/gateway.conf` (`https://www.seupmoc.com.br` e
`https://seupmoc.com.br`). Domínio novo do front (ou preview da Netlify) precisa
ser adicionado lá + `docker exec pmoc_gateway nginx -s reload`.

## 12. LGPD — jurídico

- Preencher e revisar `/termos` e `/privacidade` (estão como rascunho).
- Assinar um **DPA** (contrato de tratamento de dados) com cada cliente —
  modelo em `LEGAL/DPA-modelo.md`.
- Nomear um encarregado (DPO) e publicar o contato.
- Manter a lista de sub-operadores atualizada: Netlify (site), Cloudflare
  (túnel/rede), Microsoft OneDrive (cópia de backup), gateway de pagamento,
  provedor de e-mail/SMTP.

## Checklist de ativação

- [x] Confirmação de e-mail ligada (autoconfirm desligado no GoTrue)
- [ ] SMTP configurado (+ SPF/DKIM)
- [ ] Turnstile: site key na Netlify + secret no GoTrue + CSP liberada
- [x] Rate limit de auth por IP real (`CF-Connecting-IP`)
- [ ] Restauração de backup testada
- [ ] Criptografia em repouso (disco e/ou backups)
- [ ] Sentry instalado e com DSN
- [ ] Termos e Privacidade revisados por advogado
- [ ] DPA pronto para assinatura
- [x] `scripts/test-rls.mjs` verde contra o backend auto-hospedado
