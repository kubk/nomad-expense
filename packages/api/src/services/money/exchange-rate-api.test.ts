import { expect, it, describe } from "vitest";
import { convertWithLiveRate } from "./exchange-rate-api";

describe("exchange-rate-api", () => {
  it("should convert amount with live rate", async () => {
    const date = new Date("2024-03-06");
    // 100 USD in cents
    const result = await convertWithLiveRate(10000, "USD", "EUR", date);

    expect(result).toMatchInlineSnapshot(`9217`);
  });

  it("should return same amount for same currency", async () => {
    const result = await convertWithLiveRate(10000, "USD", "USD", "latest");
    expect(result).toBe(10000);
  });

  it("try > usd", async () => {
    const date = new Date("2025-04-07");

    const result = await convertWithLiveRate(1000, "TRY", "RUB", date);
    expect(result).toBeGreaterThan(0);
  });

  it("thb > try for 2023", async () => {
    const date = new Date("2023-11-15");
    const result = await convertWithLiveRate(5000, "THB", "TRY", date);
    console.log(result);
    expect(result).toBeGreaterThan(0);
  });
});
