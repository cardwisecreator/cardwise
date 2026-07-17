# PerkLah — Singapore card decision platform

PerkLah recommends the best eligible Singapore card or merchant offer for a purchase. It is a mobile-first Next.js site, an Expo mobile client, a shared rules engine and a Prisma/Postgres data layer.

## One-time deployment

1. Create a new GitHub repository and push this folder.
2. Create a free [Neon](https://neon.tech) Postgres database and copy its connection string.
3. Import the GitHub repository in Vercel. Add every variable in `.env.example`, replacing values.
4. In Vercel, run `pnpm db:push` then `pnpm db:seed` once from a local terminal or Vercel's build/deployment command. Deploy.
5. Visit `/admin`, sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then replace the seed records with reviewed bank terms.

The app has no credentials for user accounts in this MVP; it uses an email/phone lead gate before personal recommendation saving. Before production, connect the provided schema to Auth.js, Clerk or Supabase Auth and add a consent/privacy flow (PDPA).

## Commands

```bash
corepack enable
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

Web: `http://localhost:3000`. Mobile: `cd apps/mobile && pnpm start`.

## Data operations

Only publish official, human-reviewed terms. `/api/admin/imports/sync` creates review-queue entries from configured source URLs; it deliberately does **not** scrape or auto-publish bank sites. Banks change rewards and may prohibit automated collection. The scheduled endpoint requires `Authorization: Bearer $CRON_SECRET`.

Seeded promotions are examples with source URLs and expiry dates; cards always display their source/last-reviewed date. Check issuer terms immediately before publishing or recommending a promotion.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon / Postgres connection URL |
| `NEXTAUTH_SECRET` | Future Auth.js session secret |
| `NEXTAUTH_URL` | Canonical web URL |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Basic MVP admin access values |
| `CRON_SECRET` | Protects the scheduled import-review endpoint |

## Architecture

- `apps/web`: Vercel Next.js site, API routes and admin console
- `apps/mobile`: Expo app using the same recommendation function
- `packages/rewards`: dependency-free, testable recommendation logic
- `packages/db`: Prisma schema and seed data

## Legal / product checklist before launch

Add a privacy notice, explicit marketing consent, data-retention policy, user account deletion, issuer trademarks disclaimer, cookie consent, rate limiting, audit logs and a legal review of banking/financial-advice obligations. Do not collect card numbers or bank credentials.
