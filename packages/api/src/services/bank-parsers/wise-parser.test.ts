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
          "amount": 5000,
          "createdAt": 2024-03-15T00:00:00.000Z,
          "currency": "USD",
          "description": "Coffee Shop",
          "info": "Morning coffee purchase",
          "type": "expense",
        },
        {
          "amount": 12075,
          "createdAt": 2024-03-16T00:00:00.000Z,
          "currency": "EUR",
          "description": "Amazon",
          "info": "Online shopping - books",
          "type": "expense",
        },
        {
          "amount": 2550,
          "createdAt": 2024-03-17T00:00:00.000Z,
          "currency": "USD",
          "description": "Uber",
          "info": "Ride to airport",
          "type": "expense",
        },
        {
          "amount": 50000,
          "createdAt": 2024-03-18T00:00:00.000Z,
          "currency": "USD",
          "description": "Freelance Payment",
          "info": "Client payment for project",
          "type": "income",
        },
        {
          "amount": 1525,
          "createdAt": 2024-03-19T00:00:00.000Z,
          "currency": "USD",
          "description": "Starbucks",
          "info": "Coffee and pastry",
          "type": "expense",
        },
      ]
    `);
  });

  it("should fail fast on invalid schema", async () => {
    const invalidCsv = "InvalidColumn,AnotherColumn\nvalue1,value2";
    const invalidFile = new File([invalidCsv], "invalid.csv");
    await expect(parseWiseStatement(invalidFile)).rejects.toThrow();
  });

  it("should use merchant name as description when available, fallback to description", async () => {
    const csvWithEmptyMerchant = `Amount,Currency,Merchant,Description,Date
-25.00,USD,,ATM Withdrawal,20-03-2024`;

    const transactions = await parseWiseStatement(
      new File([csvWithEmptyMerchant], "test.csv"),
    );
    expect(transactions[0].description).toBe("ATM Withdrawal");
    expect(transactions[0].type).toBe("expense");
    expect(transactions[0].amount).toBe(2500);
  });
});
