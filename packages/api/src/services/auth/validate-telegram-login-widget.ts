import crypto from "node:crypto";
import { getEnv } from "../env";
import { userTelegramSchema, UserTelegramType } from "./schema";

export const validateTelegramLoginWidgetData = (
  dataString: string,
): UserTelegramType | null => {
  const botToken = getEnv().TELEGRAM_BOT_TOKEN;
  try {
    const dataObject: Record<any, any> = JSON.parse(dataString);
    const { hash, ...rest } = dataObject;

    const queryStringObject = Object.fromEntries(new URLSearchParams(rest));

    const checkString = Object.keys(rest)
      .map((key) => `${key}=${queryStringObject[key]}`)
      .sort()
      .join("\n");

    const secretKey = crypto.createHash("sha256").update(botToken).digest();
    const checkHash = crypto
      .createHmac("sha256", secretKey)
      .update(checkString)
      .digest("hex");

    if (hash !== checkHash) {
      return null;
    }

    return userTelegramSchema.parse(rest);
  } catch (e) {
    console.log("telegram login widget data validation failed", e, dataString);
    return null;
  }
};
