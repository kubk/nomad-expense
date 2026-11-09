import { eq } from "drizzle-orm";
import type { DB } from "../db";
import { bankConnectionTable } from "../../db/schema";
import type { BankConnection } from "../../db/db-types";
import { getBankConnectionCredentials } from "../../db/bank-connection/bank-connection-credentials";
import { reportError } from "../../lib/report-error";
import { syncWiseConnection } from "./sync-wise-connection";

async function syncConnection(db: DB, connection: BankConnection, now: Date) {
  const credentials = getBankConnectionCredentials(connection);
  switch (credentials.provider) {
    case "wise":
      return syncWiseConnection(db, connection, credentials.apiToken, now);
    default:
      return credentials.provider satisfies never;
  }
}

export async function syncBankConnections(db: DB, now: Date) {
  const connections = await db.select().from(bankConnectionTable);

  for (const connection of connections) {
    try {
      await syncConnection(db, connection, now);
      await db
        .update(bankConnectionTable)
        .set({ lastSyncedAt: now, lastSyncError: null })
        .where(eq(bankConnectionTable.id, connection.id));
    } catch (error) {
      await reportError("Bank sync failed", error, {
        connection: `${connection.name} (${connection.id})`,
        family: connection.familyId,
      });
      await db
        .update(bankConnectionTable)
        .set({
          lastSyncError: error instanceof Error ? error.message : String(error),
        })
        .where(eq(bankConnectionTable.id, connection.id));
    }
  }
}
