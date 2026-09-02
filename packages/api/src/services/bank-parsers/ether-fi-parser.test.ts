import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";
import { parseEtherFiStatement } from "./ether-fi-parser";

describe("parseEtherFiStatement", () => {
  it("parses cleared and pending transactions using their USD amount", async () => {
    const statement = readFileSync("./fixtures/ether-fi-statement.xlsx");
    const file = new File([statement], "ether-fi-statement.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const transactions = await parseEtherFiStatement(file, "Asia/Bangkok");

    expect(transactions).toHaveLength(19);
    expect(transactions.every((transaction) => transaction.currency === "USD"))
      .toBe(true);
    expect(
      transactions.find(
        (transaction) =>
          transaction.createdAt.getTime() ===
          new Date("2026-08-31T05:40:34.000Z").getTime(),
      ),
    ).toEqual({
      amountCents: 2350,
      createdAt: new Date("2026-08-31T05:40:34.000Z"),
      currency: "USD",
      description: "WWW.2C2P.COM*LAZADA PAY",
      info: "Marketplaces",
      type: "expense",
    });
  });

  it("filters declined transactions and treats refunds and rewards as income", async () => {
    const statement = readFileSync("./fixtures/ether-fi-statement.xlsx");
    const file = new File([statement], "ether-fi-statement.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const transactions = await parseEtherFiStatement(file, "UTC");

    expect(
      transactions.some((transaction) => transaction.description === "UOBT ATM"),
    ).toBe(false);
    expect(
      transactions.find(
        (transaction) =>
          transaction.createdAt.getTime() ===
          new Date("2026-08-26T07:07:34.000Z").getTime(),
      ),
    ).toMatchObject({
      amountCents: 899,
      type: "income",
    });
    expect(
      transactions.find(
        (transaction) => transaction.description === "Affiliate Reward",
      ),
    ).toMatchObject({
      amountCents: 500,
      type: "income",
    });
  });
});
