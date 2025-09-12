/**
 * Enumeration of supported cryptocurrency assets for charity payouts
 */
export enum SupportedAsset {
  BTC = 'BTC',
  LTC = 'LTC', 
  DOGE = 'DOGE',
  XMR = 'XMR',
  KAS = 'KAS',
  ERG = 'ERG',
  RVN = 'RVN'
}

/**
 * Utility functions for working with supported assets
 */
export class SupportedAssetUtils {
  /**
   * Get all supported assets as an array
   */
  static getAllAssets(): SupportedAsset[] {
    return Object.values(SupportedAsset);
  }

  /**
   * Check if an asset string is supported
   */
  static isSupported(asset: string): asset is SupportedAsset {
    return Object.values(SupportedAsset).includes(asset as SupportedAsset);
  }

  /**
   * Parse asset string safely
   */
  static parseAsset(asset: string): SupportedAsset | null {
    return this.isSupported(asset) ? asset as SupportedAsset : null;
  }
}