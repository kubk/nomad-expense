# Expense Tracker Frontend

This is a React-based expense tracking application built with TypeScript, Tailwind CSS, and shadcn/ui components.

### Development Commands

```bash
pnpm run start      # Start dev server
pnpm run build      # Build for production
pnpm run typecheck  # TypeScript type checking
```

### Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI component library
- **Lucide React** - Icons
- **Vite** - Build tool

### Component Guidelines

- Each screen component receives props from the main container
- Utility functions are separated for reusability
- Types are centralized for consistency
- Data is mocked but structured for easy API integration

### **IMPORTANT: Money Handling Architecture**
- **Storage**: All amounts stored as integers in cents (e.g., $1.23 = 123 cents)
- **Calculations**: All math operations work with cents only (no decimal divisions)
- **Never**: Divide by 100 in business logic, calculations, or data processing
- **Never**: Multiply by 100 after initial data generation - amounts stay in cents throughout

## 🎨 Styling with Tailwind CSS v4

### Design System
- Shadcn. Prefer installing missing shadcn components instead of writing shadcn code from scratch
- **Class Names**: Always use the `cn` utility from `@/lib/utils` for combining class names instead of template literals or string concatenation
- Avoid hardcoding colors when possible, use shadcn tokens instead
- **Dark/Light Mode**: Always use shadcn color tokens (e.g., `bg-muted`, `text-foreground`, `bg-primary`, `text-primary-foreground`) instead of hardcoded colors to ensure proper dark/light mode support
- **Tailwind vs Inline**: Prefer Tailwind classes over inline styles when possible
- The component definition should be like this:
```jsx
export function Component({
  prop1,
}: {
  prop1: string;
}) {
  return ...
}
```
- **Icons**: Lucide React (use for all icons), import them ending with "Icon", so "XIcon" is good, "X" is bad
- Don't add any screen reader code
- It's Vite SPA, never use 'use client'
- **UI Copy**: Use sentence case for titles and labels, not Title Case

## 📁 Frontend Folder Structure

### Core Folders (Shadcn UI)
- `components/` - Shadcn UI components only. Keep shadcn separate from our custom code
- `lib/` - Shadcn utilities (e.g., `utils.ts` with `cn` function)

### Application Structure
- `pages/` - All application pages organized by feature:
  - `accounts/` - Accounts page and related components
  - `transactions/` - Transactions page and related components
  - `overview/` - Overview page and related components
  - `settings/` - Settings page and related components
  - `widgets/` - Components reused across multiple pages

### Shared Resources
- `shared/` - Reusable functions and logic (NOT UI components)
  - API utilities, providers, routing helpers, etc.

## State and Data Fetching (MobX + mobx-query-lite)

- **MobX stores** own state: global singletons live in `src/store/` (and `routerStore`, `translationStore`); screen-local stores are classes next to their screen, created with `useState(() => new SomeStore())` and passed as `store={store}`
- Stores call `makeAutoObservable(this, {}, { autoBind: true })`. Components read stores directly instead of receiving store values through props, and change state only through store methods
- `mobx-react-plugin` (see `vite.config.ts`) wraps every component in `observer` and turns `async` store methods into flows, so never add `observer` or `runInAction` by hand
- **Queries**: `makeQuery(apiProxy.<router>.<procedure>.query(input?))` from `@/shared/api`; reading `query.data` from a component fetches stale data automatically, so no `useEffect` loading
- **Mutations**: `makeMutation(api.<router>.<procedure>.mutate)`, then `query.invalidate()` (never `refetch()`). Use `invalidateQueries({ key: ["expenses", "overview"] })` from `mobx-query-lite` to invalidate a procedure for every input (keys are the procedure path segments followed by the input, matched by prefix)
- **Forms**: screen stores hold a `form` object of `mobx-form-lite` fields (`TextField`, `BooleanField`) and components bind to `field.value` / `field.onChange` instead of per-field setters. Validate with the field's `validate` option (shared validators in `@/shared/validators`) and `isFormValid(form)` instead of hand-written checks, read values with `formToPlain(form)`, use `afterChange` for side effects such as haptics and `formReset` to discard edits
- **Mutate observables in place**: push, splice or assign a property instead of rebuilding objects with spreads, and don't reach for `observable.ref` to make that work. Copy (`.slice()`) only when a draft must not edit the source it starts from

## Date/Time Handling

- **Library**: Use Luxon for all date/time operations
- **Keep it simple**: Avoid complex date manipulations when possible
- **ISO format**: Always work with ISO strings for API communication
- **Parse once**: Convert to Luxon DateTime objects early, work with them, convert back to ISO at the end
