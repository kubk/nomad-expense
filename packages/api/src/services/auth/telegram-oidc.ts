import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import { z } from "zod";

const telegramKeys = createRemoteJWKSet(
  new URL("https://oauth.telegram.org/.well-known/jwks.json"),
);

const telegramClaimsSchema = z.object({
  sub: z.string().min(1),
  id: z.preprocess(
    (value) =>
      typeof value === "string" && /^[1-9]\d*$/.test(value)
        ? Number(value)
        : value,
    z.number().int().positive().safe(),
  ),
  nonce: z.string().min(1),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  preferred_username: z.string().optional(),
  picture: z.string().url().optional(),
});

export type TelegramOidcIdentity = z.infer<typeof telegramClaimsSchema>;

export async function validateTelegramOidcToken(
  token: string,
  clientId: string,
  nonce: string,
  keys: JWTVerifyGetKey = telegramKeys,
) {
  const { payload } = await jwtVerify(token, keys, {
    issuer: "https://oauth.telegram.org",
    audience: clientId,
    algorithms: ["RS256", "ES256"],
    maxTokenAge: "15m",
    requiredClaims: ["exp", "iat", "sub"],
  });
  const claims = telegramClaimsSchema.parse(payload);
  if (claims.nonce !== nonce) throw new Error("Invalid Telegram login nonce");
  return claims;
}
