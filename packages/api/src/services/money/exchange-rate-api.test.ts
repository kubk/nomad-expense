import { expect, it, describe, vi, beforeEach, afterEach } from "vitest";
import { fetchExchangeRate, convertWithLiveRate } from "./exchange-rate-api";

describe("exchange-rate-api", () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    mockFetch.mockReset();
  });

  describe("fetchExchangeRate", () => {
    it("should return 1 when converting same currency", async () => {
      const rate = await fetchExchangeRate("USD", "USD");
      expect(rate).toBe(1);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should fetch rate from jsDelivr API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            date: "2024-01-15",
            usd: { eur: 0.92, thb: 35.5 },
          }),
      });

      const rate = await fetchExchangeRate("USD", "EUR", "latest");

      expect(rate).toBe(0.92);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json",
        expect.any(Object),
      );
    });

    it("should fetch rate for specific date", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            date: "2024-03-06",
            thb: { usd: 0.028 },
          }),
      });

      const date = new Date("2024-03-06");
      const rate = await fetchExchangeRate("THB", "USD", date);

      expect(rate).toBe(0.028);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@2024-03-06/v1/currencies/thb.min.json",
        expect.any(Object),
      );
    });

    it("should fall back to Cloudflare when jsDelivr fails", async () => {
      // First call fails (jsDelivr)
      mockFetch.mockRejectedValueOnce(new Error("jsDelivr down"));

      // Second call succeeds (Cloudflare)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            date: "2024-01-15",
            usd: { eur: 0.91 },
          }),
      });

      const rate = await fetchExchangeRate("USD", "EUR", "latest");

      expect(rate).toBe(0.91);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenLastCalledWith(
        "https://latest.currency-api.pages.dev/v1/currencies/usd.min.json",
        expect.any(Object),
      );
    });

    it("should throw error when both APIs fail", async () => {
      mockFetch.mockRejectedValueOnce(new Error("jsDelivr down"));
      mockFetch.mockRejectedValueOnce(new Error("Cloudflare down"));

      await expect(fetchExchangeRate("USD", "EUR", "latest")).rejects.toThrow(
        "Failed to fetch exchange rate for USD to EUR",
      );
    });

    it("should throw error when rate not found in response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            date: "2024-01-15",
            usd: { gbp: 0.79 }, // EUR not in response
          }),
      });

      await expect(fetchExchangeRate("USD", "EUR", "latest")).rejects.toThrow(
        "Exchange rate not found for USD to EUR",
      );
    });
  });

  describe("convertWithLiveRate", () => {
    it("should return same amount when converting same currency", async () => {
      const result = await convertWithLiveRate(1000, "USD", "USD");
      expect(result).toBe(1000);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should convert amount using live rate", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            date: "2024-01-15",
            usd: { eur: 0.92 },
          }),
      });

      // 100 USD = $100.00 * 0.92 = 92.00 EUR = 9200 cents
      const result = await convertWithLiveRate(10000, "USD", "EUR", "latest");

      expect(result).toBe(9200);
    });

    it("should round to nearest cent", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            date: "2024-01-15",
            usd: { eur: 0.923 },
          }),
      });

      // 100 USD = $100.00 * 0.923 = 92.30 EUR = 9230 cents
      const result = await convertWithLiveRate(10000, "USD", "EUR", "latest");

      expect(result).toBe(9230);
    });
  });
});
