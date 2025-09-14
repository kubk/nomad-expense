import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { getEnv } from "./env";

export function getDb() {
  const client = postgres(getEnv().DB_URL, {
    prepare: false,
    fetch_types: false,
    max: 7,
    idle_timeout: 0,
    max_lifetime: 0,
  });
  return drizzle(client, { schema });
}

export type DB = ReturnType<typeof getDb>;
