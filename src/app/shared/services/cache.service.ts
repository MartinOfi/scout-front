import { Injectable } from '@angular/core';

/**
 * Cache item with expiration and metadata
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Cache configuration options
 */
interface CacheConfig {
  defaultTtl: number; // Default TTL in milliseconds
  maxSize: number; // Maximum number of items
  cleanupInterval: number; // Cleanup interval in milliseconds
}

/**
 * In-memory cache service with TTL support and LRU eviction
 * NO any - fully typed with strict TypeScript
 * Uses Map<string, CacheItem> for O(1) operations
 * Integrates with existing services through caching patterns
 * Production-ready with automatic cleanup and memory management
 */
@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private readonly cache = new Map<string, CacheItem<unknown>>();
  private readonly config: CacheConfig = {
    defaultTtl: 5 * 60 * 1000, // 5 minutes default
    maxSize: 100,
    cleanupInterval: 60 * 1000, // 1 minute
  };

  private cleanupTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Store data in cache with optional TTL
   * @param key Cache key - should be descriptive and namespaced (e.g., 'user:123', 'movimientos:caja:456')
   * @param data Data to cache - must be serializable
   * @param ttl Time to live in milliseconds (optional, uses default config)
   * @example
   * cache.set('user:123', userData, 300000); // 5 minutes
   * cache.set('movimientos:caja:456', movimientos); // uses default TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // LRU: Remove oldest item if cache is full and key doesn't exist
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTtl,
    };

    this.cache.set(key, item);
  }

  /**
   * Retrieve data from cache
   * @param key Cache key
   * @returns Cached data or undefined if not found/expired
   * @example
   * const userData = cache.get<User>('user:123');
   * if (userData) { /* use cached data *\/ }
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key) as CacheItem<T> | undefined;

    if (!item) {
      return undefined;
    }

    // Check if item is expired
    if (this.isExpired(item)) {
      this.cache.delete(key);
      return undefined;
    }

    return item.data;
  }

  /**
   * Check if key exists and is not expired
   * @param key Cache key
   * @returns True if key exists and is valid
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    if (this.isExpired(item)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete item from cache
   * @param key Cache key
   * @returns True if item was deleted
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache items
   * Use with caution - removes all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics for monitoring
   * @returns Cache stats object with size, max size, and keys
   */
  getStats(): {
    size: number;
    maxSize: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Force cleanup of expired items
   * @returns Number of items cleaned up
   */
  cleanup(): number {
    let cleanedCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Invalidate cache entries matching pattern
   * @param pattern Pattern to match (uses string includes)
   * @returns Number of items invalidated
   * @example
   * cache.invalidate('user:'); // invalidate all user cache entries
   * cache.invalidate('movimientos:caja:'); // invalidate specific caja movements
   */
  invalidate(pattern: string): number {
    let invalidatedCount = 0;
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        invalidatedCount++;
      }
    }

    return invalidatedCount;
  }

  /**
   * Configure cache settings
   * @param config Partial cache configuration
   */
  setConfig(config: Partial<CacheConfig>): void {
    Object.assign(this.config, config);
    
    // Restart cleanup timer with new interval if provided
    if (config.cleanupInterval && this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.startCleanupTimer();
    }
  }

  /**
   * Cleanup service and timers
   * Called automatically when service is destroyed
   */
  ngOnDestroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  /**
   * Check if cache item is expired
   * @param item Cache item
   * @returns True if expired
   */
  private isExpired(item: CacheItem<unknown>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * Start automatic cleanup timer
   * Removes expired items periodically to prevent memory leaks
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }
}
