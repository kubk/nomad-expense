import { ExpenseTracker } from "./pages/layout/expense-tracker";
import { ThemeProvider } from "./components/theme-provider";

export function App() {
  return (
    <ThemeProvider>
      <ExpenseTracker />
    </ThemeProvider>
  );
}
