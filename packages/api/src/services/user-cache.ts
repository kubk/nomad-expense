import { getKv } from "./kv";

const CACHE_TTL_SECONDS = 31536000; // 1 year

type UserCacheData = {
  userId: string;
  familyId: string;
};

const getUserCacheKey = (telegramId: string): string => {
  return `user:${telegramId}`;
};

export const userCacheGet = async (
  telegramId: string,
): Promise<UserCacheData | null> => {
  try {
    const kv = getKv();
    const cached = await kv.get(getUserCacheKey(telegramId), "json");

    if (!cached) {
      return null;
    }

    return cached as UserCacheData;
  } catch (error) {
    console.error("Failed to get user from cache:", error);
    return null;
  }
};

export const userCacheSet = async (
  telegramId: string,
  data: UserCacheData,
): Promise<void> => {
  try {
    const kv = getKv();
    const cacheKey = getUserCacheKey(telegramId);
    await kv.put(cacheKey, JSON.stringify(data), {
      expirationTtl: CACHE_TTL_SECONDS,
    });
  } catch (error) {
    console.error("Failed to cache user:", error);
  }
};
