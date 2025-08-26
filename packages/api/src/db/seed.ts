import { DateTime } from "luxon";
import { DB } from "../services/db";
import { userTable, accountTable, transactionTable } from "./schema";
import { batch, isNonEmpty } from "./batch";

export const seedUserId = "8461196e-9b34-44da-81f8-0b53787bd928";
export const seedUser2Id = "8461196e-9b34-44da-81f8-0b53787bd929";
export const seedUser3Id = "8461196e-9b34-44da-81f8-0b53787bd930";

export const family1Id = "ff99836b-f53a-4322-be2e-7622e00e380a";
export const family2Id = "ff99836b-f53a-4322-be2e-7622e00e380b";

const accountMapping = {
  account1: "ff99836b-f53a-4322-be2e-7622e00e370a",
  account2: "ff99836b-f53a-4322-be2e-7622e00e371a",
  account3: "ff99836b-f53a-4322-be2e-7622e00e372a",
  account4: "ff99836b-f53a-4322-be2e-7622e00e373a",
  account5: "ff99836b-f53a-4322-be2e-7622e00e374a",
  account6: "ff99836b-f53a-4322-be2e-7622e00e375a",
};

const rates: { [key: string]: number } = {
  GBP: 1.27,
  EUR: 1.08,
  JPY: 0.0067,
  USDT: 1.0,
  THB: 0.027,
  RUB: 0.013,
};

export const seedAccounts = [
  {
    id: accountMapping.account1,
    name: "Revolut",
    currency: "USD",
    color: "blue",
  },
  {
    id: accountMapping.account2,
    name: "Wise",
    currency: "GBP",
    color: "green",
  },
  {
    id: accountMapping.account3,
    name: "Tinkoff",
    currency: "RUB",
    color: "yellow",
  },
  {
    id: accountMapping.account4,
    name: "Kasikorn Egor",
    currency: "THB",
    color: "green",
  },
  {
    id: accountMapping.account5,
    name: "Kasikorn Roxie",
    currency: "THB",
    color: "green",
  },
  {
    id: accountMapping.account6,
    name: "Crypto Wallet",
    currency: "USDT",
    color: "orange",
  },
];

const getRandomDateInRange = () => {
  const now = DateTime.now().setZone("utc");
  const thirteenMonthsAgo = now.minus({ months: 13 });
  const diffInMs = now.toMillis() - thirteenMonthsAgo.toMillis();
  const randomMs = Math.random() * diffInMs;
  return thirteenMonthsAgo.plus({ milliseconds: randomMs });
};

const generateTransactionsForMonth = () => {
  const transactionTemplates = [
    {
      desc: "Grocery Store",
      account: "account1",
      baseAmount: 120,
      type: "expense" as const,
    },
    {
      desc: "Gas Station",
      account: "account1",
      baseAmount: 65,
      type: "expense" as const,
    },
    {
      desc: "Restaurant",
      account: "account2",
      baseAmount: 85,
      type: "expense" as const,
    },
    {
      desc: "Amazon",
      account: "account1",
      baseAmount: 45,
      type: "expense" as const,
    },
    {
      desc: "Netflix",
      account: "account1",
      baseAmount: 16,
      type: "expense" as const,
    },
    {
      desc: "Coffee Shop",
      account: "account3",
      baseAmount: 25,
      type: "expense" as const,
    },
    {
      desc: "Uber",
      account: "account2",
      baseAmount: 35,
      type: "expense" as const,
    },
    {
      desc: "Pharmacy",
      account: "account1",
      baseAmount: 55,
      type: "expense" as const,
    },
    {
      desc: "Electric Bill",
      account: "account1",
      baseAmount: 120,
      type: "expense" as const,
    },
    {
      desc: "Phone Bill",
      account: "account2",
      baseAmount: 85,
      type: "expense" as const,
    },
    {
      desc: "Supermarket",
      account: "account2",
      baseAmount: 95,
      type: "expense" as const,
    },
    {
      desc: "Online Shopping",
      account: "account1",
      baseAmount: 75,
      type: "expense" as const,
    },
    {
      desc: "Public Transport",
      account: "account4",
      baseAmount: 15,
      type: "expense" as const,
    },
    {
      desc: "Fast Food",
      account: "account1",
      baseAmount: 18,
      type: "expense" as const,
    },
    {
      desc: "Internet Bill",
      account: "account1",
      baseAmount: 65,
      type: "expense" as const,
    },
    {
      desc: "Salary",
      account: "account1",
      baseAmount: 3500,
      type: "income" as const,
    },
    {
      desc: "Freelance Work",
      account: "account2",
      baseAmount: 800,
      type: "income" as const,
    },
    {
      desc: "Investment Return",
      account: "account5",
      baseAmount: 150,
      type: "income" as const,
    },
    {
      desc: "Cash Back",
      account: "account1",
      baseAmount: 25,
      type: "income" as const,
    },
  ];

  const numTransactions = Math.floor(Math.random() * 8) + 8;
  const transactions = [];

  for (let i = 0; i < numTransactions; i++) {
    const template =
      transactionTemplates[
        Math.floor(Math.random() * transactionTemplates.length)
      ];

    const transactionDate = getRandomDateInRange().toISO() || "";

    const baseAmount = template.baseAmount;
    const variation = (Math.random() - 0.5) * 40;
    const amount = Math.round((baseAmount + variation) * 100);

    const account = seedAccounts.find(
      (acc) =>
        acc.id ===
        accountMapping[template.account as keyof typeof accountMapping],
    );
    const currency = account?.currency || "USD";

    let usdAmount = amount;
    if (currency !== "USD") {
      usdAmount = Math.round(amount * (rates[currency] || 1));
    }

    transactions.push({
      id: crypto.randomUUID(),
      accountId:
        accountMapping[template.account as keyof typeof accountMapping],
      description: template.desc,
      amount: amount,
      currency: currency,
      usdAmount: usdAmount,
      type: template.type,
      createdAt: transactionDate,
      updatedAt: transactionDate,
    });
  }

  return transactions;
};

const generateRecentTransactions = () => {
  const recentTemplates = [
    {
      desc: "Coffee Shop",
      account: "account1",
      amount: 450,
      type: "expense" as const,
    },
    {
      desc: "Uber Ride",
      account: "account2",
      amount: 1825,
      type: "expense" as const,
    },
    {
      desc: "Lunch Spot",
      account: "account1",
      amount: 1299,
      type: "expense" as const,
    },
    {
      desc: "Gas Station",
      account: "account1",
      amount: 4500,
      type: "expense" as const,
    },
    {
      desc: "Grocery Run",
      account: "account1",
      amount: 6743,
      type: "expense" as const,
    },
    {
      desc: "Part-time Work",
      account: "account2",
      amount: 15000,
      type: "income" as const,
    },
    {
      desc: "Refund",
      account: "account1",
      amount: 2350,
      type: "income" as const,
    },
  ];

  const transactions = [];
  const numRecentTransactions = Math.floor(Math.random() * 5) + 3;

  for (let i = 0; i < numRecentTransactions; i++) {
    const template =
      recentTemplates[Math.floor(Math.random() * recentTemplates.length)];

    const account = seedAccounts.find(
      (acc) =>
        acc.id ===
        accountMapping[template.account as keyof typeof accountMapping],
    );
    const currency = account?.currency || "USD";
    const amountInCents = template.amount;

    let usdAmount = amountInCents;
    if (currency !== "USD") {
      usdAmount = Math.round(amountInCents * (rates[currency] || 1));
    }

    const transactionDate = getRandomDateInRange().toISO() || "";

    transactions.push({
      id: crypto.randomUUID(),
      accountId:
        accountMapping[template.account as keyof typeof accountMapping],
      description: template.desc,
      amount: amountInCents,
      currency: currency,
      usdAmount: usdAmount,
      type: template.type,
      createdAt: transactionDate,
      updatedAt: transactionDate,
    });
  }

  return transactions;
};

const generateAllTransactions = () => {
  const transactions = [];
  for (let monthsAgo = 12; monthsAgo >= 0; monthsAgo--) {
    transactions.push(...generateTransactionsForMonth());
  }
  transactions.push(...generateRecentTransactions());
  return transactions;
};

export const getSeedData = () => ({
  users: [
    {
      id: seedUserId,
      familyId: family1Id,
      firstName: "John",
      lastName: "Doe", 
      username: "johndoe",
    },
    {
      id: seedUser2Id,
      familyId: family1Id,
      firstName: "Jane",
      lastName: "Doe",
      username: "janedoe",
    },
    {
      id: seedUser3Id,
      familyId: family2Id,
      firstName: "Bob",
      lastName: "Smith",
      username: "bobsmith",
    },
  ],
  accounts: [
    ...seedAccounts.map((account) => ({
      ...account,
      familyId: family1Id,
    })),
    {
      id: "ff99836b-f53a-4322-be2e-7622e00e376a",
      name: "Chase Bank",
      currency: "USD",
      color: "blue",
      familyId: family2Id,
    },
    {
      id: "ff99836b-f53a-4322-be2e-7622e00e377a",
      name: "Wells Fargo",
      currency: "USD",
      color: "red",
      familyId: family2Id,
    },
  ],
  transactions: generateAllTransactions(),
});

export const seedDatabase = async (db: DB) => {
  console.log("🌱 Seeding database...");

  const seedData = getSeedData();

  const userChunks = batch(userTable, seedData.users).map((chunk) =>
    db.insert(userTable).values(chunk),
  );
  const accountChunks = batch(accountTable, seedData.accounts).map((chunk) =>
    db.insert(accountTable).values(chunk),
  );
  const transactionChunks = batch(transactionTable, seedData.transactions).map(
    (chunk) => db.insert(transactionTable).values(chunk),
  );
  const allChunks = [...userChunks, ...accountChunks, ...transactionChunks];

  if (isNonEmpty(allChunks)) {
    await db.batch(allChunks);
  }

  console.log(
    `🎉 Database seeded with ${seedData.transactions.length} transactions`,
  );
};
