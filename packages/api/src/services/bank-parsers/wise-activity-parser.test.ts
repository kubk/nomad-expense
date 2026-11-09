import { describe, expect, it } from "vitest";
import {
  parseWiseActivities,
  type WiseActivity,
  type WiseDebit,
} from "./wise-activity-parser";

function activity(overrides: Partial<WiseActivity>): WiseActivity {
  return {
    id: "activity-1",
    type: "CARD_PAYMENT",
    resource: { type: "CARD_TRANSACTION", id: "1" },
    title: "<strong>Corner Shop</strong>",
    description: "",
    primaryAmount: "1,477.75 THB",
    secondaryAmount: "",
    status: "COMPLETED",
    createdOn: "2026-10-21T04:04:46.123Z",
    ...overrides,
  };
}

function parse(item: WiseActivity, debits?: WiseDebit[]) {
  return parseWiseActivities(
    [item],
    debits ? new Map([[item.id, debits]]) : undefined,
  );
}

describe("parseWiseActivities", () => {
  it("parses a card payment from the balance in the payment currency", () => {
    expect(parse(activity({}))).toEqual([
      {
        externalId: "activity-1",
        balanceCurrency: "THB",
        amountCents: 147775,
        type: "expense",
        description: "Corner Shop",
        info: "Card transaction of 1,477.75 THB issued by Corner Shop",
        createdAt: new Date("2026-10-21T04:04:46.123Z"),
      },
    ]);
  });

  it("charges a converted card payment to the balance it was paid from", () => {
    const [entry] = parse(
      activity({ primaryAmount: "79 THB", secondaryAmount: "2.42 USD" }),
    );
    expect(entry).toMatchObject({
      balanceCurrency: "USD",
      amountCents: 242,
      type: "expense",
      info: "Card transaction of 79.00 THB issued by Corner Shop",
    });
  });

  it("splits a payment funded from several balances by its debits", () => {
    const entries = parse(
      activity({ primaryAmount: "246 THB", secondaryAmount: "USD, THB" }),
      [
        { value: 5.38, currency: "USD" },
        { value: 73.87, currency: "THB" },
      ],
    );
    expect(
      entries.map(({ balanceCurrency, amountCents }) => ({
        balanceCurrency,
        amountCents,
      })),
    ).toEqual([
      { balanceCurrency: "USD", amountCents: 538 },
      { balanceCurrency: "THB", amountCents: 7387 },
    ]);
  });

  it("refuses to guess the split of a multi-balance payment", () => {
    expect(() => parse(activity({ secondaryAmount: "USD, THB" }))).toThrow(
      "paid from several balances",
    );
  });

  it("parses a card refund as income", () => {
    const [entry] = parse(
      activity({
        title: "<strong>Travel Agency</strong>",
        description: "Refunded",
        primaryAmount: "<positive>+ 13.61 USD</positive>",
      }),
    );
    expect(entry).toMatchObject({
      balanceCurrency: "USD",
      amountCents: 1361,
      type: "income",
      description: "Travel Agency",
      info: "Card transaction of -13.61 USD issued by Travel Agency",
    });
  });

  it("parses an outgoing transfer with the amount that left the balance", () => {
    const [entry] = parse(
      activity({
        type: "TRANSFER",
        resource: { type: "TRANSFER", id: "2" },
        title: "<strong>City Transit</strong>",
        description: "Sent",
        primaryAmount: "57.50 CNY",
        secondaryAmount: "8.78 USD",
      }),
    );
    expect(entry).toMatchObject({
      balanceCurrency: "USD",
      amountCents: 878,
      type: "expense",
      description: "Sent money to City Transit",
      info: "Sent money to City Transit",
    });
  });

  it("parses an incoming transfer with the amount that landed on the balance", () => {
    const [entry] = parse(
      activity({
        type: "TRANSFER",
        resource: { type: "TRANSFER", id: "3" },
        title: "<strong>ACME LLC</strong>",
        primaryAmount: "<positive>+ 3,146.89 USD</positive>",
        secondaryAmount: "3,153 USD",
      }),
    );
    expect(entry).toMatchObject({
      balanceCurrency: "USD",
      amountCents: 314689,
      type: "income",
      description: "Received money from ACME LLC",
    });
  });

  it("parses a conversion between balances into both sides", () => {
    const entries = parse(
      activity({
        type: "INTERBALANCE",
        resource: { type: "BALANCE_TRANSACTION", id: "4" },
        title: "To <strong>USD</strong>",
        description: "Moved",
        primaryAmount: "1,517.75 USD",
        secondaryAmount: "1,308.22 EUR",
      }),
    );
    expect(
      entries.map(({ balanceCurrency, amountCents, type, description }) => ({
        balanceCurrency,
        amountCents,
        type,
        description,
      })),
    ).toEqual([
      {
        balanceCurrency: "EUR",
        amountCents: 130822,
        type: "expense",
        description: "Converted 1,308.22 EUR to 1,517.75 USD",
      },
      {
        balanceCurrency: "USD",
        amountCents: 151775,
        type: "income",
        description: "Converted 1,308.22 EUR to 1,517.75 USD",
      },
    ]);
  });

  it("parses a direct debit", () => {
    const [entry] = parse(
      activity({
        type: "DIRECT_DEBIT_TRANSACTION",
        resource: { type: "DIRECT_DEBIT_TRANSACTION", id: "5" },
        title: "<strong>ACME LLC</strong>",
        description: "Sent",
        primaryAmount: "50 USD",
      }),
    );
    expect(entry).toMatchObject({
      amountCents: 5000,
      type: "expense",
      description: "ACME LLC",
      info: "Paid to ACME LLC",
    });
  });

  it("formats zero-decimal currencies like the CSV statement", () => {
    const [entry] = parse(
      activity({ primaryAmount: "73,000 VND", secondaryAmount: "2.81 USD" }),
    );
    expect(entry?.info).toBe(
      "Card transaction of 73,000 VND issued by Corner Shop",
    );
  });

  it("decodes HTML entities in titles", () => {
    const [entry] = parse(activity({ title: "<strong>H&amp;M</strong>" }));
    expect(entry?.description).toBe("H&M");
  });

  it("skips activities that didn't move money", () => {
    expect(
      parseWiseActivities([
        activity({
          id: "declined",
          status: "CANCELLED",
          description: "Declined",
        }),
        activity({ id: "pending", status: "IN_PROGRESS" }),
        activity({
          id: "check",
          type: "CARD_CHECK",
          description: "Card checked",
          primaryAmount: "0 GBP",
        }),
        activity({ id: "zero", primaryAmount: "0 USD" }),
      ]),
    ).toEqual([]);
  });

  it("rejects amounts it doesn't understand", () => {
    expect(() => parse(activity({ primaryAmount: "about 5 bucks" }))).toThrow(
      "Unable to parse Wise amount",
    );
  });
});
