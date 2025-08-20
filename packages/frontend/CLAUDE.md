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