import { expect, it, describe } from "vitest";
import {
  applyImportRules,
} from "./import-rules";
import { TransactionImportRule } from "../../db/db-types";

describe("import rules", () => {
  it("makes transactions uncountable when they match MakeUncountable rules", () => {
    const importRules: TransactionImportRule[] = [
      {
        name: "^ATM",
        accountId: "test-account-id",
        type: "MakeUncountable",
      },
      {
        name: "Para [^\\s]+",
        accountId: "test-account-id",
        type: "MakeUncountable",
      },
      {
        name: "Digital Ocean",
        accountId: "test-account-id",
        type: "MakeUncountable",
      },
    ];

    expect(
      applyImportRules(
        { description: "ATM Withdrawal", isCountable: true },
        importRules
      )
    ).toEqual({ description: "ATM Withdrawal", isCountable: false });

    expect(
      applyImportRules(
        { description: "Para Çekme", isCountable: true },
        importRules
      )
    ).toEqual({ description: "Para Çekme", isCountable: false });

    expect(
      applyImportRules(
        { description: "Digital Ocean", isCountable: true },
        importRules
      )
    ).toEqual({ description: "Digital Ocean", isCountable: false });
  });

  it("filters transaction descriptions based on FilterTransactionName rules", () => {
    const importRules: TransactionImportRule[] = [
      {
        name: "^POS (TSMZ )?",
        accountId: "test-account-id",
        type: "FilterTransactionName",
      },
      {
        name: "^\\d{5,}\\s+",
        accountId: "test-account-id",
        type: "FilterTransactionName",
      },
      {
        name: " Buy",
        accountId: "test-account-id",
        type: "FilterTransactionName",
      },
    ];

    expect(
      applyImportRules(
        { description: "POS TSMZ Migros", isCountable: true },
        importRules
      )
    ).toEqual({ description: "Migros", isCountable: true });

    expect(
      applyImportRules(
        { description: "12345678 Store Name", isCountable: true },
        importRules
      )
    ).toEqual({ description: "Store Name", isCountable: true });

    expect(
      applyImportRules(
        { description: "Migros Buy", isCountable: true },
        importRules
      )
    ).toEqual({ description: "Migros", isCountable: true });
  });

  it("does not change transactions that don't match any rules", () => {
    const importRules: TransactionImportRule[] = [
      {
        name: "^ATM",
        accountId: "test-account-id",
        type: "MakeUncountable",
      },
      {
        name: "^POS",
        accountId: "test-account-id",
        type: "FilterTransactionName",
      },
    ];

    expect(
      applyImportRules(
        { description: "Regular Store", isCountable: true },
        importRules
      )
    ).toEqual({ description: "Regular Store", isCountable: true });
  });
});

describe("apply import rules", () => {
  it("applies rules correctly", () => {
    const table = [
      {
        transaction: { description: "POS TSMZ Migros", isCountable: true },
        expected: { description: "Migros", isCountable: true },
      },
      {
        transaction: { description: "POS WATSONS-276-ALANYUM", isCountable: true },
        expected: { description: "WATSONS-276-ALANYUM", isCountable: true },
      },
      {
        transaction: { description: "Migros", isCountable: true },
        expected: { description: "Migros", isCountable: true },
      },
      {
        transaction: { description: "12312343243 Bali manav", isCountable: true },
        expected: { description: "Bali manav", isCountable: true },
      },
      {
        transaction: { description: "Bali manav", isCountable: true },
        expected: { description: "Bali manav", isCountable: true },
      },
      {
        transaction: { description: " Bali manav", isCountable: true },
        expected: { description: " Bali manav", isCountable: true },
      },
      {
        transaction: { description: "ATM Test", isCountable: true },
        expected: { isCountable: false, description: "ATM Test" },
      },
      {
        transaction: { description: " ATM Test", isCountable: true },
        expected: { isCountable: true, description: " ATM Test" },
      },
      {
        transaction: { description: "Other text ATM Test", isCountable: true },
        expected: { isCountable: true, description: "Other text ATM Test" },
      },
      {
        transaction: { description: "Para Çekme", isCountable: true },
        expected: { isCountable: false, description: "Para Çekme" },
      },
      {
        transaction: { description: "Sent money to Kseniia Roenko", isCountable: true },
        expected: { isCountable: false, description: "Sent money to Kseniia Roenko" },
      },
    ] as const;

    const importRules: TransactionImportRule[] = [
      {
        name: "^POS (TSMZ )?",
        accountId: "2fd204fa-c446-4c24-8166-70677f3069e4",
        type: "FilterTransactionName",
      },
      {
        name: "^\\d{5,}\\s+",
        accountId: "2fd204fa-c446-4c24-8166-70677f3069e4",
        type: "FilterTransactionName",
      },
      {
        name: "^ATM",
        accountId: "2fd204fa-c446-4c24-8166-70677f3069e4",
        type: "MakeUncountable",
      },
      {
        name: "Para [^\\s]+",
        accountId: "2fd204fa-c446-4c24-8166-70677f3069e4",
        type: "MakeUncountable",
      },
      {
        name: "Sent money to Kseniia Roenko",
        accountId: "2fd204fa-c446-4c24-8166-70677f3069e4",
        type: "MakeUncountable",
      },
    ];

    table.forEach((row) => {
      expect(
        applyImportRules(row.transaction, importRules)
      ).toStrictEqual(row.expected);
    });
  });
});