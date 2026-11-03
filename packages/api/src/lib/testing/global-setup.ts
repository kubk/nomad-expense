import os from "node:os";
import path from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import type { TestProject } from "vitest/node";
import { getDbName, getWorkerDbUrl } from "./worker-db-url";

// Migrates the DB from DB_URL once, then clones it into one database per
// vitest worker so test files can run in parallel without sharing state
export async function setup(project: TestProject) {
  const templateDbUrl = process.env.DB_URL;
  if (!templateDbUrl) {
    throw new Error("DB_URL is required to run API tests");
  }

  const migrationClient = postgres(templateDbUrl, {
    max: 1,
    onnotice: () => {},
  });
  try {
    await migrate(drizzle(migrationClient), {
      migrationsFolder: path.resolve(import.meta.dirname, "../../../drizzle"),
    });
  } finally {
    await migrationClient.end();
  }

  const adminUrl = new URL(templateDbUrl);
  adminUrl.pathname = "/postgres";
  const admin = postgres(adminUrl.toString(), { max: 1, onnotice: () => {} });
  const templateDbName = getDbName(templateDbUrl);
  // maxWorkers is resolved after global setup, defaulting to fewer than the CPU count
  const maxWorkers =
    project.config.maxWorkers ||
    project.vitest.config.maxWorkers ||
    os.availableParallelism();
  try {
    const staleDbs = await admin<{ datname: string }[]>`
      SELECT datname FROM pg_database
      WHERE datname ~ ${`^${templateDbName}_[0-9]+$`}
    `;
    for (const { datname } of staleDbs) {
      await admin.unsafe(`DROP DATABASE "${datname}" WITH (FORCE)`);
    }
    for (let poolId = 1; poolId <= maxWorkers; poolId++) {
      const workerDbName = getDbName(getWorkerDbUrl(templateDbUrl, poolId));
      await admin.unsafe(
        `CREATE DATABASE "${workerDbName}" TEMPLATE "${templateDbName}"`,
      );
    }
  } finally {
    await admin.end();
  }
}
