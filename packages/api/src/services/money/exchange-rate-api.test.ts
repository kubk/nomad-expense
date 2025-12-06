import { expect, it, describe } from "vitest";
import { fetchExchangeRate, convertWithLiveRate } from "./exchange-rate-api";

describe("exchange-rate-api", () => {
  it("should fetch exchange rate for a specific date", async () => {
    // Use a fixed historical date for consistent results
    const date = new Date("2024-03-06");
    const rate = await fetchExchangeRate("USD", "EUR", date);

    expect(rate).toMatchInlineSnapshot(`0.92167024`);
  });

  it("should return 1 for same currency", async () => {
    const rate = await fetchExchangeRate("USD", "USD", "latest");
    expect(rate).toBe(1);
  });

  it("should convert amount with live rate", async () => {
    const date = new Date("2024-03-06");
    // 100 USD in cents
    const result = await convertWithLiveRate(10000, "USD", "EUR", date);

    expect(result).toMatchInlineSnapshot(`9217`);
  });
});
