import { MonthlyData, Transaction, DateRange, Account } from "./types";
import { useCurrency } from "./currency-context";
import { currencyService } from "./currency-service";
import { MonthlyBreakdownOverview } from "./monthly-breakdown-overview";
import { RecentTransactionsOverview } from "./recent-transactions-overview";
import { OverviewHeader } from "./overview-header";

export function OverviewScreen({
  monthlyData,
  transactions,
  accounts,
  setCurrentScreen,
  setDateRange,
  setSelectedAccount,
}: {
  monthlyData: MonthlyData[];
  transactions: Transaction[];
  accounts: Account[];
  setCurrentScreen: (screen: string) => void;
  setDateRange: (range: DateRange) => void;
  setSelectedAccount: (account: string) => void;
}) {
  const { baseCurrency } = useCurrency();

  // Convert monthly data amounts to base currency
  const convertedMonthlyData = monthlyData.map((month) => ({
    ...month,
    convertedAmount: currencyService.convert(month.amount, "USD", baseCurrency),
  }));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <OverviewHeader
        convertedMonthlyData={convertedMonthlyData}
        baseCurrency={baseCurrency}
      />

      <MonthlyBreakdownOverview
        monthlyData={monthlyData}
        setCurrentScreen={setCurrentScreen}
        setDateRange={setDateRange}
        setSelectedAccount={setSelectedAccount}
      />

      <RecentTransactionsOverview
        transactions={transactions}
        accounts={accounts}
        setCurrentScreen={setCurrentScreen}
      />
    </div>
  );
}
