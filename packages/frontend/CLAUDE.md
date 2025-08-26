# Expense Tracker Frontend

This is a React-based expense tracking application built with TypeScript, Tailwind CSS, and shadcn/ui components.

### Development Commands

```bash
npm run start      # Start dev server
npm run build      # Build for production
npm run typecheck  # TypeScript type checking
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

## Transaction System

### Amount Structure
- Transaction amounts are stored as integers representing cents (multiplied by 100)

### Calculation Rules
- Summary totals should only include expenses
- Income transactions are excluded from total calculations
- Individual transaction display converts from cents to dollars (divided by 100)

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
- `hooks/` - Shadcn hooks only

### Application Structure
- `pages/` - All application pages organized by feature:
  - `accounts/` - Accounts page and related components
  - `transactions/` - Transactions page and related components
  - `overview/` - Overview page and related components
  - `settings/` - Settings page and related components

### Shared Resources
- `shared/` - Reusable functions and logic (NOT UI components)
  - API utilities, providers, routing helpers, etc.

## Date/Time Handling

- **Library**: Use Luxon for all date/time operations
- **Keep it simple**: Avoid complex date manipulations when possible
- **ISO format**: Always work with ISO strings for API communication
- **Parse once**: Convert to Luxon DateTime objects early, work with them, convert back to ISO at the end
