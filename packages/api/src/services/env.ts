import { z } from "zod";

const envSchema = z
  .object({
    DATABASE_URL: z.string(),
    STAGE: z.enum(["local", "development", "production"]),
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
