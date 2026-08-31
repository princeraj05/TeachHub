/**
 * Centralized Persistent Data Cache Manager for TeachHub
 * Provides 0ms Instant Page Loads & Stale-While-Revalidate caching across all roles.
 */

const CACHE_PREFIX = "teachhub_cache_";
const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes TTL fallback

/**
 * Get cached data by key with default fallback
 */
export const getCache = (key, defaultData = null) => {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return defaultData;

    const entry = JSON.parse(raw);
    if (entry && entry.data !== undefined) {
      return entry.data;
    }
    return entry || defaultData;
  } catch (e) {
    console.warn(`Cache read error for ${key}:`, e);
    return defaultData;
  }
};

/**
 * Save data to local cache
 */
export const setCache = (key, data) => {
  try {
    const entry = {
      timestamp: Date.now(),
      data: data
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (e) {
    console.warn(`Cache write error for ${key}:`, e);
  }
};

/**
 * Check if cache is missing or expired
 */
export const isCacheExpired = (key, ttl = DEFAULT_TTL) => {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return true;

    const entry = JSON.parse(raw);
    if (!entry.timestamp) return true;

    return Date.now() - entry.timestamp > ttl;
  } catch (e) {
    return true;
  }
};

/**
 * Clear specific cache key or all TeachHub cache
 */
export const clearCache = (key = null) => {
  try {
    if (key) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } else {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(k);
        }
      });
    }
  } catch (e) {
    console.warn("Cache clear error:", e);
  }
};
