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

const generateTransactionsForMonth = (monthsAgo: number) => {
  const currentDate = new Date();
  const targetDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - monthsAgo,
    1,
  );
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  const transactionTemplates = [
    { desc: "Grocery Store", account: "1", baseAmount: -120 },
    { desc: "Gas Station", account: "1", baseAmount: -65 },
    { desc: "Restaurant", account: "2", baseAmount: -85 },
    { desc: "Amazon", account: "1", baseAmount: -45 },
    { desc: "Netflix", account: "1", baseAmount: -16 },
    { desc: "Coffee Shop", account: "3", baseAmount: -25 },
    { desc: "Uber", account: "2", baseAmount: -35 },
    { desc: "Pharmacy", account: "1", baseAmount: -55 },
    { desc: "Electric Bill", account: "1", baseAmount: -120 },
    { desc: "Phone Bill", account: "2", baseAmount: -85 },
    { desc: "Supermarket", account: "2", baseAmount: -95 },
    { desc: "Online Shopping", account: "1", baseAmount: -75 },
    { desc: "Public Transport", account: "4", baseAmount: -15 },
    { desc: "Fast Food", account: "1", baseAmount: -18 },
    { desc: "Internet Bill", account: "1", baseAmount: -65 },
    { desc: "Salary", account: "1", baseAmount: 3500 },
    { desc: "Freelance Work", account: "2", baseAmount: 800 },
    { desc: "Investment Return", account: "5", baseAmount: 150 },
    { desc: "Cash Back", account: "1", baseAmount: 25 },
  ];

  const numTransactions = Math.floor(Math.random() * 8) + 8;
  const transactions = [];

  for (let i = 0; i < numTransactions; i++) {
    const template =
      transactionTemplates[
        Math.floor(Math.random() * transactionTemplates.length)
      ];
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    const baseAmount = template.baseAmount;
    const variation = (Math.random() - 0.5) * 40;
    const amount = Math.round(
      (baseAmount + (baseAmount > 0 ? variation : -variation)) * 100,
    );

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
      id: `${year}-${month.toString().padStart(2, "0")}-${i}`,
      accountId: template.account,
      description: template.desc,
      amount: amount,
      currency: currency,
      usdAmount: usdAmount,
      date: `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
    });
  }

  return transactions;
};

const generateRecentTransactions = () => {
  const currentDate = new Date();
  const yesterday = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

  const recentTemplates = [
    { desc: "Coffee Shop", account: "1", amount: -450 },
    { desc: "Uber Ride", account: "2", amount: -1825 },
    { desc: "Lunch Spot", account: "1", amount: -1299 },
    { desc: "Gas Station", account: "1", amount: -4500 },
    { desc: "Grocery Run", account: "1", amount: -6743 },
    { desc: "Part-time Work", account: "2", amount: 15000 },
    { desc: "Refund", account: "1", amount: 2350 },
  ];

  const transactions = [];

  const todayCount = Math.floor(Math.random() * 2) + 2;
  for (let i = 0; i < todayCount; i++) {
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

    transactions.push({
      id: `today-${i}`,
      accountId: template.account,
      description: template.desc,
      amount: amountInCents,
      currency: currency,
      usdAmount: usdAmount,
      date: currentDate.toISOString().split("T")[0],
    });
  }

  const yesterdayCount = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < yesterdayCount; i++) {
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

    transactions.push({
      id: `yesterday-${i}`,
      accountId: template.account,
      description: template.desc,
      amount: amountInCents,
      currency: currency,
      usdAmount: usdAmount,
      date: yesterday.toISOString().split("T")[0],
    });
  }

  return transactions;
};

const generateAllTransactions = () => {
  const transactions = [];
  for (let monthsAgo = 12; monthsAgo >= 0; monthsAgo--) {
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
