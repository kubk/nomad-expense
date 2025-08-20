import { CurrencyProvider } from "./shared/currency-context";
import { ExpenseTracker } from "./pages/layout/expense-tracker";

export function App() {
  return (
    <CurrencyProvider>
      <ExpenseTracker />
    </CurrencyProvider>
  );
}
