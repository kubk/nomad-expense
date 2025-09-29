import { Context, Keyboard } from "grammy";
import { getEnv } from "../services/env";
import { getDb } from "../services/db";
import { authenticate } from "../services/auth/authenticate";
import { getUserBotState, setUserBotState } from "../db/user/user-bot-state";
import { getFamilyImportableAccounts } from "../db/account/get-family-importable-accounts";
import { withCancelText } from "./with-cancel-text";
import { sendIsTyping } from "./send-is-typing";
import { replyStart } from "./reply-start";
import { importFile } from "../services/transaction-import/import-filte";

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

      await ctx.reply(resultMessage);

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
