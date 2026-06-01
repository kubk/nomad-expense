import { createPlural } from "./plural";

const plural = createPlural("en");
const transaction = (count: number) =>
  plural(count, { one: "transaction", other: "transactions" });
const month = (count: number) =>
  plural(count, { one: "month", other: "months" });

export const en = {
  back: "Back",
  cancel: "Cancel",
  save: "Save",
  delete: "Delete",
  ok: "OK",
  applyFilters: "Apply filters",
  gotIt: "Got it",
  none: "None",

  language: "Language",

  navOverview: "Overview",
  navTransactions: "Transactions",
  navAccounts: "Accounts",
  navSettings: "Settings",

  authSignIn: "Sign in to track your expenses",
  authTelegramLogin: "Secure login via Telegram",

  inviteAddingTitle: "Adding you to a family",
  inviteAddingDescription: "Please wait while we set up your shared access...",
  inviteInvalidTitle: "Invalid invite",
  inviteGoToOverview: "Go to Overview",
  inviteNoCode: "No invite code provided",
  inviteJoinFailed: "Failed to join family",
  inviteWelcomeTitle: "Welcome to the family!",
  inviteSharedAccessWith: (name: string) => `Shared access with ${name}`,
  inviteManageInSettings: "You can manage this in settings",
  inviteSomeone: "Someone",

  overviewExpensesLast30Days: "Expenses · Last 30 days",
  overviewMonthlyBreakdown: "Monthly breakdown",
  overviewViewAll: "View all",
  overviewRecent: "Recent",
  overviewSeeAll: "See all",
  overviewNoTransactions: "No transactions",
  overviewNoTransactionsDescription:
    "Add your first expense to see your spending patterns",
  monthlyBreakdownSettingsTitle: "Monthly breakdown settings",
  monthlyBreakdownSettingsIncludedAccounts: "Included accounts",
  monthlyBreakdownAccountsTitle: "Included accounts",

  settingsTitle: "Settings",
  settingsFamily: "Family",
  settingsManageFamily: "Manage family",
  settingsMemberCount: (count: number) =>
    `${count} ${plural(count, { one: "member", other: "members" })}`,
  settingsTheme: "Theme",
  settingsLight: "Light",
  settingsDark: "Dark",
  settingsTelegramGroup: "Telegram group",
  settingsLogout: "Logout",
  settingsLogoutDescription: "Are you sure you want to logout?",

  baseCurrency: "Base currency",
  baseCurrencySelect: "Select currency",
  baseCurrencyDescription:
    "All transaction stats will be displayed in this currency",
  baseCurrencyChangeTitle: "Change base currency",
  baseCurrencyChangeDescription: (currencyName: string) =>
    `Changing the base currency to ${currencyName} will recalculate all your transactions using historical exchange rates.`,
  baseCurrencySlowTitle: "This may take some time",
  baseCurrencySlowDescription:
    "Depending on the number of transactions, this operation may take a while to complete. Please don't close the app while it's running.",
  baseCurrencyRecalculate: "Recalculate",
  baseCurrencyRecalculating: "Recalculating...",
  baseCurrencyUpdateFailed: "Failed to update base currency",

  familyTitle: "Family",
  familyInviteTitle: "Invite to family",
  familyInviteDescription:
    "Invite people to your family to have shared expenses",
  familyGenerateInvite: "Generate invite",
  familyGeneratingInvite: "Generating...",
  familyMembers: "Family members",
  familyHelpShareTitle: "Share expenses together",
  familyHelpShareDescription:
    "When you invite someone to your family, they'll be able to see and add transactions to all your shared bank accounts",
  familyHelpVisibilityTitle: "Everyone sees everything",
  familyHelpVisibilityDescription:
    "All family members can see all transactions and accounts. Only invite people you trust",
  familyActiveInvite: "Active invite",
  familyInviteExpires: (relativeTime: string) => `Expires ${relativeTime}`,
  familyCopyLink: "Copy link",
  familyCopied: "Copied!",

  accountsTitle: "Accounts",
  accountsCreate: "Create account",
  accountsReorder: "Reorder accounts",
  accountsNoAccounts: "No accounts",
  accountsNoAccountsDescription:
    "Please create your first account to get started",
  accountsEditTitle: "Edit account",
  accountsAddTitle: "Add account",
  accountsName: "Account Name",
  accountsNamePlaceholder: "",
  accountsColor: "Color",
  accountsCurrency: "Currency",
  accountsTransaction: "Transaction",
  accountsTransactions: "Transactions",
  accountsAdvanced: "Advanced",
  accountsTransactionCount: (count: number) => `${count} ${transaction(count)}`,
  accountsLastTransaction: (date: string) => `Last: ${date}`,
  accountsDeleteTitle: "Delete account",
  accountsDeleteDescription:
    "This will permanently delete the account and all its transactions. This action cannot be undone.",
  accountsSelectTitle: "Select account",

  importSettingsTitle: "Import settings",
  importSettingsBankType: "Bank type",
  importSettingsSelectBankType: "Select bank type",
  importSettingsTimezone: "Timezone",
  importSettingsSelectTimezone: "Select timezone",

  transactionTypeExpense: "Expense",
  transactionTypeIncome: "Income",
  transactionsTitle: "Transactions",
  transactionsAddTitle: "Add transaction",
  transactionsEditTitle: "Edit transaction",
  transactionsAmount: "Amount",
  transactionsDescriptionPlaceholder: "Groceries",
  transactionsDate: "Date",
  transactionsTime: "Time",
  transactionsSelectDate: "Select date",
  transactionsRepeat: "Repeat",
  transactionsDeleteTitle: "Delete transaction",
  transactionsDeleteDescription:
    "This will permanently delete this transaction. This action cannot be undone.",
  transactionsNoFound: "No transactions found",
  transactionsNoFoundDescription:
    "Try updating your filters to see more transactions",
  transactionsExcludeFromTotals: "Exclude from totals",
  transactionsExcludeHelpTitle: "Why exclude transactions?",
  transactionsExcludeHelpDescription:
    "When you transfer money between your accounts, it's not really spending - it's just moving money. Mark these transactions as excluded so they don't affect your spending totals.",
  transactionsRate: (baseCurrency: string, rate: string, currency: string) =>
    `Rate: 1 ${baseCurrency} = ${rate} ${currency}`,

  uploadStatement: "Upload statement",
  uploadStatementUploading: "Uploading...",
  uploadStatementFailed: "Upload failed",
  uploadStatementSuccess: (removed: number, added: number) =>
    `Bank statement uploaded! Removed ${removed} ${transaction(removed)}, added ${added} ${transaction(added)}`,
  uploadResultTitle: "Upload Result",
  uploadResultMissing: "No upload results found.",
  uploadResultAdded: (count: number) =>
    `Added ${transaction(count)} (${count})`,
  uploadResultRemoved: (count: number) =>
    `Removed ${transaction(count)} (${count})`,
  uploadResultEmpty: "No transactions were added or removed.",

  filtersSearchPlaceholder: "Search transactions...",
  filtersContains: "Contains",
  filtersExact: "Exact",
  filtersAll: "All",
  filtersTimePeriod: "Time period",
  filtersLastDays: (days: number) =>
    `Last ${days} ${plural(days, { one: "day", other: "days" })}`,
  filtersLastMonths: (months: number) => `Last ${months} ${month(months)}`,
  filtersCustom: "Custom",
  filtersBankAccounts: "Bank accounts",
  filtersSelectAll: "Select all",
  filtersDeselectAll: "Deselect all",
  filtersSortBy: "Sort by",
  filtersNewestFirst: "Newest first",
  filtersOldestFirst: "Oldest first",
  filtersHighestAmount: "Highest amount",
  filtersLowestAmount: "Lowest amount",
  filtersCustomDateRange: "Custom date range",
  filtersAllTime: "All time",
  filtersAccountCount: (count: number) =>
    `${count} ${plural(count, { one: "account", other: "accounts" })}`,
  filtersYearMonths: (year: number, count: number) =>
    `${year} (${count} ${month(count)})`,
  filtersCustomMonths: (count: number) => `Custom (${count} ${month(count)})`,
  filtersDescriptionExact: (input: string) => `Description is '${input}'`,
  filtersDescriptionContains: (input: string) =>
    `Description contains '${input}'`,

  summaryExpenses: "Expenses",
  summaryIncome: "Income",

  dateToday: "Today",
  dateYesterday: "Yesterday",
} as const;
