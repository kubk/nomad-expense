import { DateTime } from "luxon";
import { DB } from "../services/db";
import { userTable, accountTable, transactionTable } from "./schema";
import { batch, isNonEmpty } from "./batch";

export const seedUserId = "817e551c-168f-45ef-9dfd-04c1db031ca0";

export const seedAccounts = [
  { id: "1", name: "Chase Checking", currency: "USD", color: "blue" },
  { id: "2", name: "UK Savings", currency: "GBP", color: "green" },
  { id: "3", name: "Euro Account", currency: "EUR", color: "purple" },
  { id: "4", name: "Japan Travel", currency: "JPY", color: "red" },
  { id: "5", name: "Crypto Wallet", currency: "USDT", color: "orange" },
];

const getRandomDateInRange = () => {
  const now = DateTime.now().setZone("utc");
  const sixMonthsAgo = now.minus({ months: 6 });
  const diffInMs = now.toMillis() - sixMonthsAgo.toMillis();
  const randomMs = Math.random() * diffInMs;
  return sixMonthsAgo.plus({ milliseconds: randomMs });
};

const generateTransactionsForMonth = (monthsAgo: number) => {
  const transactionTemplates = [
    {
      desc: "Grocery Store",
      account: "1",
      baseAmount: 120,
      type: "expense" as const,
    },
    {
      desc: "Gas Station",
      account: "1",
      baseAmount: 65,
      type: "expense" as const,
    },
    {
      desc: "Restaurant",
      account: "2",
      baseAmount: 85,
      type: "expense" as const,
    },
    { desc: "Amazon", account: "1", baseAmount: 45, type: "expense" as const },
    { desc: "Netflix", account: "1", baseAmount: 16, type: "expense" as const },
    {
      desc: "Coffee Shop",
      account: "3",
      baseAmount: 25,
      type: "expense" as const,
    },
    { desc: "Uber", account: "2", baseAmount: 35, type: "expense" as const },
    {
      desc: "Pharmacy",
      account: "1",
      baseAmount: 55,
      type: "expense" as const,
    },
    {
      desc: "Electric Bill",
      account: "1",
      baseAmount: 120,
      type: "expense" as const,
    },
    {
      desc: "Phone Bill",
      account: "2",
      baseAmount: 85,
      type: "expense" as const,
    },
    {
      desc: "Supermarket",
      account: "2",
      baseAmount: 95,
      type: "expense" as const,
    },
    {
      desc: "Online Shopping",
      account: "1",
      baseAmount: 75,
      type: "expense" as const,
    },
    {
      desc: "Public Transport",
      account: "4",
      baseAmount: 15,
      type: "expense" as const,
    },
    {
      desc: "Fast Food",
      account: "1",
      baseAmount: 18,
      type: "expense" as const,
    },
    {
      desc: "Internet Bill",
      account: "1",
      baseAmount: 65,
      type: "expense" as const,
    },
    { desc: "Salary", account: "1", baseAmount: 3500, type: "income" as const },
    {
      desc: "Freelance Work",
      account: "2",
      baseAmount: 800,
      type: "income" as const,
    },
    {
      desc: "Investment Return",
      account: "5",
      baseAmount: 150,
      type: "income" as const,
    },
    {
      desc: "Cash Back",
      account: "1",
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

    const account = seedAccounts.find((acc) => acc.id === template.account);
    const currency = account?.currency || "USD";

    let usdAmount = amount;
    if (currency !== "USD") {
      const rates: { [key: string]: number } = {
        GBP: 1.27,
        EUR: 1.08,
        JPY: 0.0067,
        USDT: 1.0,
      };
      usdAmount = Math.round(amount * (rates[currency] || 1));
    }

    transactions.push({
      id: `transaction-${Math.random().toString(36).substr(2, 9)}-${i}`,
      accountId: template.account,
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
      account: "1",
      amount: 450,
      type: "expense" as const,
    },
    { desc: "Uber Ride", account: "2", amount: 1825, type: "expense" as const },
    {
      desc: "Lunch Spot",
      account: "1",
      amount: 1299,
      type: "expense" as const,
    },
    {
      desc: "Gas Station",
      account: "1",
      amount: 4500,
      type: "expense" as const,
    },
    {
      desc: "Grocery Run",
      account: "1",
      amount: 6743,
      type: "expense" as const,
    },
    {
      desc: "Part-time Work",
      account: "2",
      amount: 15000,
      type: "income" as const,
    },
    { desc: "Refund", account: "1", amount: 2350, type: "income" as const },
  ];

  const transactions = [];
  const numRecentTransactions = Math.floor(Math.random() * 5) + 3;

  for (let i = 0; i < numRecentTransactions; i++) {
    const template =
      recentTemplates[Math.floor(Math.random() * recentTemplates.length)];

    const account = seedAccounts.find((acc) => acc.id === template.account);
    const currency = account?.currency || "USD";
    const amountInCents = template.amount;

    let usdAmount = amountInCents;
    if (currency !== "USD") {
      const rates: { [key: string]: number } = {
        GBP: 1.27,
        EUR: 1.08,
        JPY: 0.0067,
        USDT: 1.0,
      };
      usdAmount = Math.round(amountInCents * (rates[currency] || 1));
    }

    const transactionDate = getRandomDateInRange().toISO() || "";

    transactions.push({
      id: `recent-${Math.random().toString(36).substr(2, 9)}-${i}`,
      accountId: template.account,
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
  for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
    transactions.push(...generateTransactionsForMonth(monthsAgo));
  }
  transactions.push(...generateRecentTransactions());
  return transactions;
};

export const seedData = {
  users: [
    {
      id: seedUserId,
      baseCurrency: "USD",
    },
  ],
  accounts: seedAccounts.map((account) => ({
    ...account,
    userId: seedUserId,
    createdAt: DateTime.now().toISO() || "",
    updatedAt: DateTime.now().toISO() || "",
  })),
  transactions: generateAllTransactions(),
};

export const seedDatabase = async (db: DB) => {
  console.log("🌱 Seeding database...");

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
