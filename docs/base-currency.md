# Base Currency

The base currency feature allows families to choose which currency is used for aggregating and displaying transaction totals.

## How it works

1. **Storage**: Each user has a `baseCurrency` field (default: USD). All users in the same family share the same base currency - when one user changes it, all family members are updated.

2. **Exchange rates**: When a transaction is created or updated, the system fetches live exchange rates from the [fawazahmed0/currency-api](https://github.com/fawazahmed0/exchange-api) using the transaction's date. This ensures historical accuracy.

3. **Fallback**: The API has two endpoints - jsDelivr CDN (primary) and Cloudflare Pages (fallback). If the primary fails, the system automatically tries the fallback.

4. **Transaction amounts**: Each transaction stores:
   - `amount`: Original amount in the account's currency (in cents)
   - `currency`: The account's currency
   - `usdAmount`: Converted amount in the family's base currency (in cents) - the column name is historical, it now stores the base currency amount

## Changing base currency

When a user changes the base currency in settings:

1. The `baseCurrency` field is updated for all family members
2. All existing transactions are recalculated using historical exchange rates for each transaction's date
3. The frontend shows a warning that this operation may take time

## API endpoints

- `family.getBaseCurrency` - Returns the current base currency
- `family.updateBaseCurrency` - Updates base currency and recalculates all transactions

## Files

- `packages/api/src/services/money/exchange-rate-api.ts` - Exchange rate fetching with fallback
- `packages/api/src/services/money/money.ts` - Money conversion functions
- `packages/api/src/db/user/get-family-base-currency.ts` - Helper to get family's base currency
- `packages/api/src/api/family-router.ts` - API endpoints
- `packages/frontend/src/pages/settings/base-currency-setting.tsx` - Settings UI

## Tests

- `packages/api/src/services/money/exchange-rate-api.test.ts` - Real API calls with snapshot assertions
- `packages/api/src/api/family-router.test.ts` - Base currency endpoint tests (get, update, recalculate)
