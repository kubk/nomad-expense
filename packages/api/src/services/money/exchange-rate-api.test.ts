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

  it("try > rub for 2021 (uses yearly fallback rates)", async () => {
    const date = new Date("2021-06-15");
    // 1000 TRY cents = 10 TRY
    // TRY rate 2021: 8.904, RUB rate 2021: 73.69
    // 10 TRY -> 10/8.904 USD -> (10/8.904) * 73.69 RUB = 82.76 RUB = 8276 cents
    const result = await convertWithLiveRate(1000, "TRY", "RUB", date);
    expect(result).toMatchInlineSnapshot(`8276`);
  });

  it("thb > try for 2023 (uses monthly THB + yearly TRY)", async () => {
    const date = new Date("2023-11-15");
    // 5000 THB cents = 50 THB
    // THB rate Nov 2023: 35.32, TRY rate 2023: 23.824
    // 50 THB -> 50/35.32 USD -> (50/35.32) * 23.824 TRY = 33.72 TRY = 3372 cents
    const result = await convertWithLiveRate(5000, "THB", "TRY", date);
    expect(result).toMatchInlineSnapshot(`3373`);
  });
});
