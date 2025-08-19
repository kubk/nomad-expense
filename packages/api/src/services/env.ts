import { z } from "zod";

const envSchema = z
  .object({
    CLOUDFLARE_ACCOUNT_ID: z.string(),
    CLOUDFLARE_API_TOKEN: z.string(),
    D1_DB_ID: z.string(),
    STAGE: z.enum(["local", "production"]),
    FRONTEND_URL: z.string(),
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
  env = envSchema.parse(envInput);
}
