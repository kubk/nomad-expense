import { z } from "zod";

const envSchema = z
  .object({
    CLOUDFLARE_ACCOUNT_ID: z.string(),
    CLOUDFLARE_API_TOKEN: z.string(),
    DB_URL: z.string(),
    STAGE: z.enum(["local", "production"]),
    FRONTEND_URL: z.string(),
    TELEGRAM_BOT_TOKEN: z.string(),
  })
  .required();

type Env = z.infer<typeof envSchema>;

let env: Env | undefined;

export function getEnv() {
  if (!env) {
    throw new Error("Should not be reached. Call setEnv first");
  }
  return env;
}

export function setEnv(envInput: any) {
  if ("HYPERDRIVE" in envInput) {
    envInput.DB_URL = envInput.HYPERDRIVE.connectionString;
  }
  env = envSchema.parse(envInput);
}
