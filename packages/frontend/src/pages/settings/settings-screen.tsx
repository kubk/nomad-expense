import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  currencyService,
  SUPPORTED_CURRENCIES,
  SupportedCurrency,
} from "../../shared/currency-service";
import { useCurrency } from "../../shared/currency-context";

export function SettingsScreen({
  setCurrentScreen,
}: {
  setCurrentScreen: (screen: string) => void;
}) {
  const { baseCurrency, setBaseCurrency } = useCurrency();

  const handleCurrencyChange = (value: string) => {
    setBaseCurrency(value as SupportedCurrency);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentScreen("overview")}
          className="p-0 h-auto"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
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
              <Select value={baseCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger id="currency-select" className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {currencyService.getCurrencySymbol(baseCurrency)}
                      </span>
                      <span>{baseCurrency}</span>
                      <span className="text-muted-foreground">
                        -{" "}
                        {
                          SUPPORTED_CURRENCIES.find(
                            (c) => c.code === baseCurrency,
                          )?.name
                        }
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-3">
                        <span className="font-medium w-6">
                          {currencyService.getCurrencySymbol(currency.code)}
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
        </div>
      </div>
    </div>
  );
}
