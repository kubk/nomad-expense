import type { Translation } from "./translations";
import { createPlural } from "./plural";

const plural = createPlural("ru");
const transaction = (count: number) =>
  plural(count, {
    one: "транзакция",
    few: "транзакции",
    many: "транзакций",
    other: "транзакции",
  });
const month = (count: number) =>
  plural(count, {
    one: "месяц",
    few: "месяца",
    many: "месяцев",
    other: "месяца",
  });

export const ru: Translation = {
  back: "Назад",
  cancel: "Отмена",
  save: "Сохранить",
  delete: "Удалить",
  ok: "ОК",
  applyFilters: "Применить фильтры",
  gotIt: "Понятно",
  none: "Нет",

  language: "Язык",

  navOverview: "Обзор",
  navTransactions: "Транзакции",
  navAccounts: "Счета",
  navSettings: "Настройки",

  authSignIn: "Войдите, чтобы отслеживать траты",
  authTelegramLogin: "Безопасный вход через Telegram",

  inviteAddingTitle: "Добавляем вас в семью",
  inviteAddingDescription: "Подождите, пока мы настраиваем общий доступ...",
  inviteInvalidTitle: "Недействительное приглашение",
  inviteGoToOverview: "Перейти к обзору",
  inviteNoCode: "Код приглашения не указан",
  inviteJoinFailed: "Не удалось присоединиться к семье",
  inviteWelcomeTitle: "Добро пожаловать в семью!",
  inviteSharedAccessWith: (name) => `Общий доступ с ${name}`,
  inviteManageInSettings: "Этим можно управлять в настройках",
  inviteSomeone: "Кто-то",

  overviewExpensesLast30Days: "Траты · последние 30 дней",
  overviewMonthlyBreakdown: "По месяцам",
  overviewViewAll: "Все",
  overviewRecent: "Недавние",
  overviewSeeAll: "Все",
  overviewNoTransactions: "Нет транзакций",
  overviewNoTransactionsDescription:
    "Добавьте первую трату, чтобы увидеть структуру трат",

  settingsTitle: "Настройки",
  settingsFamily: "Семья",
  settingsManageFamily: "Управлять семьей",
  settingsMemberCount: (count) =>
    `${count} ${plural(count, {
      one: "участник",
      few: "участника",
      many: "участников",
      other: "участника",
    })}`,
  settingsTheme: "Тема",
  settingsLight: "Светлая",
  settingsDark: "Темная",
  settingsTelegramGroup: "Группа Telegram",
  settingsLogout: "Выйти",
  settingsLogoutDescription: "Вы точно хотите выйти?",

  baseCurrency: "Базовая валюта",
  baseCurrencySelect: "Выберите валюту",
  baseCurrencyDescription:
    "Вся статистика по транзакциям будет показана в этой валюте",
  baseCurrencyChangeTitle: "Изменить базовую валюту",
  baseCurrencyChangeDescription: (currencyName) =>
    `Изменение базовой валюты на ${currencyName} пересчитает все транзакции по историческим курсам.`,
  baseCurrencySlowTitle: "Это может занять время",
  baseCurrencySlowDescription:
    "В зависимости от количества транзакций пересчет может занять некоторое время. Не закрывайте приложение, пока он выполняется.",
  baseCurrencyRecalculate: "Пересчитать",
  baseCurrencyRecalculating: "Пересчитываем...",
  baseCurrencyUpdateFailed: "Не удалось обновить базовую валюту",

  familyTitle: "Семья",
  familyInviteTitle: "Пригласить в семью",
  familyInviteDescription: "Пригласите людей в семью, чтобы вести общие траты",
  familyGenerateInvite: "Создать приглашение",
  familyGeneratingInvite: "Создаем...",
  familyMembers: "Участники семьи",
  familyHelpShareTitle: "Ведите траты вместе",
  familyHelpShareDescription:
    "Когда вы приглашаете кого-то в семью, он сможет видеть и добавлять транзакции во все общие счета",
  familyHelpVisibilityTitle: "Все видят все",
  familyHelpVisibilityDescription:
    "Все участники семьи видят все транзакции и счета. Приглашайте только тех, кому доверяете",
  familyActiveInvite: "Активное приглашение",
  familyInviteExpires: (relativeTime) => `Истекает ${relativeTime}`,
  familyCopyLink: "Скопировать ссылку",
  familyCopied: "Скопировано!",

  accountsTitle: "Счета",
  accountsCreate: "Создать счет",
  accountsReorder: "Изменить порядок",
  accountsNoAccounts: "Нет счетов",
  accountsNoAccountsDescription: "Создайте первый счет, чтобы начать",
  accountsEditTitle: "Редактировать счет",
  accountsAddTitle: "Добавить счет",
  accountsName: "Название счета",
  accountsNamePlaceholder: "",
  accountsColor: "Цвет",
  accountsCurrency: "Валюта",
  accountsTransaction: "Транзакция",
  accountsTransactions: "Транзакции",
  accountsAdvanced: "Дополнительно",
  accountsTransactionCount: (count) => `${count} ${transaction(count)}`,
  accountsLastTransaction: (date) => `Последняя: ${date}`,
  accountsDeleteTitle: "Удалить счет",
  accountsDeleteDescription:
    "Счет и все его транзакции будут удалены навсегда. Это действие нельзя отменить.",
  accountsSelectTitle: "Выберите счет",

  importSettingsTitle: "Настройки импорта",
  importSettingsBankType: "Тип банка",
  importSettingsSelectBankType: "Выберите тип банка",
  importSettingsTimezone: "Часовой пояс",
  importSettingsSelectTimezone: "Выберите часовой пояс",

  transactionTypeExpense: "Трата",
  transactionTypeIncome: "Доход",
  transactionsTitle: "Транзакции",
  transactionsAddTitle: "Добавить транзакцию",
  transactionsEditTitle: "Редактировать транзакцию",
  transactionsAmount: "Сумма",
  transactionsDescriptionPlaceholder: "Продукты",
  transactionsDate: "Дата",
  transactionsTime: "Время",
  transactionsSelectDate: "Выберите дату",
  transactionsRepeat: "Повторить",
  transactionsDeleteTitle: "Удалить транзакцию",
  transactionsDeleteDescription:
    "Эта транзакция будет удалена навсегда. Это действие нельзя отменить.",
  transactionsNoFound: "Транзакции не найдены",
  transactionsNoFoundDescription:
    "Измените фильтры, чтобы увидеть больше транзакций",
  transactionsExcludeFromTotals: "Исключить из итогов",
  transactionsExcludeHelpTitle: "Зачем исключать транзакции?",
  transactionsExcludeHelpDescription:
    "Когда вы переводите деньги между своими счетами, это не трата, а просто перемещение денег. Пометьте такие транзакции как исключенные, чтобы они не влияли на итоговые траты.",
  transactionsRate: (baseCurrency, rate, currency) =>
    `Курс: 1 ${baseCurrency} = ${rate} ${currency}`,

  uploadStatement: "Загрузить выписку",
  uploadStatementUploading: "Загрузка...",
  uploadStatementFailed: "Не удалось загрузить",
  uploadStatementSuccess: (removed, added) =>
    `Выписка загружена. Удалено: ${removed} ${transaction(removed)}, добавлено: ${added} ${transaction(added)}`,
  uploadResultTitle: "Результат загрузки",
  uploadResultMissing: "Результаты загрузки не найдены.",
  uploadResultAdded: (count) => `Добавлено ${transaction(count)} (${count})`,
  uploadResultRemoved: (count) => `Удалено ${transaction(count)} (${count})`,
  uploadResultEmpty: "Транзакции не были добавлены или удалены.",

  filtersSearchPlaceholder: "Поиск транзакций...",
  filtersContains: "Содержит",
  filtersExact: "Точно",
  filtersAll: "Все",
  filtersTimePeriod: "Период",
  filtersLastDays: (days) =>
    `За ${days} ${plural(days, {
      one: "день",
      few: "дня",
      many: "дней",
      other: "дня",
    })}`,
  filtersLastMonths: (months) => `За ${months} ${month(months)}`,
  filtersCustom: "Выбрать",
  filtersBankAccounts: "Счета",
  filtersSelectAll: "Выбрать все",
  filtersDeselectAll: "Снять выбор",
  filtersSortBy: "Сортировка",
  filtersNewestFirst: "Сначала новые",
  filtersOldestFirst: "Сначала старые",
  filtersHighestAmount: "Сначала крупные",
  filtersLowestAmount: "Сначала мелкие",
  filtersCustomDateRange: "Свой период",
  filtersAllTime: "Все время",
  filtersAccountCount: (count) =>
    `${count} ${plural(count, {
      one: "счет",
      few: "счета",
      many: "счетов",
      other: "счета",
    })}`,
  filtersYearMonths: (year, count) => `${year} (${count} ${month(count)})`,
  filtersCustomMonths: (count) => `Выбрано (${count} ${month(count)})`,
  filtersDescriptionExact: (input) => `Описание: "${input}"`,
  filtersDescriptionContains: (input) => `Описание содержит "${input}"`,

  summaryExpenses: "Траты",
  summaryIncome: "Доходы",

  dateToday: "Сегодня",
  dateYesterday: "Вчера",
};
