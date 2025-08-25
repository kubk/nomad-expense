import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import type { InferInsertModel } from "drizzle-orm";

export function isNonEmpty<T>(array: T[]): array is [T, ...T[]] {
  return array.length > 0;
}

/**
 * Generic typesafe utility for batched inserts that respects D1's bind parameter limits
 */
export function batch<T extends SQLiteTable>(
  // @ts-ignore
  table: T,
  data: InferInsertModel<T>[],
): InferInsertModel<T>[][] {
  if (data.length === 0) return [];

  // Calculate based on actual provided parameters
  const paramsPerRecord = Object.keys(data[0]).length;
  // 100 param limit with 5 safety margin
  const chunkSize = Math.floor((100 - 5) / paramsPerRecord);

  const chunks: InferInsertModel<T>[][] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  return chunks;
}
