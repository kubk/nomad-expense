import type { PgTable } from "drizzle-orm/pg-core";
import type { InferInsertModel } from "drizzle-orm";

export function isNonEmpty<T>(array: T[]): array is [T, ...T[]] {
  return array.length > 0;
}

/**
 * Generic typesafe utility for batched inserts that respects PostgreSQL limits
 */
export function batch<T extends PgTable>(
  // @ts-ignore
  table: T,
  data: InferInsertModel<T>[],
): InferInsertModel<T>[][] {
  if (data.length === 0) return [];

  // Calculate based on actual provided parameters
  const paramsPerRecord = Object.keys(data[0]).length;
  // PostgreSQL can handle 65535 parameters, but we'll use a conservative 1000 records per chunk
  const chunkSize = Math.min(1000, Math.floor(10000 / paramsPerRecord));

  const chunks: InferInsertModel<T>[][] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  return chunks;
}
