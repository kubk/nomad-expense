import { DB } from "../services/db";
import {
  userTable,
  accountTable,
  transactionTable,
  transactionImportRuleTable,
} from "./schema";
import { EXCHANGE_RATES_TO_USD } from "../services/currency-converter";
import {
  currencySchema,
  transactionSourceSchema,
  transactionImportRuleType,
  transactionType,
  bankSchema,
} from "./enums";
import { z } from "zod";

const csvUserSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  familyId: z.string(),
  isAdmin: z.boolean(),
});

const csvTelegramProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  telegramId: z.number(),
  state: z.string(),
  perPage: z.number(),
  name: z.string(),
});

const csvBankAccountSchema = z.object({
  id: z.string(),
  currency: z.string(),
  name: z.string(),
  familyId: z.string(),
  bankType: z.string().optional(),
});

const csvTransactionSchema = z.object({
  createdAt: z.string(),
  amount: z.number(),
  currency: z.string(),
  title: z.string(),
  info: z.string(),
  bankAccountId: z.string(),
  id: z.string(),
  source: z.string(),
  isCountable: z.boolean(),
});

const csvTransactionImportRuleSchema = z.object({
  name: z.string(),
  bankAccountId: z.string(),
  type: z.string(),
});

type CsvTelegramProfile = z.infer<typeof csvTelegramProfileSchema>;

const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      if (i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = false;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
    i++;
  }

  result.push(current);
  return result;
};

const fetchCsv = async (url: string): Promise<string[][]> => {
  try {
    console.log(`📥 Fetching CSV from ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
      );
    }
    const content = await response.text();
    return content.trim().split("\n").map(parseCsvLine);
  } catch (error) {
    console.error(`Error fetching CSV file ${url}:`, error);
    throw error; // Re-throw to fail fast
  }
};

export const migrateFromCsv = async (db: DB) => {
  console.log("🚀 Starting migration from CSV files...");

  // Clear all tables first
  const tables = [
    transactionImportRuleTable,
    transactionTable,
    accountTable,
    userTable,
  ];
  for (const table of tables) {
    await db.delete(table);
  }
  console.log("🗑️ Cleared all existing data");

  // Fetch CSV files from URLs
  const csvUrls = {
    users: "https://general-bucket.memocard.org/users.csv",
    telegramProfiles:
      "https://general-bucket.memocard.org/telegram-profile.csv",
    bankAccounts: "https://general-bucket.memocard.org/bank-account.csv",
    transactions: "https://general-bucket.memocard.org/transaction.csv",
    importRules:
      "https://general-bucket.memocard.org/transaction-import-rule.csv",
  };

  const [
    usersData,
    telegramProfilesData,
    bankAccountsData,
    transactionsData,
    importRulesData,
  ] = await Promise.all([
    fetchCsv(csvUrls.users),
    fetchCsv(csvUrls.telegramProfiles),
    fetchCsv(csvUrls.bankAccounts),
    fetchCsv(csvUrls.transactions),
    fetchCsv(csvUrls.importRules),
  ]);

  console.log(
    `📊 Parsed ${usersData.length} users, ${telegramProfilesData.length} telegram profiles, ${bankAccountsData.length} bank accounts, ${transactionsData.length} transactions, ${importRulesData.length} import rules`,
  );

  // Transform and validate data
  const transformedUsers = transformUsers(usersData, telegramProfilesData);
  const transformedAccounts = transformAccounts(bankAccountsData);
  const transformedTransactions = transformTransactions(
    transactionsData,
    transformedAccounts,
  );
  const transformedImportRules = transformImportRules(importRulesData);

  console.log(
    `✨ Transformed data: ${transformedUsers.length} users, ${transformedAccounts.length} accounts, ${transformedTransactions.length} transactions, ${transformedImportRules.length} import rules`,
  );

  // Insert data in batches to avoid parameter limit
  const BATCH_SIZE = 1000; // Safe batch size well under PostgreSQL's 65k parameter limit

  if (transformedUsers.length > 0) {
    await insertInBatches(db, userTable, transformedUsers, BATCH_SIZE, "users");
  }

  if (transformedAccounts.length > 0) {
    await insertInBatches(
      db,
      accountTable,
      transformedAccounts,
      BATCH_SIZE,
      "accounts",
    );
  }

  if (transformedTransactions.length > 0) {
    await insertInBatches(
      db,
      transactionTable,
      transformedTransactions,
      BATCH_SIZE,
      "transactions",
    );
  }

  if (transformedImportRules.length > 0) {
    await insertInBatches(
      db,
      transactionImportRuleTable,
      transformedImportRules,
      BATCH_SIZE,
      "import rules",
    );
  }

  console.log(`🎉 Migration completed successfully!`);
};

const insertInBatches = async (
  db: DB,
  table: any,
  data: any[],
  batchSize: number,
  tableName: string,
) => {
  console.log(
    `📦 Inserting ${data.length} ${tableName} in batches of ${batchSize}...`,
  );

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await db.insert(table).values(batch);
    console.log(
      `   ✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(data.length / batchSize)} (${batch.length} ${tableName})`,
    );
  }
};

const transformUsers = (
  usersData: string[][],
  telegramProfilesData: string[][],
) => {
  // Create a map of userId to telegram profile
  const telegramProfiles = new Map<string, CsvTelegramProfile>();

  telegramProfilesData.forEach((row) => {
    if (row.length >= 6) {
      const telegramProfile = csvTelegramProfileSchema.parse({
        id: row[0],
        userId: row[1],
        telegramId: parseInt(row[2]),
        state: row[3],
        perPage: parseInt(row[4]),
        name: row[5] || "",
      });
      telegramProfiles.set(telegramProfile.id, telegramProfile);
    }
  });

  return usersData
    .map((row) => {
      const csvUser = csvUserSchema.parse({
        id: row[0],
        createdAt: row[1],
        familyId: row[2],
        isAdmin: row[3] === "true",
      });

      const telegramProfile = telegramProfiles.get(csvUser.id);

      return {
        id: csvUser.id,
        familyId: csvUser.familyId,
        initialFamilyId: csvUser.familyId, // Set initial family same as current
        name: telegramProfile?.name || null,
        username: null, // No username field in telegram profile data
        avatarUrl: null,
        telegramId: telegramProfile?.telegramId.toString() || null,
        isAdmin: csvUser.isAdmin,
        createdAt: new Date(csvUser.createdAt),
        updatedAt: new Date(csvUser.createdAt),
      };
    })
    .filter((user) => user.id); // Filter out any invalid entries
};

const transformAccounts = (bankAccountsData: string[][]) => {
  return bankAccountsData.map((row) => {
    const csvAccount = csvBankAccountSchema.parse({
      id: row[0],
      currency: row[1],
      name: row[2],
      familyId: row[3],
      bankType: row.length >= 9 ? row[8] : undefined, // Bank type is in the 9th column (index 8)
    });

    // Validate currency - fail fast if invalid
    const validatedCurrency = currencySchema.parse(csvAccount.currency);

    // Validate bank type - fail fast if invalid
    let validatedBankType = null;
    if (
      csvAccount.bankType &&
      csvAccount.bankType !== "null" &&
      csvAccount.bankType.trim() !== ""
    ) {
      validatedBankType = bankSchema.parse(csvAccount.bankType);
    }

    return {
      id: csvAccount.id,
      familyId: csvAccount.familyId,
      name: csvAccount.name,
      currency: validatedCurrency,
      color: "blue" as const, // All accounts get blue color as requested
      bankType: validatedBankType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
};

const transformTransactions = (
  transactionsData: string[][],
  accounts: any[],
) => {
  // Create account lookup map
  const accountMap = new Map(accounts.map((acc) => [acc.id, acc]));

  return transactionsData.map((row) => {
    if (row.length < 9) {
      throw new Error(
        `Invalid transaction row: expected at least 9 columns, got ${row.length}`,
      );
    }

    const csvTransaction = csvTransactionSchema.parse({
      createdAt: row[0],
      amount: parseInt(row[1]),
      currency: row[2],
      title: row[3],
      info: row[4],
      bankAccountId: row[5],
      id: row[6],
      source: row[7],
      isCountable: row[8] === "true",
    });

    // Validate currency - fail fast if invalid
    const validatedCurrency = currencySchema.parse(csvTransaction.currency);

    // Validate source - fail fast if invalid
    const validatedSource = transactionSourceSchema.parse(
      csvTransaction.source.toLowerCase(),
    );

    // Check if account exists - fail fast if not found
    const account = accountMap.get(csvTransaction.bankAccountId);
    if (!account) {
      throw new Error(
        `Account ${csvTransaction.bankAccountId} not found for transaction ${csvTransaction.id}`,
      );
    }

    // Determine transaction type based on amount (negative = expense, positive = income)
    const transactionTypeValue: (typeof transactionType)[number] =
      csvTransaction.amount < 0 ? "expense" : "income";

    // Convert amount to absolute value (stored as positive in new schema)
    const absoluteAmount = Math.abs(csvTransaction.amount);

    // Calculate USD amount
    let usdAmount = absoluteAmount;
    if (csvTransaction.currency !== "USD") {
      const exchangeRate =
        EXCHANGE_RATES_TO_USD[
          csvTransaction.currency as keyof typeof EXCHANGE_RATES_TO_USD
        ];
      if (exchangeRate) {
        usdAmount = Math.round(absoluteAmount / exchangeRate);
      }
    }

    return {
      id: csvTransaction.id,
      accountId: csvTransaction.bankAccountId,
      description: csvTransaction.title,
      amount: absoluteAmount,
      currency: validatedCurrency,
      info: csvTransaction.info || null,
      source: validatedSource,
      isCountable: csvTransaction.isCountable,
      usdAmount: usdAmount,
      type: transactionTypeValue,
      createdAt: new Date(csvTransaction.createdAt),
      updatedAt: new Date(csvTransaction.createdAt),
    };
  });
};

const transformImportRules = (importRulesData: string[][]) => {
  return importRulesData.map((row) => {
    if (row.length < 3) {
      throw new Error(
        `Invalid import rule row: expected at least 3 columns, got ${row.length}`,
      );
    }

    const csvRule = csvTransactionImportRuleSchema.parse({
      name: row[0],
      bankAccountId: row[1],
      type: row[2],
    });

    // Validate type using enum - fail fast if invalid
    const validTypes = transactionImportRuleType;
    if (!validTypes.includes(csvRule.type as any)) {
      throw new Error(
        `Invalid import rule type '${csvRule.type}' for rule '${csvRule.name}'. Valid types: ${validTypes.join(", ")}`,
      );
    }

    return {
      name: csvRule.name,
      accountId: csvRule.bankAccountId, // Note: renamed from bankAccountId to accountId
      type: csvRule.type as (typeof validTypes)[number],
    };
  });
};
