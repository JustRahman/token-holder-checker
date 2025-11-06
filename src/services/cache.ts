// Caching service using node-cache

import NodeCache from "node-cache";
import { config } from "../config/index.js";

// Create cache instances with different TTLs
export const holderCache = new NodeCache({
  stdTTL: config.cache.holderData,
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false, // Don't clone data for performance
});

export const priceCache = new NodeCache({
  stdTTL: config.cache.priceData,
  checkperiod: 30,
  useClones: false,
});

export const tokenInfoCache = new NodeCache({
  stdTTL: config.cache.tokenInfo,
  checkperiod: 300,
  useClones: false,
});

// General purpose cache
export const generalCache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120,
  useClones: false,
});

/**
 * Cache key generator
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join("|");
  return `${prefix}:${sortedParams}`;
}

/**
 * Get or set cache with async function
 */
export async function getOrSet<T>(
  cache: NodeCache,
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache
  const cached = cache.get<T>(key);
  if (cached !== undefined) {
    console.log(`[Cache HIT] ${key}`);
    return cached;
  }

  console.log(`[Cache MISS] ${key}`);

  // Fetch data
  const data = await fetcher();

  // Store in cache
  if (ttl) {
    cache.set(key, data, ttl);
  } else {
    cache.set(key, data);
  }

  return data;
}

/**
 * Invalidate cache for a specific pattern
 */
export function invalidatePattern(cache: NodeCache, pattern: string): number {
  const keys = cache.keys();
  const matchingKeys = keys.filter((key) => key.includes(pattern));

  matchingKeys.forEach((key) => cache.del(key));

  console.log(`[Cache] Invalidated ${matchingKeys.length} keys matching: ${pattern}`);
  return matchingKeys.length;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    holderCache: {
      keys: holderCache.keys().length,
      stats: holderCache.getStats(),
    },
    priceCache: {
      keys: priceCache.keys().length,
      stats: priceCache.getStats(),
    },
    tokenInfoCache: {
      keys: tokenInfoCache.keys().length,
      stats: tokenInfoCache.getStats(),
    },
    generalCache: {
      keys: generalCache.keys().length,
      stats: generalCache.getStats(),
    },
  };
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  holderCache.flushAll();
  priceCache.flushAll();
  tokenInfoCache.flushAll();
  generalCache.flushAll();
  console.log("[Cache] All caches cleared");
}
