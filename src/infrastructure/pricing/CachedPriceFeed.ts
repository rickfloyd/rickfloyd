import { IPriceFeed, IQuoteSource, AssetPrice, PriceFeedConfig } from '../../domain/pricing';
import { SupportedAsset } from '../../domain/assets';

/**
 * Cached price entry
 */
interface CachedPrice {
  price: AssetPrice;
  cachedAt: Date;
}

/**
 * Price feed implementation with TTL-based caching and fallback sources
 */
export class CachedPriceFeed implements IPriceFeed {
  private readonly cache = new Map<SupportedAsset, CachedPrice>();
  private readonly config: PriceFeedConfig;
  
  constructor(
    private readonly primarySource: IQuoteSource,
    private readonly fallbackSources: IQuoteSource[] = [],
    config?: Partial<PriceFeedConfig>
  ) {
    this.config = {
      cacheTtlSeconds: 300, // 5 minutes default
      maxRetries: 3,
      retryDelayMs: 1000,
      enableFallback: true,
      primarySource: primarySource.name,
      fallbackSources: fallbackSources.map(s => s.name),
      ...config
    };
  }

  async getPrice(asset: SupportedAsset): Promise<AssetPrice> {
    // Check cache first
    const cachedPrice = await this.getCachedPrice(asset);
    if (cachedPrice) {
      return cachedPrice;
    }

    // Cache miss or expired, fetch from source
    return this.refreshPrice(asset);
  }

  async getPrices(assets: SupportedAsset[]): Promise<AssetPrice[]> {
    const results: AssetPrice[] = [];
    const assetsToFetch: SupportedAsset[] = [];
    
    // Check cache for each asset
    for (const asset of assets) {
      const cachedPrice = await this.getCachedPrice(asset);
      if (cachedPrice) {
        results.push(cachedPrice);
      } else {
        assetsToFetch.push(asset);
      }
    }
    
    // Fetch uncached assets
    if (assetsToFetch.length > 0) {
      const freshPrices = await this.fetchPricesWithFallback(assetsToFetch);
      
      // Cache the fresh prices
      for (const price of freshPrices) {
        this.setCacheEntry(price.asset, price);
      }
      
      results.push(...freshPrices);
    }
    
    // Sort results to match original order
    return assets.map(asset => 
      results.find(price => price.asset === asset)!
    );
  }

  async refreshPrice(asset: SupportedAsset): Promise<AssetPrice> {
    const prices = await this.fetchPricesWithFallback([asset]);
    const price = prices[0];
    
    // Update cache
    this.setCacheEntry(asset, price);
    
    return price;
  }

  async getCachedPrice(asset: SupportedAsset): Promise<AssetPrice | null> {
    const cached = this.cache.get(asset);
    if (!cached) {
      return null;
    }
    
    // Check if cache is still valid
    const now = new Date();
    const cacheAge = (now.getTime() - cached.cachedAt.getTime()) / 1000;
    
    if (cacheAge > this.config.cacheTtlSeconds) {
      // Cache expired
      this.cache.delete(asset);
      return null;
    }
    
    return cached.price;
  }

  async clearCache(asset?: SupportedAsset): Promise<void> {
    if (asset) {
      this.cache.delete(asset);
    } else {
      this.cache.clear();
    }
  }

  private async fetchPricesWithFallback(assets: SupportedAsset[]): Promise<AssetPrice[]> {
    let lastError: Error | null = null;
    
    // Try primary source first
    try {
      return await this.fetchWithRetry(this.primarySource, assets);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (!this.config.enableFallback || this.fallbackSources.length === 0) {
        throw lastError;
      }
    }
    
    // Try fallback sources
    for (const fallbackSource of this.fallbackSources) {
      try {
        return await this.fetchWithRetry(fallbackSource, assets);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        continue;
      }
    }
    
    throw new Error(`All price sources failed. Last error: ${lastError?.message}`);
  }

  private async fetchWithRetry(source: IQuoteSource, assets: SupportedAsset[]): Promise<AssetPrice[]> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        // Check if source is available
        const isAvailable = await source.isAvailable();
        if (!isAvailable) {
          throw new Error(`Source ${source.name} is not available`);
        }
        
        return await source.getPrices(assets);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.config.maxRetries) {
          // Wait before retrying
          await new Promise(resolve => 
            setTimeout(resolve, this.config.retryDelayMs * attempt)
          );
        }
      }
    }
    
    throw new Error(`${source.name} failed after ${this.config.maxRetries} attempts: ${lastError?.message}`);
  }

  private setCacheEntry(asset: SupportedAsset, price: AssetPrice): void {
    this.cache.set(asset, {
      price,
      cachedAt: new Date()
    });
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    totalEntries: number;
    cacheHitRate: number;
    oldestEntry?: Date;
    newestEntry?: Date;
  } {
    const entries = Array.from(this.cache.values());
    
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        cacheHitRate: 0
      };
    }
    
    const timestamps = entries.map(e => e.cachedAt);
    const oldestEntry = new Date(Math.min(...timestamps.map(t => t.getTime())));
    const newestEntry = new Date(Math.max(...timestamps.map(t => t.getTime())));
    
    return {
      totalEntries: entries.length,
      cacheHitRate: 0, // Would need additional tracking for accurate hit rate
      oldestEntry,
      newestEntry
    };
  }
}