import { getEnv } from "../env";
import { userTelegramSchema, UserTelegramType } from "./schema";

export async function validateTelegramMiniAppData(
  queryString: string,
): Promise<UserTelegramType | null> {
  const botToken = getEnv().TELEGRAM_BOT_TOKEN;
  const queryStringObject = Object.fromEntries(
    new URLSearchParams(queryString),
  );

  const encoder = new TextEncoder();
  const checkString = Object.keys(queryStringObject)
    .filter((key) => key !== "hash")
    .map((key) => `${key}=${queryStringObject[key]}`)
    .sort()
    .join("\n");

  const secretKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign"],
  );
  const secret = await crypto.subtle.sign(
    "HMAC",
    secretKey,
    encoder.encode(botToken),
  );
  const signatureKey = await crypto.subtle.importKey(
    "raw",
    secret,
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    signatureKey,
    encoder.encode(checkString),
  );

  const computedHash = [...new Uint8Array(signature)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (computedHash === queryStringObject["hash"]) {
    return userTelegramSchema.parse(JSON.parse(queryStringObject["user"]));
  }

  return null;
}
