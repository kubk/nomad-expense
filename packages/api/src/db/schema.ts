import { pgTable, uuid } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: uuid().primaryKey().notNull().defaultRandom(),
});
