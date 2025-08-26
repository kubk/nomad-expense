# Frontend Routing System

This document provides a comprehensive guide to the frontend routing system used in the expense tracker application.

## Overview

The application uses a type-safe routing system built on top of:
- **[wouter](https://github.com/molefrog/wouter)** - Minimalist routing library for React
- **[typesafe-routes](https://github.com/isaacgr/typesafe-routes)** - Type-safe route generation and parsing

## Architecture

### Route Definitions (`src/routes.ts`)

All application routes are defined in a centralized `routes.ts` file:

```typescript
import { createRoutes, param, str } from "typesafe-routes";
import type { TransactionFilters } from "api";

const transactionFilters = param({
  serialize: (value: TransactionFilters) => JSON.stringify(value),
  parse: (value: string) => JSON.parse(value) as TransactionFilters,
});

export const routes = createRoutes({
  overview: {
    path: [],
  },
  transactions: {
    path: ["transactions"],
    query: [transactionFilters("filters")],
  },
  accounts: {
    path: ["accounts"],
  },
  accountForm: {
    path: ["accounts", "form"],
    query: [str.optional("accountId")],
  },
  ...
});
```

### Router Configuration (`src/pages/layout/app.tsx`)

The main router is configured in the `App` component using wouter's `Router`, `Route`, and `Switch` components:

```typescript
import { Router, Route, Switch } from "wouter";
import { template } from "typesafe-routes";
import { routes } from "../../routes";

export function App() {
  return (
    <Router>
      <Switch>
        <Route path={template(routes.overview)}>
          <OverviewScreen />
        </Route>
        <Route path={template(routes.transactions)}>
          <TransactionsScreen />
        </Route>
        {/* ... other routes */}
      </Switch>
    </Router>
  );
}
```

## Route Types

### Simple Routes (No Parameters)

Routes without any parameters:

- `overview` → `/` (root path)
- `accounts` → `/accounts`
- `settings` → `/settings`

### Routes with Path Parameters

Currently, the application doesn't use URL path parameters. All dynamic data is passed through query parameters.

### Routes with Query Parameters

#### Optional String Parameters

Routes like `accountForm` and `transactionForm` use optional string query parameters:

```typescript
accountForm: {
  path: ["accounts", "form"],
  query: [str.optional("accountId")],
}
// Examples:
// /accounts/form (create new account)
// /accounts/form?accountId=123 (edit account with ID 123)
```

#### Complex Object Parameters

Routes like `transactions` and `monthlyBreakdownFull` use serialized object parameters:

```typescript
transactions: {
  path: ["transactions"],
  query: [transactionFilters("filters")],
}
// Example:
// /transactions?filters={"accounts":["123"],"date":{"type":"months","value":3}}
```

## Type-Safe Navigation

### Using `template()` for Static Routes

For routes without parameters, use the `template()` function:

```typescript
import { template } from "typesafe-routes";
import { routes } from "../../routes";

// Generate static path
const overviewPath = template(routes.overview); // "/"
const accountsPath = template(routes.accounts); // "/accounts"
```

### Using `render()` for Dynamic Routes

For routes with query parameters, use the `render()` function:

```typescript
import { render } from "typesafe-routes";
import { routes } from "../../routes";

// Navigate to account form for editing
navigate(render(routes.accountForm, {
  path: {},
  query: { accountId: "123" }
}));

// Navigate to transactions with filters
navigate(render(routes.transactions, {
  path: {},
  query: {
    filters: {
      accounts: ["123"],
      date: { type: "months", value: 3 }
    }
  }
}));
```

### Navigation Patterns

#### Using wouter's `useLocation` hook:

```typescript
import { useLocation } from "wouter";

const [, navigate] = useLocation();

// Navigate programmatically
navigate(render(routes.accounts, { path: {}, query: {} }));
```

#### Using wouter's `Link` component:

```typescript
import { Link } from "wouter";
import { template } from "typesafe-routes";

<Link href={template(routes.overview)}>
  Go to Overview
</Link>
```

## Query Parameter Parsing

### Parsing Query Parameters

Use `safeParseQuery()` to safely parse query parameters with full type safety:

```typescript
import { useSearch } from "wouter";
import { safeParseQuery } from "typesafe-routes";
import { routes } from "../../routes";

// In component
const parsedQuery = safeParseQuery(routes.transactions, useSearch());

if (parsedQuery.success) {
  // TypeScript knows parsedQuery.data has the correct shape
  const filters = parsedQuery.data.filters;
  console.log(filters.accounts); // string[]
  console.log(filters.date);     // DateFilter
} else {
  // Handle parsing failure - provide defaults
  const defaultFilters = {
    accounts: [],
    date: { type: "months", value: 3 }
  };
}
```

### Example: Transactions Screen Query Parsing

```typescript
export function TransactionsScreen() {
  const accountIds = useAccountIds();
  const parsedQuery = safeParseQuery(routes.transactions, useSearch());

  const filters: TransactionFilters = parsedQuery.success
    ? parsedQuery.data.filters
    : {
        accounts: accountIds,
        date: { type: "months", value: 3 },
      };

  // Use filters in API call
  const { data } = api.expenses.transactionsList.useQuery(filters);
}
```

## Custom Parameter Types

### Complex Object Serialization

For complex objects like `TransactionFilters`, define custom parameter serializers:

```typescript
const transactionFilters = param({
  serialize: (value: TransactionFilters) => JSON.stringify(value),
  parse: (value: string) => JSON.parse(value) as TransactionFilters,
});
```

This ensures that:
1. Complex objects are properly serialized to URL-safe strings
2. Deserialization maintains type safety
3. Invalid JSON gracefully fails parsing

## Navigation Patterns

### Conditional Navigation Bar

The navigation component conditionally renders based on current route:

```typescript
export function Navigation() {
  const [location] = useLocation();

  // Hide navigation on certain screens
  if (
    location === template(routes.monthlyBreakdownFull) ||
    location === template(routes.transactionForm) ||
    location === template(routes.accountForm) ||
    location === template(routes.invite)
  ) {
    return null;
  }

  // Render navigation items...
}
```

### Active Route Detection

Detect active routes for styling:

```typescript
const navItems = [
  { routeKey: "overview", route: routes.overview, icon: ChartNoAxesColumnIcon, label: "Overview" },
  { routeKey: "transactions", route: routes.transactions, icon: ListPlusIcon, label: "Transactions" },
];

navItems.map(({ route, label }) => {
  const path = template(route);
  const isActive = location === path;
  
  return (
    <Link
      href={path}
      className={isActive ? "text-primary bg-primary/5" : "text-muted-foreground"}
    >
      {label}
    </Link>
  );
});
```

## Best Practices

### 1. Centralized Route Definitions
- Keep all routes in `src/routes.ts`
- Use descriptive route names that match component purposes
- Group related routes logically

### 2. Type Safety First
- Always use `safeParseQuery()` for parsing query parameters
- Handle parsing failures gracefully with sensible defaults
- Use `render()` for routes with parameters, `template()` for static routes

### 3. Query Parameter Design
- Use optional parameters (`str.optional()`) for edit vs. create scenarios
- Serialize complex objects consistently (JSON for filters)
- Keep URLs readable when possible

### 4. Navigation Patterns
- Use `navigate()` for programmatic navigation
- Use `Link` components for user-triggered navigation
- Handle loading states during route transitions

### 5. Error Handling
```typescript
const parsedQuery = safeParseQuery(routes.transactions, useSearch());

const filters = parsedQuery.success
  ? parsedQuery.data.filters
  : getDefaultFilters(); // Always provide fallback
```

This routing system provides:
- ✅ Full type safety for routes and parameters  
- ✅ Centralized route management
- ✅ URL serialization for complex objects