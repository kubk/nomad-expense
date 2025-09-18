import * as schema from "../../db/schema";
import { beforeEach } from "vitest";
import { PgTable } from "drizzle-orm/pg-core";
import { setEnv } from "../../services/env";
import { getDb } from "../../services/db";
import { createMoneyFull } from "../../services/money/money";

export const fixtures = {
  users: {
    alice: {
      id: "ac28d06d-9938-4f4c-a690-08115cf51d84",
    },
    bob: {
      id: "9a9f9a8d-093a-4901-a439-8abb31392d77",
    },
    charlie: {
      id: "6507c6ab-5c1f-4f51-a3ee-cf4bab848267"
    },
  },
};

async function seed() {
  const db = getDb();

  const familyId = fixtures.users.alice.id;

  await db
    .insert(schema.userTable)
    .values([
      {
        id: fixtures.users.alice.id,
        familyId: familyId,
        initialFamilyId: familyId,
        name: "Alice",
        username: "alice",
        telegramId: "1",
      },
      {
        id: fixtures.users.bob.id,
        familyId: familyId,
        initialFamilyId: familyId,
        name: "Bob",
        username: "bob",
        telegramId: "2",
      },
      {
        id: fixtures.users.charlie.id,
        familyId: 'f3941d1c-88e0-476b-8b5f-81d243e24e90',
        initialFamilyId: 'f3941d1c-88e0-476b-8b5f-81d243e24e90',
        name: "Charlie",
        username: "charlie",
        telegramId: "3",
      },
    ]);

  const [accountTry, accountUsd] = await db
    .insert(schema.accountTable)
    .values([
      {
        id: "449cce5f-04b3-489b-96a0-2aa8fb14bc8f",
        familyId: familyId,
        name: "Yapi Kredi TRY",
        currency: "TRY",
        color: "blue",
        bankType: "YapiKredi",
      },
      {
        id: "61637396-a7c2-4ccc-91b8-9098a62aee18",
        familyId: familyId,
        name: "Yapi Kredi USD",
        currency: "USD",
        color: "green",
        bankType: "YapiKredi",
      },
    ])
    .returning();

  // Add transaction import rules
  await db.insert(schema.transactionImportRuleTable).values([
    {
      name: "Digital Ocean",
      accountId: accountTry.id,
      type: "MakeUncountable",
    },
    {
      name: " Buy",
      accountId: accountTry.id,
      type: "FilterTransactionName",
    },
  ]);

  // Add test transactions
  const migrosMoney = createMoneyFull({ amountHuman: 5.5, currency: "TRY" });
  const digitalOceanMoney = createMoneyFull({ amountHuman: 55.5, currency: "TRY" });
  const ukCertMoney = createMoneyFull({ amountHuman: 55.5, currency: "TRY" });
  const amazonMoney = createMoneyFull({ amountHuman: 10, currency: "USD" });
  const usdtMoney = createMoneyFull({ amountHuman: 2000, currency: "USD" });
  const digitalOceanUsdMoney = createMoneyFull({ amountHuman: 100, currency: "USD" });
  const italkiMoney = createMoneyFull({ amountHuman: 500, currency: "USD" });

  await db.insert(schema.transactionTable).values([
    // TRY account transactions
    {
      accountId: accountTry.id,
      description: "Migros Buy",
      amount: migrosMoney.amountCents,
      currency: "TRY",
      info: "Other",
      usdAmount: migrosMoney.baseAmountCents,
      type: "expense",
      source: "imported",
    },
    {
      accountId: accountTry.id,
      description: "Digital Ocean",
      amount: digitalOceanMoney.amountCents,
      currency: "TRY",
      info: "Other",
      usdAmount: digitalOceanMoney.baseAmountCents,
      type: "expense",
      source: "imported",
    },
    {
      accountId: accountTry.id,
      description: "Payment for UK certificate",
      amount: ukCertMoney.amountCents,
      currency: "TRY",
      info: "Other",
      usdAmount: ukCertMoney.baseAmountCents,
      type: "expense",
      source: "manual",
      isCountable: false,
    },
    // USD account transactions
    {
      accountId: accountUsd.id,
      description: "Amazon",
      amount: amazonMoney.amountCents,
      currency: "USD",
      info: "Other",
      usdAmount: amazonMoney.baseAmountCents,
      type: "expense",
      source: "imported",
    },
    {
      accountId: accountUsd.id,
      description: "USDT withdraw",
      amount: usdtMoney.amountCents,
      currency: "USD",
      info: "Other",
      usdAmount: usdtMoney.baseAmountCents,
      type: "income",
      source: "imported",
    },
    {
      accountId: accountUsd.id,
      description: "Payment for Digital Ocean",
      amount: digitalOceanUsdMoney.amountCents,
      currency: "USD",
      info: "Other",
      usdAmount: digitalOceanUsdMoney.baseAmountCents,
      type: "expense",
      source: "imported",
      isCountable: false,
    },
    {
      accountId: accountUsd.id,
      description: "I Talki",
      amount: italkiMoney.amountCents,
      currency: "USD",
      info: "Other",
      usdAmount: italkiMoney.baseAmountCents,
      type: "income",
      source: "imported",
    },
  ]);
}

export function setTestEnvs() {
  // @ts-expect-error
  const env = import.meta.env;
  setEnv(env);
}

export function setUpDbTest() {
  beforeEach(async () => {
    setTestEnvs();

    const db = getDb();
    const tables = Object.values(schema).filter(
      (obj) => obj instanceof PgTable,
    );
    for (const table of tables) {
      await db.delete(table);
    }

    await seed();
  });
}
