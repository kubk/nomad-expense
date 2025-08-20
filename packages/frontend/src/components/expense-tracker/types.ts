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
}

export interface Transaction {
  id: string;
  desc: string;
  amount: number;
  currency: string;
  usd: number;
  date: string;
  account: string;
  category: string;
  month: string;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface ExpenseTrackerState {
  currentScreen: string;
  selectedAccount: string;
  dateRange: DateRange;
  showFilters: boolean;
  selectedMonth: MonthlyData | null;
}
