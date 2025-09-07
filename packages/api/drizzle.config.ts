import { defineConfig } from "drizzle-kit";
import { getEnv, setEnv } from "./src/services/env";
import { D1Helper } from "@nerdfolio/drizzle-d1-helpers";

setEnv(process.env);

const dbHelper = D1Helper.get("DB");

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  ...(getEnv().STAGE !== "local"
    ? {
        driver: "d1-http",
        dbCredentials: {
          accountId: getEnv().CLOUDFLARE_ACCOUNT_ID,
          databaseId: getEnv().D1_DB_ID,
          token: getEnv().CLOUDFLARE_API_TOKEN,
        },
      }
    : {
        dbCredentials: {
          url: dbHelper.sqliteLocalFileCredentials.url,
        },
      }),
});
