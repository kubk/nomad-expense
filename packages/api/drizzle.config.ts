import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";
import { getEnv, setEnv } from "./src/services/env";

setEnv(process.env);

function getLocalD1DB() {
  try {
    const basePath = path.resolve(".wrangler");
    const dbFile = fs
      .readdirSync(basePath, { encoding: "utf-8", recursive: true })
      .find((f) => f.endsWith(".sqlite"));

    if (!dbFile) {
      throw new Error(`.sqlite file not found in ${basePath}`);
    }

    const url = path.resolve(basePath, dbFile);
    return url;
  } catch (err) {
    console.log(`Error  ${err.message}`);
  }
}

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
          url: getLocalD1DB(),
        },
      }),
});
