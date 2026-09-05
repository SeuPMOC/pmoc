# SeuPMOC

SaaS multi-tenant para prestadores de serviço de climatização emitirem e
gerenciarem o **Plano de Manutenção, Operação e Controle** (Lei 13.589/2018,
Portaria MS 3.523/1998, ABNT NBR 13971, RE ANVISA 09/2003).

## Stack

- **Next.js 16** (App Router) — UI + API num deploy só
- **Supabase** — Postgres + Auth + Row Level Security (multi-tenant) + Storage
- **@react-pdf/renderer** + **pdf-lib** — PMOC/planilha em PDF, ART anexada
- Deploy: **Vercel** ou **Netlify** (`netlify.toml` incluído, plugin `@netlify/plugin-nextjs`)

## Setup

1. Crie um projeto no [Supabase](https://supabase.com).
2. Em **SQL Editor**, rode `supabase/migrations/0001_init.sql`.
3. Em **Authentication > Providers**, deixe *Email* habilitado. Para testes,
   desligue *Confirm email*.
4. Rode também `0002_client_portal.sql`, `0003_equipment_types.sql` e
   `0004_art.sql` (cria o bucket de storage `art`).
5. `cp .env.example .env.local` e preencha as 3 chaves (Settings > API):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e
   `SUPABASE_SERVICE_ROLE_KEY` (esta última só server-side, cria os logins do portal).
6. `npm install && npm run dev` → http://localhost:3000

## Deploy no Netlify

1. Push do repo pro GitHub, "Add new site" → importa o repo.
2. O repositório é a pasta `pmoc-app` (é onde está o `.git`). Base directory em
   branco. Build: `npm run build` (o `netlify.toml` já define isso e o plugin Next).
3. Site settings → Environment variables: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
4. No Supabase → Authentication → URL Configuration: adicione a URL do site do
   Netlify em *Site URL* e *Redirect URLs*.
5. Deploy. As rotas de PDF viram Netlify Functions (Node) automaticamente.

O primeiro cadastro cria a organização (trigger `handle_new_user`) e o usuário
vira `owner`.

## Modelo de dados

```
organization (prestador)
 └── client (estabelecimento)        ← cliente final pode ter login (role='client')
      ├── unit (ambiente)
      ├── equipment (inventário AVAC)
      │    └── maintenance_plan_item (o que fazer + periodicidade)
      ├── maintenance_order (execução / OS + fotos)
      ├── air_quality_reading (RE 09/2003)
      ├── pmoc_document (snapshot imutável + PDF)
      └── invoice (cobrança org → client)
```

Tudo isolado por `org_id` via RLS.

### Catálogo de equipamentos (`src/lib/pmoc/catalogo.ts`)

61 tipos em 10 categorias (DX, água gelada, rejeição de calor, bombas,
ventilação/exaustão, tratamento e distribuição de ar, aquecimento, hidráulica
AVAC, elétrica e controle — QGBT/QDG/QD-AC/CCM/inversor/BMS —, suprimento e
apoio — gerador/nobreak/QTA). Cada tipo gera um plano de manutenção automático:
equipamento que trata ar herda o plano mínimo da Portaria 3.523/98 + RE 09/2003
+ higienização NBR 14679; os demais recebem só o plano específico (NBR 13971,
16401-3, 14518, 14880, 5410, NR-10, NR-13, ISO 8528…). `equipment.tipo` é `text`
livre — a lista canônica é o catálogo, não um enum.

Sanidade: `node --experimental-strip-types src/lib/pmoc/catalogo.test.mjs`

## O que já funciona

- Auth + multi-tenancy (RLS)
- Schema completo
- Catálogo de atividades PMOC por tipo de equipamento
- **Clientes**: cadastro/edição (`/clientes`)
- **Equipamentos**: cadastro + "aplicar plano de manutenção padrão" por tipo
- **Ambientes**, **responsáveis técnicos**, **execuções** e **laudos de
  qualidade do ar** (com cálculo automático de conformidade RE 09/2003)
- **Emitir PMOC**: checklist de prontidão + gera snapshot versionado + PDF
- **Cobrança**: CRUD de faturas, marcar pago/cancelar, link de pagamento (`/cobranca`)
- Dashboard de conformidade (atrasos, agendadas, cobrança vencida)
### Fluxo principal (um caminho linear por cliente)

A empresa prestadora (org) faz tudo. Não há login para o estabelecimento.

1. `/empresa` — dados da empresa + responsáveis técnicos (uma vez).
2. `/clientes` — cadastra o estabelecimento.
3. `/clientes/[id]` — página em 4 passos com barra de progresso:
   **1** dados · **2** ambientes · **3** equipamentos (plano automático) ·
   **4** gerar documentos → **PMOC** (`/api/pmoc/[id]/pdf`) e
   **planilha de acompanhamento** (`/api/clientes/[id]/planilha/pdf?ano=&tecnico=`).
4. `/clientes/[id]/acompanhamento` — registrar execuções e laudos de ar (pós-emissão).
5. `/clientes/[id]/cronograma` — grade e geração das OS.

`checklistPmoc` (`src/lib/pmoc/checklist.ts`) mostra o que falta no passo 4.

**ART por PMOC** (`0004_art.sql`): cada `pmoc_documents` tem `art_numero`,
`art_registrada_em` e `art_path` (PDF no bucket `art`, privado). No passo 4, cada
PMOC emitido tem um mini-form para nº + data + arquivo (`anexarArt`). A rota
`/api/pmoc/[id]/pdf` injeta o nº da ART na seção 3 e, com `pdf-lib`, anexa as
páginas do PDF da ART ao fim do PMOC — um download só. Upload/download pelo
service role (`supabaseAdmin`).

Planilha de acompanhamento: `src/lib/pmoc/planilha.tsx` (documento em paisagem,
uma tabela por equipamento com atividade × 12 meses, ○ = previsto). Compartilha
`src/lib/pmoc/pdf-cronograma.tsx` com a página de cronograma do PMOC.

`/portal/*` + `portal-actions.ts` ficam no repo mas **fora do fluxo** (sem UI de
convite) — reativar se um dia o estabelecimento for preencher os próprios dados.

### Cronograma anual (`src/lib/pmoc/cronograma.ts`)

`mesesPrevistos(periodicidade, mesInicio)` → meses em que a atividade cai;
`cronogramaEquipamento(plano, mesInicio)` → matriz de 12 meses por atividade.
Página `/clientes/[id]/cronograma`: uma tabela por equipamento (atividade ×
Jan–Dez), botão "Gerar ordens de serviço dos 12 meses" (`gerarOrdensDoAno`,
idempotente) que cria as OS agendadas — alimentam o painel de conformidade. O
PDF do PMOC traz o cronograma numa página em paisagem para impressão/assinatura.
Sanidade: `node --experimental-strip-types src/lib/pmoc/cronograma.test.mjs`

### Dados demo

`node --experimental-strip-types scripts/seed-demo.mjs seu@email.com` popula a
conta desse usuário (precisa existir — cadastre em `/login`) com 1 responsável
técnico + 5 estabelecimentos completos (ambientes, equipamentos de vários tipos
incl. chiller/torre/bomba/QGBT/gerador, planos automáticos, OS passadas e
futuras, e 2 PMOCs com ART). Usa `SUPABASE_SERVICE_ROLE_KEY` do `.env.local`.

## Roadmap

| Módulo | Falta |
|---|---|
| Alertas | e-mail/WhatsApp de OS vencida (cron sobre as OS já geradas) |
| Execução | upload de fotos (Supabase Storage) + assinatura do cliente |
| Cobrança | integração de pagamento (Asaas/Stripe/Pix) — hoje é link manual |
| Notificações | e-mail/WhatsApp de manutenção vencida e fatura a vencer |
| PDF | persistir em Storage p/ link estável (hoje renderiza on-demand) |

`ponytail:` PDF sem upload p/ Storage — renderiza on-demand a partir de
`dados_json`. Adicionar persistência em Storage quando precisar de link estável
para o cliente.
