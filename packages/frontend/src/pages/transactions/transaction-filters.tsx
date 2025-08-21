import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Account, DateRange } from "../../shared/types";
import {
  getCurrencySymbol,
  SupportedCurrency,
} from "../../shared/currency-converter";

export function TransactionFilters({
  accounts,
  selectedAccount,
  dateRange,
  setSelectedAccount,
  setDateRange,
  setShowFilters,
}: {
  accounts: Account[];
  selectedAccount: string;
  dateRange: DateRange;
  setSelectedAccount: (account: string) => void;
  setDateRange: (range: DateRange) => void;
  setShowFilters: (show: boolean) => void;
}) {
  return (
    <div className="px-4 pb-4 border-t">
      <div className="space-y-3 mt-4">
        <div>
          <Label className="text-xs text-muted-foreground">Account</Label>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${acc.color} mr-2`} />
                    {acc.name} (
                    {getCurrencySymbol(acc.currency as SupportedCurrency)})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input
              type="date"
              className="mt-1"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input
              type="date"
              className="mt-1"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedAccount("all");
              setDateRange({ from: "", to: "" });
            }}
            className="flex-1"
          >
            Clear
          </Button>
          <Button
            size="sm"
            onClick={() => setShowFilters(false)}
            className="flex-1"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
