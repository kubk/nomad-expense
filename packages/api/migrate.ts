import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { getEnv, setEnv } from "./src/services/env";

setEnv(process.env);

const databaseUrl = drizzle(
  postgres(getEnv().DB_URL, {
    ssl: getEnv().STAGE === "local" ? false : "require",
    max: 1,
  }),
);

const main = async () => {
  try {
    await migrate(databaseUrl, { migrationsFolder: "drizzle" });
    console.log("Migration complete");
  } catch (error) {
    console.log(error);
  }
  process.exit(0);
};
main();
