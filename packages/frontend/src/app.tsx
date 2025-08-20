import { CurrencyProvider } from "./shared/currency-context";
import { ExpenseTracker } from "./pages/layout/expense-tracker";
import { ThemeProvider } from "./components/theme-provider";

export function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <ExpenseTracker />
      </CurrencyProvider>
    </ThemeProvider>
  );
}
