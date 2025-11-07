This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## How it works

- Base fetch is from `USD` only (using a public API for prototyping).
- Cross rate formula: rate(A→B) = rate(USD→B) / rate(USD→A).
- Caching uses Redis for 12 hours when `REDIS_URL` is set; otherwise it falls back to no Redis.

### API

- `GET /api/rates` → `{ base: "USD", rates: Record<code, number> }`.

### Helpers

- `lib/currencies.ts` (if present) can list available currencies.
- `lib/rates.ts` provides `fetchUsdRatesCached` and `computeCrossRate`.

### UI

- Homepage shows the cross-currency converter centered on the page.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Environment variables

If you want to use Redis caching, set `REDIS_URL`:

```bash
# examples
REDIS_URL=redis://localhost:6379
# or with password and TLS
REDIS_URL=rediss://:password@your-host:6380

# optional: secure refresh endpoint secret
RATES_REFRESH_SECRET=your-long-random-token
```

When `REDIS_URL` is not provided or Redis is unreachable, the app continues by fetching directly and serving fresh data on each miss.

### Scheduled refresh (no TTL mode)

You can remove Redis TTL and trigger a refresh twice per day via a cron hitting a secured endpoint:

```bash
curl -X POST \
  -H "Authorization: Bearer $RATES_REFRESH_SECRET" \
  https://your-host/api/rates/refresh
```

This endpoint forces a fresh fetch and overwrites Redis.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Storage strategy tradeoffs

- Store USD-only, compute cross on demand:
  - Pros: Minimal storage, simple ingest, consistent ratios.
  - Cons: Compute at read time; availability dependency on USD rates.

- Precompute and store all cross pairs:
  - Pros: Fast reads, no per-request math.
  - Cons: O(n^2) storage, invalidation complexity, risk of drift.

Recommendation: Keep USD-only plus short TTL caching; optionally cache hot cross pairs.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
