import { RecentTransactionsOverview } from "./recent-transactions-overview";
import { OverviewHeader } from "./overview-header";
import { MonthlyBreakdownOverview } from "./monthly-breakdown-overview";
import { Account, DateRange, MonthlyData, Transaction } from "@/shared/types";
import { useCurrency } from "@/shared/currency-context";
import { currencyService } from "@/shared/currency-service";

export function OverviewScreen({
  monthlyData,
  transactions,
  accounts,
  setDateRange,
  setSelectedAccount,
}: {
  monthlyData: MonthlyData[];
  transactions: Transaction[];
  accounts: Account[];
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
      <OverviewHeader convertedMonthlyData={convertedMonthlyData} />

      <MonthlyBreakdownOverview
        monthlyData={monthlyData}
        setDateRange={setDateRange}
        setSelectedAccount={setSelectedAccount}
      />

      <RecentTransactionsOverview
        transactions={transactions}
        accounts={accounts}
      />
    </div>
  );
}
