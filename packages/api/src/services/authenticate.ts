import { validateTelegramLoginWidgetData } from "./validate-telegram-login-widget";
import { upsertUserByTelegramData } from "../db/user/upsert-user-by-telegram-data";
import { userCacheGet, userCacheSet } from "./user-cache";
import { runInBackground } from "./run-in-background";

export async function authenticate(
  req: Request,
): Promise<{ userId: string; familyId: string } | null> {
  const authQuery = req.headers.get("Authorization");
  if (!authQuery) {
    return null;
  }

  const result = validateTelegramLoginWidgetData(authQuery);
  if (!result) {
    return null;
  }

  const telegramId = String(result.id);

  const cachedUser = await userCacheGet(telegramId);
  if (cachedUser) {
    console.log("User found in cache");
    return cachedUser;
  }

  const user = await upsertUserByTelegramData(result);

  runInBackground(
    userCacheSet(telegramId, {
      userId: user.id,
      familyId: user.familyId,
    }),
  );

  return {
    userId: user.id,
    familyId: user.familyId,
  };
}
