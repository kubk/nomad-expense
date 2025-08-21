import { RecentTransactionsOverview } from "./recent-transactions-overview";
import { OverviewHeader } from "./overview-header";
import { MonthlyBreakdownOverview } from "./monthly-breakdown-overview";
import { DateRange, MonthlyData, Transaction } from "@/shared/types";
import { currencyStore } from "@/store/currency-store";
import { convert } from "@/shared/currency-converter";

export function OverviewScreen({
  monthlyData,
  transactions,
  setDateRange,
  setSelectedAccount,
}: {
  monthlyData: MonthlyData[];
  transactions: Transaction[];
  setDateRange: (range: DateRange) => void;
  setSelectedAccount: (account: string) => void;
}) {
  // Convert monthly data amounts to base currency
  const convertedMonthlyData = monthlyData.map((month) => ({
    ...month,
    convertedAmount: convert(month.amount, "USD", currencyStore.baseCurrency),
  }));

  return (
    <div className="min-h-screen pb-20">
      <OverviewHeader convertedMonthlyData={convertedMonthlyData} />

      <MonthlyBreakdownOverview
        monthlyData={monthlyData}
        setDateRange={setDateRange}
        setSelectedAccount={setSelectedAccount}
      />

      <RecentTransactionsOverview transactions={transactions} />
    </div>
  );
}
