import { getWorkerDbUrl } from "./worker-db-url";

if (process.env.DB_URL && process.env.VITEST_POOL_ID) {
  process.env.DB_URL = getWorkerDbUrl(
    process.env.DB_URL,
    Number(process.env.VITEST_POOL_ID),
  );
}
