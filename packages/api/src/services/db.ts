import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { getEnv } from "./env";

export function getDb() {
  const client = postgres(getEnv().DB_URL, {
    prepare: false,
    fetch_types: false,
  });
  return drizzle(client, { schema });
}

export type DB = ReturnType<typeof getDb>;
