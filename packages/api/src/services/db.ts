import { drizzle } from "drizzle-orm/d1";

type DB = ReturnType<typeof drizzle>;

let db: DB | undefined;

// Should be D1Database
export function setDb(d1: any) {
  db = drizzle(d1);
}

export function getDb(): DB {
  if (!db) {
    throw new Error("DB is not initialized, call setDb first");
  }
  return db;
}
