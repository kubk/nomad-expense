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

export const ru: Translation = {
  cancelHint: (text) =>
    `${text}

Или нажмите /cancel, чтобы отменить действие`,
  operationCancelled: "❌ Действие отменено",
  openApp: "📱 Открыть приложение",
  telegramGroup: "Группа Telegram",
  startCaption: "Учитывайте траты по разным счетам и семьям",

  invalidAccountSelection: "Неверный счет. Попробуйте еще раз",
  failedProcessFile: "Не удалось обработать файл. Попробуйте еще раз",
  importCompleted: (added, removed) =>
    `✅ Импорт завершен!

📥 Добавлено: ${added} ${transaction(added)}

🗑️ Удалено: ${removed} ${transaction(removed)}`,
  failedImportTransactions:
    "❌ Не удалось импортировать транзакции. Проверьте формат файла и попробуйте еще раз.",
  enterValidDescription: "Введите корректное описание",
  transactionAdded: "✅ Транзакция добавлена!",
  failedCreateTransaction:
    "❌ Не удалось создать транзакцию. Попробуйте еще раз.",
  noAccountsYet: "У вас пока нет счетов. Добавьте счет в приложении",
  createAccount: "📱 Создать счет",
  invalidTransactionFormat:
    "Неверный формат. Используйте: [сумма] [валюта] [описание]\n\nПример: 10 USD coffee",
  amountMustBePositive: "Сумма должна быть положительным числом",
  unsupportedCurrency: (currency) => `Валюта '${currency}' не поддерживается`,
  noAccountForCurrency: (currency) =>
    `У вас нет счета в ${currency}. Сначала создайте его в приложении`,
  typeOrSelectTransactionDescription:
    "Введите или выберите описание транзакции",
  typeTransactionDescription: "Введите описание транзакции",
  noImportableAccounts:
    "У вас нет счетов для импорта. Чтобы добавить такой счет, откройте приложение, выберите счет > Дополнительно и укажите тип банка",
  selectAccount: "Выберите счет",
  commandNotRecognized: "Команда не распознана",

  userJoinedFamily: (name) => `🎉 ${name} присоединился к вашей семье!`,
  transactionReceived: (amount, currency, description, author) =>
    `💰 ${amount} ${currency} получено: *${description}*, автор: ${author}`,
  transactionSpent: (amount, currency, description, author) =>
    `💸 ${amount} ${currency} потрачено: *${description}*, автор: ${author}`,
  uploadedBankStatement: (author, accountName, added, removed) =>
    `📊 *${author}* загрузил выписку для *${accountName}*
📥 Добавлено: ${added} ${transaction(added)}
🗑️ Удалено: ${removed} ${transaction(removed)}`,

  invalidInviteCode: "Неверный код приглашения",
  inviteAlreadyUsed: "Это приглашение уже использовано",
  inviteExpired: "Срок действия приглашения истек",
  unauthorized: "Не авторизован",
  noFileProvided: "Файл не загружен",
  noAccountIdProvided: "ID счета не указан",
  accessDenied: "Доступ запрещен",
  internalServerError: "Внутренняя ошибка сервера",
};
