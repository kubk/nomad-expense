// THIS FILE SHOULD BE ELIMINATED, WE SHOULD USE INFERRED TYPES FROM TRPC instead (shared.ts on backend)

export interface Account {
  id: string;
  name: string;
  currency: string;
  color: string;
}

export interface MonthlyData {
  month: string;
  shortMonth: string;
  amount: number;
  year: number;
  account?: string;
}

export interface Transaction {
  id: string;
  desc: string;
  amount: number;
  currency: string;
  usd: number;
  date: string;
  account: string;
  month: string;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface ExpenseTrackerState {
  currentScreen: Route;
  selectedAccount: string;
  dateRange: DateRange;
  showFilters: boolean;
  selectedMonth: MonthlyData | null;
}

export type Route =
  | "overview"
  | "transactions"
  | "monthly-breakdown-full"
  | "accounts"
  | "settings";
