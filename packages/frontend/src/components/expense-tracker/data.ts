import { Account, MonthlyData, Transaction } from "./types";

export const accounts: Account[] = [
  { id: "1", name: "Chase Checking", currency: "USD", color: "bg-blue-500" },
  { id: "2", name: "UK Savings", currency: "GBP", color: "bg-green-500" },
  { id: "3", name: "Euro Account", currency: "EUR", color: "bg-purple-500" },
  { id: "4", name: "Japan Travel", currency: "JPY", color: "bg-red-500" },
  { id: "5", name: "Crypto Wallet", currency: "USDT", color: "bg-orange-500" },
];

const generateTransactionsForMonth = (monthsAgo: number): Transaction[] => {
  const currentDate = new Date();
  const targetDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - monthsAgo,
    1,
  );
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthName = monthNames[month - 1];
  const daysInMonth = new Date(year, month, 0).getDate();

  const transactionTemplates = [
    {
      desc: "Grocery Store",
      category: "Groceries",
      account: "1",
      baseAmount: 120,
    },
    {
      desc: "Gas Station",
      category: "Transport",
      account: "1",
      baseAmount: 65,
    },
    { desc: "Restaurant", category: "Dining", account: "2", baseAmount: 85 },
    { desc: "Amazon", category: "Shopping", account: "1", baseAmount: 45 },
    {
      desc: "Netflix",
      category: "Entertainment",
      account: "1",
      baseAmount: 16,
    },
    { desc: "Coffee Shop", category: "Dining", account: "3", baseAmount: 25 },
    { desc: "Uber", category: "Transport", account: "2", baseAmount: 35 },
    { desc: "Pharmacy", category: "Health", account: "1", baseAmount: 55 },
    {
      desc: "Electric Bill",
      category: "Utilities",
      account: "1",
      baseAmount: 120,
    },
    { desc: "Phone Bill", category: "Utilities", account: "2", baseAmount: 85 },
    {
      desc: "Supermarket",
      category: "Groceries",
      account: "2",
      baseAmount: 95,
    },
    {
      desc: "Online Shopping",
      category: "Shopping",
      account: "1",
      baseAmount: 75,
    },
    {
      desc: "Public Transport",
      category: "Transport",
      account: "4",
      baseAmount: 15,
    },
    { desc: "Fast Food", category: "Dining", account: "1", baseAmount: 18 },
    {
      desc: "Internet Bill",
      category: "Utilities",
      account: "1",
      baseAmount: 65,
    },
  ];

  // Generate 8-15 transactions per month
  const numTransactions = Math.floor(Math.random() * 8) + 8;
  const transactions: Transaction[] = [];

  for (let i = 0; i < numTransactions; i++) {
    const template =
      transactionTemplates[
        Math.floor(Math.random() * transactionTemplates.length)
      ];
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    const amount = template.baseAmount + (Math.random() - 0.5) * 40; // ±20 variation

    transactions.push({
      id: `${year}-${month.toString().padStart(2, "0")}-${i}`,
      desc: template.desc,
      amount: amount,
      currency: "USD",
      usd: amount,
      date: `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
      account: template.account,
      category: template.category,
      month: `${monthName} ${year}`,
    });
  }

  return transactions;
};

// Generate some recent transactions for today and yesterday
const generateRecentTransactions = (): Transaction[] => {
  const currentDate = new Date();
  const yesterday = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const recentTemplates = [
    { desc: "Coffee Shop", category: "Dining", account: "1", amount: 4.5 },
    { desc: "Uber Ride", category: "Transport", account: "2", amount: 18.25 },
    { desc: "Lunch Spot", category: "Dining", account: "1", amount: 12.99 },
    { desc: "Gas Station", category: "Transport", account: "1", amount: 45.0 },
    { desc: "Grocery Run", category: "Groceries", account: "1", amount: 67.43 },
  ];

  const transactions: Transaction[] = [];

  // Add 2-3 transactions for today
  const todayCount = Math.floor(Math.random() * 2) + 2;
  for (let i = 0; i < todayCount; i++) {
    const template =
      recentTemplates[Math.floor(Math.random() * recentTemplates.length)];
    const currentMonth = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    transactions.push({
      id: `today-${i}`,
      desc: template.desc,
      amount: template.amount,
      currency: "USD",
      usd: template.amount,
      date: currentDate.toISOString().split("T")[0],
      account: template.account,
      category: template.category,
      month: currentMonth,
    });
  }

  // Add 1-2 transactions for yesterday
  const yesterdayCount = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < yesterdayCount; i++) {
    const template =
      recentTemplates[Math.floor(Math.random() * recentTemplates.length)];
    const yesterdayMonth = `${monthNames[yesterday.getMonth()]} ${yesterday.getFullYear()}`;

    transactions.push({
      id: `yesterday-${i}`,
      desc: template.desc,
      amount: template.amount,
      currency: "USD",
      usd: template.amount,
      date: yesterday.toISOString().split("T")[0],
      account: template.account,
      category: template.category,
      month: yesterdayMonth,
    });
  }

  return transactions;
};

// Generate transactions for the last 13 months (including current month)
export const transactions: Transaction[] = [
  ...generateTransactionsForMonth(12), // 12 months ago
  ...generateTransactionsForMonth(11), // 11 months ago
  ...generateTransactionsForMonth(10), // 10 months ago
  ...generateTransactionsForMonth(9), // 9 months ago
  ...generateTransactionsForMonth(8), // 8 months ago
  ...generateTransactionsForMonth(7), // 7 months ago
  ...generateTransactionsForMonth(6), // 6 months ago
  ...generateTransactionsForMonth(5), // 5 months ago
  ...generateTransactionsForMonth(4), // 4 months ago
  ...generateTransactionsForMonth(3), // 3 months ago
  ...generateTransactionsForMonth(2), // 2 months ago
  ...generateTransactionsForMonth(1), // 1 month ago
  ...generateTransactionsForMonth(0), // current month
  ...generateRecentTransactions(), // today and yesterday
];

// Calculate monthly data from actual transactions
const calculateMonthlyData = (): MonthlyData[] => {
  const monthlyTotals: {
    [key: string]: { amount: number; year: number; shortMonth: string };
  } = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const shortMonth = monthNames[month - 1];
    const monthKey = `${shortMonth} ${year}`;

    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = {
        amount: 0,
        year,
        shortMonth,
      };
    }

    monthlyTotals[monthKey].amount += transaction.usd;
  });

  return Object.keys(monthlyTotals)
    .sort((a, b) => {
      const [monthA, yearA] = a.split(" ");
      const [monthB, yearB] = b.split(" ");
      const yearDiff = parseInt(yearA) - parseInt(yearB);
      if (yearDiff !== 0) return yearDiff;

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return monthNames.indexOf(monthA) - monthNames.indexOf(monthB);
    })
    .map((monthKey) => ({
      month: monthKey,
      shortMonth: monthlyTotals[monthKey].shortMonth,
      amount: Math.round(monthlyTotals[monthKey].amount * 100) / 100,
      year: monthlyTotals[monthKey].year,
    }));
};

export const monthlyData: MonthlyData[] = calculateMonthlyData();

export const getMonthlyTransactions = (
  monthData: MonthlyData,
): Transaction[] => {
  const baseTransactions = [
    { desc: "Grocery Store", category: "Groceries", account: "1" },
    { desc: "Gas Station", category: "Transport", account: "1" },
    { desc: "Restaurant", category: "Dining", account: "2" },
    { desc: "Amazon", category: "Shopping", account: "1" },
    { desc: "Netflix", category: "Entertainment", account: "1" },
    { desc: "Uber", category: "Transport", account: "2" },
    { desc: "Coffee Shop", category: "Dining", account: "3" },
    { desc: "Pharmacy", category: "Health", account: "1" },
    { desc: "Electric Bill", category: "Utilities", account: "1" },
    { desc: "Internet", category: "Utilities", account: "2" },
  ];

  return baseTransactions.map((transaction, index) => ({
    id: `${monthData.month}-${index}`,
    ...transaction,
    amount: Math.random() * 200 + 10,
    currency: "USD",
    usd: Math.random() * 200 + 10,
    date: `${monthData.shortMonth} ${Math.floor(Math.random() * 28) + 1}`,
    month: monthData.month,
  }));
};
