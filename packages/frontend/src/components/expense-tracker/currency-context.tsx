import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  currencyService,
  SupportedCurrency,
  CurrencyService,
} from "./currency-service";

interface CurrencyContextType {
  baseCurrency: SupportedCurrency;
  currencyService: CurrencyService;
  setBaseCurrency: (currency: SupportedCurrency) => void;
  formatAmount: (amount: number, currency: SupportedCurrency) => string;
  convertToBase: (amount: number, fromCurrency: SupportedCurrency) => number;
  convertFromBase: (amount: number, toCurrency: SupportedCurrency) => number;
  getCurrencySymbol: (currency: SupportedCurrency) => string;
}

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

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
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
    currencyService,
    setBaseCurrency,
    formatAmount: currencyService.formatAmount.bind(currencyService),
    convertToBase: currencyService.convertToBase.bind(currencyService),
    convertFromBase: currencyService.convertFromBase.bind(currencyService),
    getCurrencySymbol: currencyService.getCurrencySymbol.bind(currencyService),
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};
