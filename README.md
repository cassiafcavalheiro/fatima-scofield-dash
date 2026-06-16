# Larroudé · Dashboard Meta Ads

Dashboard de performance Meta Ads para **Larroudé US** e **Larroudé BR** (2 contas por região: Main + Pre-Order). Layout inspirado em `larroude-dashboard-performance.vercel.app` e replicando os gráficos do PDF do Looker Studio.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** com paleta Larroudé (lilás/roxo)
- **Recharts** para os gráficos
- **Meta Marketing API v20.0** (auto-discovery de Account IDs por nome)

## Estrutura

```
app/
  api/
    accounts/route.ts     # GET /api/accounts — lista contas resolvidas por região
    dashboard/route.ts    # GET /api/dashboard?region=US&period=28d — payload completo
  globals.css
  layout.tsx
  page.tsx                # Dashboard principal
components/
  Header.tsx              # Seletor US/BR + período + refresh
  KpiCard.tsx             # KPI com delta % vs período anterior
  Funnel.tsx              # LP views → ATC → Checkout → Purchases
  GenderDonut.tsx
  CampaignsTable.tsx
  AdsTable.tsx            # Creative performance
  PerformanceByAge.tsx
  charts/
    SpendVsRevenue.tsx
    TimeSeriesArea.tsx    # Clicks, CTR, CPC, Impressions, ROAS
    ScatterRoas.tsx       # Spend × ROAS
    AgeGroupBar.tsx
    ReachFrequency.tsx
    MonthlyRoas.tsx
    ObjectiveSpend.tsx
    BarRanking.tsx        # Top Campaigns / High CPC / Top Ads
    RegionMap.tsx
lib/
  meta-ads.ts             # Cliente Meta Marketing API
  aggregator.ts           # Agrega as 2 contas por região, monta o payload
  types.ts
  format.ts               # Currency/number/percent formatters (USD vs BRL)
  dates.ts                # Períodos relativos, comparativos
  cn.ts
```

## Setup local (PowerShell)

```powershell
# 1. Instalar dependências
npm install

# 2. Garantir .env (já está na raiz, NÃO commitar)
#    Variáveis usadas:
#      META_ACCESS_TOKEN        (obrigatório)
#      META_API_VERSION         (default: v20.0)
#      META_ACCOUNT_US_MAIN     (opcional - se omitido, descobre por nome)
#      META_ACCOUNT_US_PREORDER (opcional)
#      META_ACCOUNT_BR_MAIN     (opcional)
#      META_ACCOUNT_BR_PREORDER (opcional)

# 3. Rodar em modo dev
npm run dev
# → http://localhost:3000

# 4. (Diagnóstico) Verificar quais contas o token resolve
# Abrir no navegador: http://localhost:3000/api/accounts
```

## Identificação das contas

O sistema descobre automaticamente as 4 ad accounts pelo nome:

| Região | Conta principal | Pre-Order |
|--------|------------------|-----------|
| **US** | `Larroudé US`    | `PRE-ORDER US` |
| **BR** | `Larroudé BR`    | `Larroudé BR Pre-Order` |

Se quiser fixar IDs explicitamente, preencha `META_ACCOUNT_US_MAIN` etc. no `.env` com `act_XXXXXXXX`.

## Deploy na Vercel (PowerShell)

```powershell
# 1. Criar repositório novo no GitHub (via gh CLI ou web)
# Via gh CLI:
gh repo create larroude-dash-meta --private --source=. --remote=origin

# 2. Git init + primeiro commit
git init
git branch -M main
git add .
git commit -m "feat: initial dashboard Meta Ads Larroudé US/BR"
git push -u origin main

# 3. Instalar Vercel CLI (uma vez)
npm i -g vercel

# 4. Login (uma vez)
vercel login

# 5. Linkar projeto + deploy
vercel link
vercel env add META_ACCESS_TOKEN        # cole o token, marque para Production + Preview + Development
vercel env add META_API_VERSION         # opcional: v20.0
vercel env add META_ACCOUNT_US_MAIN     # opcional
vercel env add META_ACCOUNT_US_PREORDER # opcional
vercel env add META_ACCOUNT_BR_MAIN     # opcional
vercel env add META_ACCOUNT_BR_PREORDER # opcional

# 6. Deploy
vercel --prod
```

Em deploys subsequentes, basta `git push` na branch `main`.

## Endpoints

- `GET /api/dashboard?region=US&period=28d` — payload completo (KPIs, séries, tabelas)
- `GET /api/accounts` — debug das contas resolvidas pelo token

## Períodos suportados

`7d`, `14d`, `28d` (default), `3M`, `6M`, `12M` — sempre comparados com o período imediatamente anterior de mesma duração.

## Notas sobre os dados

O ROAS, Conversion Rate e o funil usam os action types padrão do pixel da Meta:

- `landing_page_view`
- `offsite_conversion.fb_pixel_add_to_cart`
- `offsite_conversion.fb_pixel_initiate_checkout`
- `offsite_conversion.fb_pixel_purchase` → também é a base de revenue (`action_values`)

Se a Larroudé usa **Conversions API server-side** ou eventos custom, basta editar as constantes em `lib/meta-ads.ts` → `ACTION_TYPES`.
