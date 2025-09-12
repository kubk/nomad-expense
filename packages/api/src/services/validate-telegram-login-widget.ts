import crypto from "node:crypto";
import { getEnv } from "./env";
import { z } from "zod";

export const userTelegramSchema = z
  .object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string().optional(),
    language_code: z.string().optional(),
    photo_url: z.string().optional(),
    username: z.string().optional(),
    start: z.string().nullable().optional(),
  })
  .transform((result) => ({
    id: result.id,
    firstName: result.first_name,
    lastName: result.last_name,
    languageCode: result.language_code,
    photoUrl: result.photo_url,
    username: result.username,
    start: result.start,
  }));

export type UserTelegramType = z.infer<typeof userTelegramSchema>;

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
