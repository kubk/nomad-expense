import { trpc } from "@/shared/api";
import { useQuery } from "@tanstack/react-query";
import { SupportedCurrency } from "api";

export function useBaseCurrency(): SupportedCurrency {
  const { data: baseCurrency } = useQuery(
    trpc.family.getBaseCurrency.queryOptions(),
  );

  return baseCurrency ?? "USD";
}
