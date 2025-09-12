import { SupportedAsset } from '../assets';

/**
 * Price information for a cryptocurrency asset
 */
export interface AssetPrice {
  readonly asset: SupportedAsset;
  readonly priceUsd: number;
  readonly timestamp: Date;
  readonly source: string;
  readonly volume24h?: number;
  readonly marketCap?: number;
  readonly change24h?: number; // Percentage change in 24 hours
}

/**
 * Interface for querying cryptocurrency prices from external sources
 */
export interface IQuoteSource {
  /**
   * Source identifier (e.g., "coingecko", "cryptocompare")
   */
  readonly name: string;
  
  /**
   * Get current price for a single asset
   */
  getPrice(asset: SupportedAsset): Promise<AssetPrice>;
  
  /**
   * Get current prices for multiple assets
   */
  getPrices(assets: SupportedAsset[]): Promise<AssetPrice[]>;
  
  /**
   * Check if the source is currently available
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Interface for price feed with caching and fallback capabilities
 */
export interface IPriceFeed {
  /**
   * Get current price for an asset (may return cached value)
   */
  getPrice(asset: SupportedAsset): Promise<AssetPrice>;
  
  /**
   * Get current prices for multiple assets
   */
  getPrices(assets: SupportedAsset[]): Promise<AssetPrice[]>;
  
  /**
   * Force refresh price from source (bypass cache)
   */
  refreshPrice(asset: SupportedAsset): Promise<AssetPrice>;
  
  /**
   * Get cached price if available, null if not cached or expired
   */
  getCachedPrice(asset: SupportedAsset): Promise<AssetPrice | null>;
  
  /**
   * Clear cache for specific asset or all assets
   */
  clearCache(asset?: SupportedAsset): Promise<void>;
}

/**
 * Configuration for price feed caching
 */
export interface PriceFeedConfig {
  readonly cacheTtlSeconds: number;
  readonly maxRetries: number;
  readonly retryDelayMs: number;
  readonly enableFallback: boolean;
  readonly primarySource: string;
  readonly fallbackSources: string[];
}