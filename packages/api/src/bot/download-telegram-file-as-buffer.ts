import { Context } from "grammy";
import { getEnv } from "../services/env";

type Result =
  | {
      type: "error";
      message: string;
    }
  | { type: "success"; buffer: ArrayBuffer; filePath: string };

export async function downloadTelegramFileAsBuffer(
  ctx: Context,
  fileId: string,
): Promise<Result> {
  const file = await ctx.api.getFile(fileId);

  if (!file.file_path) {
    return {
      type: "error",
      message: "Could not get file path",
    };
  }

  const fileUrl = `https://api.telegram.org/file/bot${getEnv().TELEGRAM_BOT_TOKEN}/${file.file_path}`;
  const response = await fetch(fileUrl);

  if (!response.ok) {
    return {
      type: "error",
      message: `Failed to download file: ${response.statusText}`,
    };
  }

  return {
    type: "success",
    buffer: await response.arrayBuffer(),
    filePath: file.file_path,
  };
}
