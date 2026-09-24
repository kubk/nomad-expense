import { upsertUserByTelegramData } from "../../db/user/upsert-user-by-telegram-data";
import { userCacheGet, userCacheSet } from "../user-cache";
import { runInBackground } from "../run-in-background";
import { validateTelegramMiniAppData } from "./validate-telegram-mini-app-data";
import { telegramAuthMethod } from "./telegram-auth-method";
import type { UserTelegramType } from "./schema";
import type { User } from "grammy/types";
import { getEnv } from "../env";
import { getUserById } from "../../db/user/get-user-by-id";
import { getLanguage } from "../../translations/translations";
import { getUserByBrowserToken } from "../../db/user/get-user-by-browser-token";

export async function authenticate(
  input: { type: "api"; req: Request } | { type: "bot"; botUser: User },
): Promise<{ userId: string; familyId: string; language?: string } | null> {
  let telegramUser: UserTelegramType | null = null;

  if (input.type === "api") {
    const { req } = input;
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return null;
    }

    if (authorization.startsWith(`${telegramAuthMethod.browser} `)) {
      const browserToken = authorization.slice(
        telegramAuthMethod.browser.length + 1,
      );
      const user = /^[a-f0-9]{64}$/.test(browserToken)
        ? await getUserByBrowserToken(browserToken)
        : null;
      const telegramId = Number(user?.telegramId);
      if (
        user?.telegramId &&
        Number.isSafeInteger(telegramId) &&
        telegramId > 0
      ) {
        telegramUser = {
          id: telegramId,
          username: user.username || undefined,
          firstName: user.name || "",
          lastName: undefined,
          start: null,
          languageCode: undefined,
          photoUrl: user.avatarUrl || undefined,
        };
      }
    } else if (authorization.startsWith(telegramAuthMethod.miniApp)) {
      telegramUser = await validateTelegramMiniAppData(
        authorization.slice(telegramAuthMethod.miniApp.length),
      );
    } else if (
      getEnv().STAGE === "local" &&
      authorization.startsWith(telegramAuthMethod.u)
    ) {
      const userId = authorization.slice(telegramAuthMethod.u.length);
      const user = await getUserById(userId);

      if (user && user.telegramId) {
        telegramUser = {
          id: Number(user.telegramId),
          username: user.username || undefined,
          firstName: user.name || "",
          lastName: undefined,
          start: null,
          languageCode: undefined,
          photoUrl: user.avatarUrl || undefined,
        };
      }
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
  const language = getLanguage(telegramUser);

  const cachedUser = await userCacheGet(telegramId);
  if (cachedUser) {
    runInBackground(
      userCacheSet(telegramId, {
        userId: cachedUser.userId,
        familyId: cachedUser.familyId,
        language,
      }),
    );
    return {
      ...cachedUser,
      language,
    };
  }

  const user = await upsertUserByTelegramData(telegramUser);

  runInBackground(
    userCacheSet(telegramId, {
      userId: user.id,
      familyId: user.familyId,
      language,
    }),
  );

  return {
    userId: user.id,
    familyId: user.familyId,
    language,
  };
}
