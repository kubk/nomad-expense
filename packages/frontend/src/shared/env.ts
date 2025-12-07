import * as v from "valibot";

export const EnvSchema = v.object({
  VITE_API_URL: v.string(),
  VITE_STAGE: v.picklist(["local", "staging", "production"]),
  VITE_USER_ID: v.optional(v.string()),
});

export const env = v.parse(EnvSchema, import.meta.env);
