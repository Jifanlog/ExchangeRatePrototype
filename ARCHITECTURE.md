# Exchange Rate Prototype - Architecture & Data Flow

## Overview

This application fetches USD-based exchange rates from a third-party API, caches them (Redis + in-memory backup), and computes cross-currency rates for display and conversion.

---

## Data Flow Diagram

```
External API (exchangerate-api.com)
         │
         ▼
[refreshUsdRatesNow()] ──► Redis Cache ──► Backup Cache (in-memory)
         │                                       │
         │                                       │
         └───────────────────────────────────────┘
                         │
                         ▼
              [fetchUsdRatesCached()]
                         │
                         ├──► /api/rates (GET) ──► Client Components
                         │
                         └──► app/page.tsx (Server Component)
```

---

## Core Components

### 1. Server-Side Rate Management (`lib/rates-server.ts`)

**Primary Functions:**

- **`fetchUsdRatesCached()`**: Retrieves cached exchange rates
  - Checks Redis first (if `REDIS_URL` is configured)
  - Falls back to in-memory backup cache (max age: 24 hours)
  - Throws error if no valid cache exists
  - Logs cache hits/misses for monitoring

- **`refreshUsdRatesNow()`**: Forces a fresh fetch from third-party API
  - Calls: `https://v6.exchangerate-api.com/v6/be7da88391f18267cf7b9541/latest/USD`
  - Maps `conversion_rates` to `UsdRates` format with `USD: 1`
  - Updates both Redis (if available) and in-memory backup cache
  - Returns fresh rate data

**Caching Strategy:**
- **Primary**: Redis (if `REDIS_URL` environment variable is set)
- **Fallback**: In-memory backup cache with 24-hour maximum age
- **Error Handling**: Graceful degradation - runs without Redis if unavailable

---

### 2. Client-Side Rate Computation (`lib/rates-client.ts`)

**Functions:**

- **`computeCrossRate(from, to, usdRates)`**: Calculates exchange rate between any two currencies
  - Formula: `Rate(A→B) = Rate(USD→B) / Rate(USD→A)`
  - Returns `1` if `from === to`
  - Throws error if missing rate data for either currency

- **`computeAllCrossRates(usdRates)`**: Generates N×N matrix of all currency pairs
  - Creates keys in format: `${base}_${quote}`
  - Computes all possible combinations
  - Logs total number of computed rates

**Type Definitions:**
- `UsdRates = Record<string,-pnumber> & { USD: 1 }`

---

### 3. API Routes

#### GET `/api/rates` (`app/api/rates/route.ts`)
- **Purpose**: Retrieve cached USD rates for client components
- **Response**: `{ base: "USD", rates: Record<string, number> }`
- **Error Handling**: Returns 500 with error message if cache unavailable

#### POST `/api/rates/refresh` (`app/api/rates/refresh/route.ts`)
- **Purpose**: Manually trigger rate refresh from third-party API
- **Authentication**: Requires `Authorization: Bearer <RATES_REFRESH_SECRET>` header
- **Response**: `{ ok: true, count: number }` (number of currencies)
- **Error Handling**: Returns 401 if unauthorized, 500 on refresh failure

---

### 4. UI Components

#### Server Component: `app/page.tsx`
- **Renders**: Table of all USD→Code base rates
- **Data Source**: Directly calls `fetchUsdRatesCached()` during server-side rendering
- **Shows**: Currency code and USD conversion rate (6 decimal precision)

#### Client Component: `app/components/Converter.tsx`
- **Purpose**: Interactive currency converter
- **Behavior**:
  - Fetches `/api/rates` on mount
  - Stores USD rates in state
  - Computes cross-rates on-the-fly as user changes `from`/`to` currencies
  - Displays conversion result in real-time
- **Features**: Swap button (⇄) to reverse currency pair

#### Client Component: `app/components/RateMatrix.tsx`
- **Purpose**: Display comprehensive N×N exchange rate matrix
- **Behavior**:
  - Fetches `/api/rates` on mount
  - Computes all cross-rates using `computeAllCrossRates()`
  - Renders table with all currency pairs
  - Supports currency filtering (show selected currencies only)
- **Features**:
  - "Refresh Rates" button (re-fetches `/api/rates` - does NOT trigger server refresh)
  - "Show All" / "Clear Selection" buttons
  - Visual indicators: Blue for same currency (rate = 1), Green for direct USD rates

---

## Scheduled Refresh

**Configuration**: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/rates/refresh",
      "schedule": "0 6,18 * * *"  // Daily at 6:00 AM and 6:00 PM UTC
    }
  ]
}
```

**Important Note**: The scheduled cron job calls `/api/rates/refresh`, which requires authentication. Ensure your Vercel cron configuration includes the `Authorization: Bearer <RATES_REFRESH_SECRET>` header, or modify the endpoint to accept cron requests without this header check.

---

## Environment Variables

### Required:
- **`RATES_REFRESH_SECRET`**: Bearer token for `/api/rates/refresh` endpoint authentication

### Optional:
- **`REDIS_URL`**: Redis connection string. If not provided, application runs with in-memory backup cache only

---

## User Flow

### 1. Initial Page Load
```
User visits homepage
    ↓
Server renders page.tsx
    ↓
Calls fetchUsdRatesCached()
    ↓
Returns cached rates → Displays USD base rates table
    ↓
Client components mount → Fetch /api/rates
    ↓
Converter & RateMatrix display with rate data
```

### 2. Scheduled Refresh (Automatic)
```
Vercel Cron (06:00 / 18:00 UTC)
    ↓
POST /api/rates/refresh (with Bearer token)
    ↓
refreshUsdRatesNow() executes
    ↓
Fetches fresh data from exchangerate-api.com
    ↓
Updates Redis + backup cache
```

### 3. Manual Refresh (From UI)
```
User clicks "Refresh Rates" in RateMatrix
    ↓
Client re-fetches GET /api/rates
    ↓
Gets latest cached rates (from Redis or backup)
    ↓
Updates UI with current cached data
```

**Note**: The "Refresh Rates" button in the UI does NOT trigger a server-side refresh. It only re-fetches the currently cached data. To trigger an actual refresh, you would need to call POST `/api/rates/refresh` with authentication.

---

## Error Handling

### Cache Unavailable
- If `fetchUsdRatesCached()` finds no valid cache (Redis empty AND backup cache expired/missing):
  - Throws: `"No exchange rate data available. Please check scheduled refresh."`
  - GET `/api/rates` returns 500 error
  - Client components show error/loading states

### Redis Connection Failure
- Application continues with in-memory backup cache
- Logs connection failure but doesn't crash
- Fallback ensures application remains functional

### Third-Party API Failure
- `refreshUsdRatesNow()` throws error if API call fails
- Existing cached data remains available until next successful refresh
- Error is returned to caller (logged in refresh endpoint)

---

## Rate Computation Formula

All cross-currency rates are computed using USD as the base currency:

```
Given:
- USD → Currency A = Rate_A
- USD → Currency B = Rate_B

Then:
Currency A → Currency B = Rate_B / Rate_A

Example:
- USD → EUR = 0.85
- USD → GBP = 0.75
- EUR → GBP = 0.75 / 0.85 = 0.8824
```

This ensures consistency across all currency pairs since they all reference the same base (USD).

---

## Monitoring & Logging

The application logs key events:

- **Cache Hits/Misses**: Redis cache status
- **Backup Cache Usage**: When backup cache is served (with age in minutes)
- **Refresh Operations**: Start time, response status, duration
- **Connection Failures**: Redis connection issues (non-fatal)
- **Total Cross Rates**: Number of computed cross-rate pairs

All logs include ISO timestamps for tracking.

---

## Future Improvements

Consider:
1. Adding TTL to Redis cache entries
2. Implementing cache invalidation strategy
3. Adding retry logic for third-party API calls
4. Rate limiting on refresh endpoint
5. Webhook support for real-time updates
6. Historical rate tracking/storage
7. Client-side refresh button that actually triggers server refresh

