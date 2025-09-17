import { parseWiseStatement } from "./wise-parser";
import { readFileSync } from "fs";
import { expect, it, describe } from "vitest";

describe("parseWiseStatement", () => {
  it("should parse a Wise statement correctly", async () => {
    const csv = readFileSync("./fixtures/wise-statement.csv", "utf-8");
    const transactions = await parseWiseStatement(
      new File([csv], "wise-statement.csv"),
    );

    expect(transactions).toMatchInlineSnapshot(`
          [
            {
              "amount": -5000,
              "createdAt": 2024-03-14T17:00:00.000Z,
              "currency": "USD",
              "info": "Morning coffee purchase",
              "title": "Coffee Shop",
            },
            {
              "amount": -12075,
              "createdAt": 2024-03-15T17:00:00.000Z,
              "currency": "EUR",
              "info": "Online shopping - books",
              "title": "Amazon",
            },
            {
              "amount": -2550,
              "createdAt": 2024-03-16T17:00:00.000Z,
              "currency": "USD",
              "info": "Ride to airport",
              "title": "Uber",
            },
            {
              "amount": 50000,
              "createdAt": 2024-03-17T17:00:00.000Z,
              "currency": "USD",
              "info": "Client payment for project",
              "title": "Freelance Payment",
            },
            {
              "amount": -1525,
              "createdAt": 2024-03-18T17:00:00.000Z,
              "currency": "USD",
              "info": "Coffee and pastry",
              "title": "Starbucks",
            },
          ]
        `);
  });

  it("should fail fast on invalid schema", async () => {
    const invalidCsv = "InvalidColumn,AnotherColumn\nvalue1,value2";
    const invalidFile = new File([invalidCsv], "invalid.csv");
    await expect(parseWiseStatement(invalidFile)).rejects.toThrow();
  });

  it("should use merchant name as title when available, fallback to description", async () => {
    const csvWithEmptyMerchant = `Amount,Currency,Merchant,Description,Date
-25.00,USD,,ATM Withdrawal,20-03-2024`;

    const transactions = await parseWiseStatement(
      new File([csvWithEmptyMerchant], "test.csv"),
    );
    expect(transactions[0].title).toBe("ATM Withdrawal");
  });
});
