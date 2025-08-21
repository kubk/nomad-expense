import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCurrencySymbol,
  getSupportedCurrencies,
  SupportedCurrency,
} from "../../shared/currency-converter";
import { currencyStore } from "../../store/currency-store";
import { PageHeader } from "../shared/page-header";
import { ModeToggle } from "../../components/mode-toggle";

export function SettingsScreen() {
  const handleCurrencyChange = (value: string) => {
    currencyStore.setBaseCurrency(value as SupportedCurrency);
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Settings" />

      {/* Content */}
      <div className="flex-1 bg-background px-4 py-6">
        <div className="space-y-8">
          {/* Currency Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-medium">Base Currency</h2>
              <p className="text-sm text-muted-foreground">
                Choose your preferred currency for displaying totals and
                calculations.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency-select">Currency</Label>
              <Select
                value={currencyStore.baseCurrency}
                onValueChange={handleCurrencyChange}
              >
                <SelectTrigger id="currency-select" className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {getCurrencySymbol(currencyStore.baseCurrency)}
                      </span>
                      <span>{currencyStore.baseCurrency}</span>
                      <span className="text-muted-foreground">
                        -{" "}
                        {
                          getSupportedCurrencies().find(
                            (c) => c.code === currencyStore.baseCurrency,
                          )?.name
                        }
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {getSupportedCurrencies().map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-3">
                        <span className="font-medium w-6">
                          {getCurrencySymbol(currency.code)}
                        </span>
                        <div>
                          <div className="font-medium">{currency.code}</div>
                          <div className="text-sm text-muted-foreground">
                            {currency.name}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Theme Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme-select">Theme</Label>
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
