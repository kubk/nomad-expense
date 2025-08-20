import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { currencyService, SupportedCurrency } from "./currency-service";

type CurrencyContextType = {
  baseCurrency: SupportedCurrency;
  setBaseCurrency: (currency: SupportedCurrency) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [baseCurrency, setBaseCurrencyState] = useState<SupportedCurrency>(
    () => {
      // Try to load from localStorage first
      const saved = localStorage.getItem("expense-tracker-base-currency");
      return (saved as SupportedCurrency) || "USD";
    },
  );

  useEffect(() => {
    // Update the currency service when base currency changes
    currencyService.setBaseCurrency(baseCurrency);
    // Save to localStorage
    localStorage.setItem("expense-tracker-base-currency", baseCurrency);
  }, [baseCurrency]);

  const setBaseCurrency = (currency: SupportedCurrency) => {
    setBaseCurrencyState(currency);
  };

  const contextValue: CurrencyContextType = {
    baseCurrency,
    setBaseCurrency,
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}
