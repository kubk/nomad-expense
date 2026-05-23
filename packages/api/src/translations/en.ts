import { createPlural } from "./plural";

const plural = createPlural("en");
const transaction = (count: number) =>
  plural(count, { one: "transaction", other: "transactions" });

export const en = {
  cancelHint: (text: string) =>
    `${text}

Or click /cancel to cancel the operation`,
  operationCancelled: "❌ Operation cancelled",
  openApp: "📱 Open App",
  telegramGroup: "Telegram group",
  startCaption: "Track your expenses across different accounts and families",

  invalidAccountSelection: "Invalid account selection. Please try again",
  failedProcessFile: "Failed to process file. Please try again",
  importCompleted: (added: number, removed: number) =>
    `✅ Import completed!

📥 Added: ${added} ${transaction(added)}

🗑️ Removed: ${removed} ${transaction(removed)}`,
  failedImportTransactions:
    "❌ Failed to import transactions. Please check your file format and try again.",
  enterValidDescription: "Enter a valid description",
  transactionAdded: "✅ Transaction added successfully!",
  failedCreateTransaction: "❌ Failed to create transaction. Please try again.",
  noAccountsYet: "You have no accounts yet. Please add one in the app",
  createAccount: "📱 Create account",
  invalidTransactionFormat:
    "Invalid format. Use: [amount] [currency] [description]\n\nExample: 10 USD coffee",
  amountMustBePositive: "Amount must be a positive number",
  unsupportedCurrency: (currency: string) =>
    `Currency '${currency}' is not supported`,
  noAccountForCurrency: (currency: string) =>
    `You have no ${currency} account. Create one in the app first`,
  typeOrSelectTransactionDescription: "Type or select transaction description",
  typeTransactionDescription: "Type transaction description",
  noImportableAccounts:
    "You have no importable accounts. To add one, open the app, select an account > Advanced and choose a bank type",
  selectAccount: "Select an account",
  commandNotRecognized: "Command not recognized",

  userJoinedFamily: (name: string) => `🎉 ${name} has joined your family!`,
  transactionReceived: (
    amount: string,
    currency: string,
    description: string,
    author: string,
  ) => `💰 ${amount} ${currency} received on *${description}* by ${author}`,
  transactionSpent: (
    amount: string,
    currency: string,
    description: string,
    author: string,
  ) => `💸 ${amount} ${currency} spent on *${description}* by ${author}`,
  uploadedBankStatement: (
    author: string,
    accountName: string,
    added: number,
    removed: number,
  ) =>
    `📊 *${author}* uploaded a bank statement for *${accountName}*
📥 Added: ${added} ${transaction(added)}
🗑️ Removed: ${removed} ${transaction(removed)}`,

  invalidInviteCode: "Invalid invite code",
  inviteAlreadyUsed: "This invite has already been used",
  inviteExpired: "This invite has expired",
  unauthorized: "Unauthorized",
  noFileProvided: "No file provided",
  noAccountIdProvided: "No account ID provided",
  accessDenied: "Access denied",
  internalServerError: "Internal server error",
} as const;
