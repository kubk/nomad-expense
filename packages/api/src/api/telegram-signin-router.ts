import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { upsertUserByTelegramData } from "../db/user/upsert-user-by-telegram-data";
import { generateSecureToken } from "../services/auth/generate-secure-token";
import {
  validateTelegramOidcToken,
  type TelegramOidcIdentity,
} from "../services/auth/telegram-oidc";
import type { UserTelegramType } from "../services/auth/schema";
import { getEnv } from "../services/env";
import { publicProcedure } from "./trpc";

export const telegramSigninConfig = publicProcedure.query(() => ({
  clientId: getEnv().TELEGRAM_OIDC_CLIENT_ID,
}));

export const telegramSignin = publicProcedure
  .input(z.object({ token: z.string().min(1), nonce: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    const env = getEnv();

    if (ctx.req.headers.get("origin") !== new URL(env.FRONTEND_URL).origin) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    let identity: TelegramOidcIdentity;
    try {
      identity = await validateTelegramOidcToken(
        input.token,
        env.TELEGRAM_OIDC_CLIENT_ID,
        input.nonce,
      );
    } catch {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const browserToken = generateSecureToken();
    const telegramUser: UserTelegramType = {
      id: identity.id,
      firstName:
        identity.given_name ??
        identity.name ??
        identity.preferred_username ??
        "",
      lastName: identity.family_name,
      languageCode: undefined,
      username: identity.preferred_username,
      photoUrl: identity.picture,
      start: null,
    };
    const user = await upsertUserByTelegramData(telegramUser, browserToken);
    if (!user.browserToken) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return { browserToken: user.browserToken };
  });
