import { validateTelegramLoginWidgetData } from "./validate-telegram-login-widget";
import { upsertUserByTelegramData } from "../../db/user/upsert-user-by-telegram-data";
import { userCacheGet, userCacheSet } from "../user-cache";
import { runInBackground } from "../run-in-background";
import { validateTelegramMiniAppData } from "./validate-telegram-mini-app-data";
import { telegramAuthMethod } from "./telegram-auth-method";
import { UserTelegramType } from "./schema";
import { User } from "grammy/types";

export async function authenticate(
  input: { type: "api"; req: Request } | { type: "bot"; botUser: User },
): Promise<{ userId: string; familyId: string } | null> {
  let telegramUser: UserTelegramType | null = null;

  if (input.type === "api") {
    const { req } = input;
    const authQuery = req.headers.get("Authorization");
    if (!authQuery) {
      return null;
    }

    if (authQuery.startsWith(telegramAuthMethod.loginWidget)) {
      telegramUser = validateTelegramLoginWidgetData(
        authQuery.slice(telegramAuthMethod.loginWidget.length),
      );
    }
    if (authQuery.startsWith(telegramAuthMethod.miniApp)) {
      telegramUser = await validateTelegramMiniAppData(
        authQuery.slice(telegramAuthMethod.miniApp.length),
      );
    }
  } else if (input.type === "bot") {
    const { botUser } = input;
    telegramUser = {
      id: botUser.id,
      username: botUser.username,
      firstName: botUser.first_name,
      lastName: botUser.last_name,
      start: null,
      languageCode: botUser.language_code,
      photoUrl: undefined,
    };
  }

  if (!telegramUser) {
    return null;
  }

  const telegramId = String(telegramUser.id);

  const cachedUser = await userCacheGet(telegramId);
  if (cachedUser) {
    return cachedUser;
  }

  const user = await upsertUserByTelegramData(telegramUser);

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
