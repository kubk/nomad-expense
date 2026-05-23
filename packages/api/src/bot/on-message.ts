import { Context, InlineKeyboard } from "grammy";
import { getDb } from "../services/db";
import { authenticate } from "../services/auth/authenticate";
import { getUserBotState, setUserBotState } from "../db/user/user-bot-state";
import { getFamilyImportableAccounts } from "../db/account/get-family-importable-accounts";
import { getFamilyAccounts } from "../db/account/get-family-accounts";
import { withCancelText } from "./with-cancel-text";
import { sendIsTyping } from "./send-is-typing";
import { importFile } from "../services/transaction-import/import-filte";
import { parseQuickTransaction } from "./parse-quick-transaction";
import { buildReplyKeyboard } from "./build-reply-keyboard";
import { getMostUsedDescriptions } from "../services/transaction-descriptions";
import { createTransactionWithRules } from "../db/transaction/create-transaction-with-rules";
import { downloadTelegramFileAsBuffer } from "./download-telegram-file-as-buffer";
import { getEnv } from "../services/env";
import { getTranslation } from "../translations/translations";

export async function onMessage(ctx: Context) {
  if (!ctx.from || !ctx.message) {
    return;
  }
  const db = getDb();
  const userState = await getUserBotState(db, ctx.from.id.toString());

  const authResult = await authenticate({ type: "bot", botUser: ctx.from });
  if (!authResult) {
    return;
  }
  const { t } = getTranslation(authResult);

  sendIsTyping(ctx);

  if (userState?.type === "uploadStatement" && ctx.message.text) {
    const accountName = ctx.message.text.trim();

    const accounts = await getFamilyImportableAccounts(db, authResult.familyId);

    const selectedAccount = accounts.find(
      (account) => account.name === accountName,
    );

    if (!selectedAccount) {
      await ctx.reply(withCancelText(t("invalidAccountSelection"), authResult));
      return;
    }

    const fileBuffer = await downloadTelegramFileAsBuffer(
      ctx,
      userState.fileId,
    );
    if (fileBuffer.type === "error") {
      console.error("Failed to process file", fileBuffer.message);
      await ctx.reply(withCancelText(t("failedProcessFile"), authResult));
      return;
    }

    const uploadedFile = new File([fileBuffer.buffer], fileBuffer.filePath);

    try {
      const importResult = await importFile(
        db,
        selectedAccount,
        uploadedFile,
        authResult.userId,
      );

      const addedCount = importResult.added.length;
      const removedCount = importResult.removed.length;

      await ctx.reply(t("importCompleted", addedCount, removedCount), {
        reply_markup: { remove_keyboard: true },
      });

      await setUserBotState(db, ctx.from.id.toString(), null);
    } catch (error) {
      console.error("Transaction import error:", error);
      await ctx.reply(t("failedImportTransactions"));

      await setUserBotState(db, ctx.from.id.toString(), null);
    }
    return;
  }

  if (userState?.type === "addingTransactionDescription" && ctx.message.text) {
    const description = ctx.message.text.trim();

    if (!description) {
      await ctx.reply(withCancelText(t("enterValidDescription"), authResult));
      return;
    }

    try {
      await createTransactionWithRules(
        userState.accountId,
        authResult.familyId,
        description,
        userState.amountCents,
        userState.transactionType,
        authResult.userId,
      );

      await ctx.reply(t("transactionAdded"), {
        reply_markup: { remove_keyboard: true },
      });
      await setUserBotState(db, ctx.from.id.toString(), null);
    } catch (error) {
      console.error("Transaction creation error:", error);
      await ctx.reply(t("failedCreateTransaction"));
      await setUserBotState(db, ctx.from.id.toString(), null);
    }
    return;
  }

  if (!userState && ctx.message.text) {
    const userAccounts = await getFamilyAccounts(db, authResult.familyId);

    if (userAccounts.length === 0) {
      await ctx.reply(t("noAccountsYet"), {
        reply_markup: new InlineKeyboard().webApp(
          t("createAccount"),
          getEnv().FRONTEND_URL + "?type=accountPicker",
        ),
      });
      return;
    }

    // Check if message looks like a transaction: "10 THB" or "3 USD Coffee"
    const parseResult = parseQuickTransaction(ctx.message.text, userAccounts);

    if ("error" in parseResult) {
      let errorMessage = "";
      switch (parseResult.error) {
        case "invalid_input":
          errorMessage = t("invalidTransactionFormat");
          break;
        case "invalid_number":
          errorMessage = t("amountMustBePositive");
          break;
        case "invalid_currency":
          errorMessage = t("unsupportedCurrency", parseResult.currency ?? "");
          break;
        case "no_account_for_currency":
          errorMessage = t("noAccountForCurrency", parseResult.currency ?? "");
          break;
      }
      await ctx.reply(withCancelText(errorMessage, authResult));
    } else {
      // If we have transaction type and description, create transaction immediately
      if (parseResult.transactionType && parseResult.description) {
        try {
          await createTransactionWithRules(
            parseResult.account.id,
            authResult.familyId,
            parseResult.description,
            parseResult.amountCents,
            parseResult.transactionType,
            authResult.userId,
          );

          await ctx.reply(t("transactionAdded"), {
            reply_markup: { remove_keyboard: true },
          });
          return;
        } catch (error) {
          console.error("Transaction creation error:", error);
          await ctx.reply(t("failedCreateTransaction"));
          return;
        }
      }

      // If we have transaction type but no description, ask for description
      if (parseResult.transactionType && !parseResult.description) {
        await setUserBotState(db, ctx.from.id.toString(), {
          type: "addingTransactionDescription",
          accountId: parseResult.account.id,
          amountCents: parseResult.amountCents,
          transactionType: parseResult.transactionType,
        });

        const mostUsedDescriptions = await getMostUsedDescriptions(
          db,
          parseResult.account.id,
          parseResult.transactionType,
        );

        if (mostUsedDescriptions.length > 0) {
          await ctx.reply(
            withCancelText(t("typeOrSelectTransactionDescription"), authResult),
            {
              reply_markup: buildReplyKeyboard(mostUsedDescriptions),
            },
          );
        } else {
          await ctx.reply(
            withCancelText(t("typeTransactionDescription"), authResult),
          );
        }
        return;
      }
    }
  }

  if (!userState && ctx.message.document?.file_id) {
    const accounts = await getFamilyImportableAccounts(db, authResult.familyId);

    if (accounts.length === 0) {
      await ctx.reply(t("noImportableAccounts"));
      return;
    }

    await setUserBotState(db, ctx.from.id.toString(), {
      type: "uploadStatement",
      fileId: ctx.message.document.file_id,
    });

    const accountsKeyboard = buildReplyKeyboard(
      accounts.map((account) => account.name),
    );

    await ctx.reply(withCancelText(t("selectAccount"), authResult), {
      reply_markup: accountsKeyboard,
    });

    return;
  }

  await ctx.reply(t("commandNotRecognized"));
}
