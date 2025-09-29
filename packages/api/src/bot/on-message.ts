import { Context, Keyboard } from "grammy";
import { getEnv } from "../services/env";
import { getDb } from "../services/db";
import { authenticate } from "../services/auth/authenticate";
import { getUserBotState, setUserBotState } from "../db/user/user-bot-state";
import { getFamilyImportableAccounts } from "../db/account/get-family-importable-accounts";
import { getFamilyAccounts } from "../db/account/get-family-accounts";
import { withCancelText } from "./with-cancel-text";
import { sendIsTyping } from "./send-is-typing";
import { replyStart } from "./reply-start";
import { importFile } from "../services/transaction-import/import-filte";
import { parseQuickTransaction } from "./parse-quick-transaction";
import {
  createDescriptionKeyboard,
  EXPENSE_BUTTON_TEXT,
  INCOME_BUTTON_TEXT,
} from "./transaction-helpers";
import { getMostUsedDescriptions } from "../services/transaction-descriptions";
import type { TransactionType } from "../db/enums";
import { createTransactionWithRules } from "../db/transaction/create-transaction-with-rules";

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

  sendIsTyping(ctx);

  if (userState?.type === "uploadStatement" && ctx.message.text) {
    const accountName = ctx.message.text.trim();

    const accounts = await getFamilyImportableAccounts(db, authResult.familyId);

    const selectedAccount = accounts.find(
      (account) => account.name === accountName,
    );

    if (!selectedAccount) {
      await ctx.reply("Invalid account selection. Please try again or /cancel");
      return;
    }

    const file = await ctx.api.getFile(userState.fileId);

    if (!file.file_path) {
      throw new Error("Could not get file path");
    }

    const fileUrl = `https://api.telegram.org/file/bot${getEnv().TELEGRAM_BOT_TOKEN}/${file.file_path}`;
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const fileBuffer = await response.arrayBuffer();

    const uploadedFile = new File([fileBuffer], file.file_path || "statement");

    try {
      const importResult = await importFile(db, selectedAccount, uploadedFile);

      const addedCount = importResult.added.length;
      const removedCount = importResult.removed.length;

      let resultMessage = `✅ Import completed!\n\n`;
      resultMessage += `📥 Added: ${addedCount} transaction${addedCount !== 1 ? "s" : ""}\n\n`;
      resultMessage += `🗑️ Removed: ${removedCount} transaction${removedCount !== 1 ? "s" : ""}`;

      await ctx.reply(resultMessage, {
        reply_markup: { remove_keyboard: true },
      });

      await setUserBotState(db, ctx.from.id.toString(), null);
    } catch (error) {
      console.error("Transaction import error:", error);
      await ctx.reply(
        "❌ Failed to import transactions. Please check your file format and try again.",
      );

      await setUserBotState(db, ctx.from.id.toString(), null);
    }
    return;
  }

  if (userState?.type === "selectingTransactionType" && ctx.message.text) {
    const text = ctx.message.text.trim();
    let transactionType: TransactionType;

    if (text === EXPENSE_BUTTON_TEXT) {
      transactionType = "expense";
    } else if (text === INCOME_BUTTON_TEXT) {
      transactionType = "income";
    } else {
      await ctx.reply("Please select a valid transaction type or /cancel");
      return;
    }

    if (userState.description) {
      // We already have description, create transaction directly
      try {
        await createTransactionWithRules(
          userState.accountId,
          authResult.familyId,
          userState.description,
          userState.amountHuman,
          transactionType,
        );

        await ctx.reply("✅ Transaction added successfully!", {
          reply_markup: { remove_keyboard: true },
        });
        await setUserBotState(db, ctx.from.id.toString(), null);
      } catch (error) {
        console.error("Transaction creation error:", error);
        await ctx.reply("❌ Failed to create transaction. Please try again.");
        await setUserBotState(db, ctx.from.id.toString(), null);
      }
    } else {
      // Need to ask for description
      await setUserBotState(db, ctx.from.id.toString(), {
        type: "addingTransactionDescription",
        accountId: userState.accountId,
        amountHuman: userState.amountHuman,
        transactionType,
      });

      const mostUsedDescriptions = await getMostUsedDescriptions(
        db,
        userState.accountId,
        transactionType,
      );

      if (mostUsedDescriptions.length > 0) {
        await ctx.reply(
          withCancelText("Type or select transaction description"),
          {
            reply_markup: createDescriptionKeyboard(mostUsedDescriptions),
          },
        );
      } else {
        await ctx.reply(withCancelText("Type transaction description"));
      }
    }
    return;
  }

  if (userState?.type === "addingTransactionDescription" && ctx.message.text) {
    const description = ctx.message.text.trim();

    if (!description) {
      await ctx.reply(withCancelText("Enter a valid description"));
      return;
    }

    try {
      await createTransactionWithRules(
        userState.accountId,
        authResult.familyId,
        description,
        userState.amountHuman,
        userState.transactionType,
      );

      await ctx.reply("✅ Transaction added successfully!", {
        reply_markup: { remove_keyboard: true },
      });
      await setUserBotState(db, ctx.from.id.toString(), null);
    } catch (error) {
      console.error("Transaction creation error:", error);
      await ctx.reply("❌ Failed to create transaction. Please try again.");
      await setUserBotState(db, ctx.from.id.toString(), null);
    }
    return;
  }

  if (!userState && ctx.message.text) {
    // Check if message looks like a transaction: "10 THB" or "3 USD Coffee"
    const userAccounts = await getFamilyAccounts(db, authResult.familyId);
    const parseResult = parseQuickTransaction(ctx.message.text, userAccounts);

    if ("error" in parseResult) {
      await ctx.reply(withCancelText("Enter a valid transaction"));
    } else {
      await setUserBotState(db, ctx.from.id.toString(), {
        type: "selectingTransactionType",
        accountId: parseResult.account.id,
        amountHuman: parseResult.amount,
        description: parseResult.description,
      });

      await ctx.reply(withCancelText("Please select transaction type"), {
        reply_markup: new Keyboard()
          .text(EXPENSE_BUTTON_TEXT)
          .text(INCOME_BUTTON_TEXT)
          .oneTime(true),
      });
      return;
    }
  }

  if (!userState && ctx.message.document?.file_id) {
    const accounts = await getFamilyImportableAccounts(db, authResult.familyId);

    if (accounts.length === 0) {
      await ctx.reply(
        "You have no importable accounts. To add one, open the app, select an account > Advanced and choose a bank type",
      );
      return;
    }

    await setUserBotState(db, ctx.from.id.toString(), {
      type: "uploadStatement",
      fileId: ctx.message.document.file_id,
    });

    let accountsKeyboard = new Keyboard();
    for (const account of accounts) {
      accountsKeyboard = accountsKeyboard.row().text(account.name);
    }
    accountsKeyboard = accountsKeyboard.oneTime(true);

    await ctx.reply(withCancelText("Select an account"), {
      reply_markup: accountsKeyboard,
    });

    return;
  }

  await ctx.reply("Command not recognized");
  await replyStart(ctx);
}
