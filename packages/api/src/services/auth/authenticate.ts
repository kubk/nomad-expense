import { validateTelegramLoginWidgetData } from "./validate-telegram-login-widget";
import { upsertUserByTelegramData } from "../../db/user/upsert-user-by-telegram-data";
import { userCacheGet, userCacheSet } from "../user-cache";
import { runInBackground } from "../run-in-background";
import { validateTelegramMiniAppData } from "./validate-telegram-mini-app-data";
import { telegramAuthMethod } from "./telegram-auth-method";
import { UserTelegramType } from "./schema";

export async function authenticate(
  req: Request,
): Promise<{ userId: string; familyId: string } | null> {
  const authQuery = req.headers.get("Authorization");
  if (!authQuery) {
    return null;
  }

  let result: UserTelegramType | null = null;
  if (authQuery.startsWith(telegramAuthMethod.loginWidget)) {
    result = validateTelegramLoginWidgetData(
      authQuery.slice(telegramAuthMethod.loginWidget.length),
    );
  }
  if (authQuery.startsWith(telegramAuthMethod.miniApp)) {
    result = await validateTelegramMiniAppData(
      authQuery.slice(telegramAuthMethod.miniApp.length),
    );
  }

  if (!result) {
    return null;
  }

  const telegramId = String(result.id);

  const cachedUser = await userCacheGet(telegramId);
  if (cachedUser) {
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
