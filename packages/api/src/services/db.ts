import { getEnv } from "./env";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";

function createNeonDb() {
  const sql = neon(getEnv().DATABASE_URL);
  const db = drizzleNeon(sql, { schema });
  return db;
}

type DB = ReturnType<typeof createNeonDb>;

function createPostgresDb() {
  const pg = postgres(getEnv().DATABASE_URL, {
    prepare: false,
    fetch_types: false,
    max: 7,
  });
  const db = drizzlePostgres(pg, { schema });
  return db as any as DB;
}

let db: DB | undefined;

export function getDb(): DB {
  if (getEnv().STAGE === "local") {
    return createPostgresDb();
  }
  if (!db) {
    db = createNeonDb();
  }
  return db;
}
