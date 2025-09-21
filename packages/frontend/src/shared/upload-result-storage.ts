import { Transaction } from "api";

const STORAGE_KEY_PREFIX = "upload_result_";

export function storeUploadResult(
  added: Transaction[],
  removed: Transaction[],
): string {
  const key = `${STORAGE_KEY_PREFIX}${Date.now()}`;

  const result = {
    added,
    removed,
  };

  sessionStorage.setItem(key, JSON.stringify(result));
  return key;
}

export function getUploadResult(
  key: string,
): { added: Transaction[]; removed: Transaction[] } | null {
  try {
    const data = sessionStorage.getItem(key);
    if (!data) return null;

    const result = JSON.parse(data);

    return {
      added: result.added || [],
      removed: result.removed || [],
    };
  } catch (error) {
    console.error("Failed to retrieve upload result:", error);
    return null;
  }
}
