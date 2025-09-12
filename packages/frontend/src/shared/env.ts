import * as v from "valibot";

export const EnvSchema = v.object({
  VITE_API_URL: v.string(),
  VITE_STAGE: v.picklist(["local", "staging", "production"]),
  VITE_AUTH_QUERY: v.optional(v.string()),
  VITE_TELEGRAM_BOT_USERNAME: v.string(),
});

export const env = v.parse(EnvSchema, import.meta.env);
