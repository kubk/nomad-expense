import { describe, it, expect } from "vitest";
import { parseQuickTransaction } from "./parse-quick-transaction";
import { AccountSelect } from "../db/db-types";

describe("parseQuickTransaction", () => {
  const mockAccounts = [
    { id: "1", currency: "USD", familyId: "family1", name: "USD Account" },
    { id: "2", currency: "EUR", familyId: "family1", name: "EUR Account" },
    { id: "3", currency: "THB", familyId: "family1", name: "THB Account" },
  ] as AccountSelect[];

  it("should return invalid_number error if amount is not a number", () => {
    const result = parseQuickTransaction("notANumber USD rent", mockAccounts);
    expect(result).toEqual({ error: "invalid_number" });
  });

  it("should return invalid_number error if amount is zero", () => {
    const result = parseQuickTransaction("0 USD rent", mockAccounts);
    expect(result).toEqual({ error: "invalid_number" });
  });

  it("should return invalid_number error if amount is negative", () => {
    const result = parseQuickTransaction("-10 USD rent", mockAccounts);
    expect(result).toEqual({ error: "invalid_number" });
  });

  it("should return invalid_input error if format is invalid", () => {
    const result = parseQuickTransaction("100", mockAccounts);
    expect(result).toEqual({ error: "invalid_input" });
  });

  it("should return invalid_currency error if currency does not match any account", () => {
    const result = parseQuickTransaction("100 JPY rent", mockAccounts);
    expect(result).toEqual({ error: "invalid_currency" });
  });

  it("should return invalid_currency error if currency is not valid", () => {
    const result = parseQuickTransaction("100 XYZ rent", mockAccounts);
    expect(result).toEqual({ error: "invalid_currency" });
  });

  it("should return account and description if both are valid", () => {
    const result = parseQuickTransaction("100 USD rent", mockAccounts);
    expect(result).toEqual({
      amountCents: 10000, // 100 * 100 cents
      account: {
        id: "1",
        currency: "USD",
        familyId: "family1",
        name: "USD Account",
      },
      description: "rent",
    });
  });

  it("should parse multiword description", () => {
    const result = parseQuickTransaction(
      "100 USD public transport",
      mockAccounts,
    );
    expect(result).toEqual({
      amountCents: 10000,
      account: {
        id: "1",
        currency: "USD",
        familyId: "family1",
        name: "USD Account",
      },
      description: "public transport",
    });
  });

  it("should return only account if description is missing", () => {
    const result = parseQuickTransaction("100 USD", mockAccounts);
    expect(result).toEqual({
      amountCents: 10000,
      account: {
        id: "1",
        currency: "USD",
        familyId: "family1",
        name: "USD Account",
      },
    });
  });

  it("should be case insensitive for currency", () => {
    const result = parseQuickTransaction("100 usd", mockAccounts);
    expect(result).toEqual({
      amountCents: 10000,
      account: {
        id: "1",
        currency: "USD",
        familyId: "family1",
        name: "USD Account",
      },
    });
  });

  it("should parse float amounts", () => {
    const result = parseQuickTransaction("2.5 eur", mockAccounts);
    expect(result).toEqual({
      amountCents: 250, // 2.5 * 100 cents
      account: {
        id: "2",
        currency: "EUR",
        familyId: "family1",
        name: "EUR Account",
      },
    });
  });

  it("should parse float with high precision", () => {
    const result = parseQuickTransaction("2.33333 eur", mockAccounts);
    expect(result).toEqual({
      amountCents: 233, // 2.33333 * 100 = 233.333, rounded to 233
      account: {
        id: "2",
        currency: "EUR",
        familyId: "family1",
        name: "EUR Account",
      },
    });
  });

  it("should handle THB currency", () => {
    const result = parseQuickTransaction("10 THB coffee", mockAccounts);
    expect(result).toEqual({
      amountCents: 1000,
      account: {
        id: "3",
        currency: "THB",
        familyId: "family1",
        name: "THB Account",
      },
      description: "coffee",
    });
  });

  it("should trim description whitespace", () => {
    const result = parseQuickTransaction("10 USD   coffee   ", mockAccounts);
    expect(result).toEqual({
      amountCents: 1000,
      account: {
        id: "1",
        currency: "USD",
        familyId: "family1",
        name: "USD Account",
      },
      description: "coffee",
    });
  });
});
