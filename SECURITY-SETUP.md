# Configuração de segurança — antes de comercializar

O código já cobre: anti-escalonamento de privilégio (RLS + triggers), isolamento
por organização, headers HTTP (CSP/HSTS/etc.), sanitização de input, rate limiting
nas rotas de PDF/export, audit log à prova de forja, soft delete + lixeira +
exclusão definitiva + exportação (LGPD), páginas de Termos e Privacidade.

Falta configurar (fora do repositório):

## 1. Confirmação de e-mail — OBRIGATÓRIO

Supabase → Authentication → Providers → Email → **ativar "Confirm email"**.
O app já bloqueia acesso de e-mail não confirmado (`/confirme-email`).
Sem isso, alguém cria conta com um e-mail que não é dele — inclusive um e-mail
que esteja em `PLATFORM_ADMIN_EMAILS`.

## 2. SMTP

Supabase → Authentication → Emails → **SMTP Settings**. Sem SMTP próprio, os
e-mails de confirmação/reset usam o servidor compartilhado do Supabase (limite
baixo, cai em spam). Use SES, Resend, Postmark ou similar.
Ajuste os templates (remetente, texto em PT-BR).

## 3. CAPTCHA (Cloudflare Turnstile)

1. Cloudflare → Turnstile → criar widget → pegar **Site Key** e **Secret Key**.
2. Supabase → Authentication → Attack Protection → **Enable Captcha** → Turnstile
   → colar a Secret Key.
3. Env do app: `NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site key>`.
   Com essa env presente, o login/cadastro passa a exigir o captcha.

## 4. Rate limiting

Já funciona via Postgres (`0009_rate_limit.sql`, tabela `rate_limits` + função
`bump_rate_limit`). Aplicado nas rotas de PDF (30/min por usuário) e export
(10 / 5 min). Para limitar login/signup, use o **Attack Protection** do próprio
Supabase (item 3) — ele já tem rate limit de auth embutido.

## 5. Backups

Supabase Free: backup diário retido por 7 dias, sem PITR.
**Antes de ter dado de cliente real, subir para o plano Pro** (PITR de 7–28 dias).
Testar a restauração pelo menos uma vez.

## 6. Monitoramento de erros (Sentry)

```
npm i @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```
Gate o `Sentry.init` em `process.env.NEXT_PUBLIC_SENTRY_DSN` para não rodar em
dev. Configurar alerta para erros 5xx e para picos de 401/403/429.

## 7. HTTPS

Netlify já serve HTTPS e o `Strict-Transport-Security` está nos headers.
Confirmar que não há link `http://` fixo em lugar nenhum.

## 8. Rotação da `SUPABASE_SERVICE_ROLE_KEY`

É a chave mais poderosa (ignora RLS). Se vazar:
1. Supabase → Settings → API → **Reset service_role key**.
2. Atualizar a env no Netlify e redeploy.
3. Revisar o audit log e os logs do Supabase por acesso anômalo.
Nunca commitar a chave; nunca usar em código de cliente (só nas rotas/actions do
servidor — hoje só `src/lib/supabase/admin.ts`).

## 9. Storage

Bucket `art` é privado, sem policy pública — só o service role lê/escreve.
Confirmar em Supabase → Storage que ele **não** está marcado como público.

## 10. LGPD — jurídico

- Preencher e revisar `/termos` e `/privacidade` (estão como rascunho).
- Assinar um **DPA** (contrato de tratamento de dados) com cada cliente —
  modelo em `LEGAL/DPA-modelo.md`.
- Nomear um encarregado (DPO) e publicar o contato.
- Manter a lista de sub-operadores (Supabase, Netlify, gateway, SMTP) atualizada.

## Checklist de ativação

- [ ] "Confirm email" ligado no Supabase
- [ ] SMTP próprio configurado
- [ ] Turnstile: site key na env + secret key no Supabase
- [ ] Attack Protection (rate limit de auth) ligado
- [ ] Plano Supabase Pro (backups/PITR)
- [ ] Sentry instalado e com DSN
- [ ] Termos e Privacidade revisados por advogado
- [ ] DPA pronto para assinatura
- [ ] `scripts/test-rls.mjs` roda verde contra staging
