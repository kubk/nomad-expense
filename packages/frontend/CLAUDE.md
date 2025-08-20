# Expense Tracker Frontend

This is a React-based expense tracking application built with TypeScript, Tailwind CSS, and shadcn/ui components.

## Project Structure

### Components Architecture

The main `ExpenseTracker` component has been split into smaller, focused components for better maintainability:

### Data Flow

- **State Management**: React useState hooks in main component
- **Data Filtering**: Utility functions handle transaction filtering by account and date
- **Props Passing**: Clean prop interfaces between components

### Development Commands

```bash
npm run start      # Start dev server
npm run build      # Build for production
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint code checking
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
- All components are properly typed with TypeScript interfaces

## Transaction System

### Amount Structure
- Transaction amounts are stored as integers representing cents (multiplied by 100)
- Negative amounts indicate expenses (e.g., -12000 = -$120.00)
- Positive amounts indicate income (e.g., 15000 = +$150.00)

### Display Logic
- **Expenses**: Show without minus sign, regular text color
- **Income**: Show with "+" prefix in green color
- **Totals**: Always show the sum of absolute values of expenses only (never negative, excludes income)

### Calculation Rules
- Summary totals should only include expenses (negative transactions) and show as positive numbers
- Income transactions (positive amounts) are excluded from total calculations
- Individual transaction display converts from cents to dollars (divided by 100)

### **IMPORTANT: Money Handling Architecture**
- **Storage**: All amounts stored as integers in cents (e.g., $1.23 = 123 cents)
- **Calculations**: All math operations work with cents only (no decimal divisions)
- **Display**: Division by 100 happens ONLY in `currencyService.formatAmount()` for rendering
- **Never**: Divide by 100 in business logic, calculations, or data processing
- **Never**: Multiply by 100 after initial data generation - amounts stay in cents throughout

## 🎨 Styling with Tailwind CSS v4

### Design System
- Shadcn
- **Class Names**: Always use the `cn` utility from `@/lib/utils` for combining class names instead of template literals or string concatenation
- Avoid hardcoding colors when possible, use shadcn tokens instead
- **Dark/Light Mode**: Always use shadcn color tokens (e.g., `bg-muted`, `text-foreground`, `bg-primary`, `text-primary-foreground`) instead of hardcoded colors to ensure proper dark/light mode support
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
