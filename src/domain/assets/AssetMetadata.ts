import { SupportedAsset } from './SupportedAsset';

/**
 * Metadata for a supported cryptocurrency asset
 */
export interface AssetMetadata {
  readonly symbol: SupportedAsset;
  readonly name: string;
  readonly decimals: number;
  readonly network: string;
  readonly addressPrefix?: string;
  readonly minPayoutAmount?: string; // Minimum amount for payout (in base units)
  readonly description?: string;
}

/**
 * Catalog of asset metadata for all supported cryptocurrencies
 */
export class AssetCatalog {
  private static readonly ASSET_METADATA: Record<SupportedAsset, AssetMetadata> = {
    [SupportedAsset.BTC]: {
      symbol: SupportedAsset.BTC,
      name: 'Bitcoin',
      decimals: 8,
      network: 'bitcoin',
      addressPrefix: '1|3|bc1',
      minPayoutAmount: '10000', // 0.0001 BTC in satoshis
      description: 'The original cryptocurrency'
    },
    [SupportedAsset.LTC]: {
      symbol: SupportedAsset.LTC,
      name: 'Litecoin',
      decimals: 8,
      network: 'litecoin',
      addressPrefix: 'L|M|ltc1',
      minPayoutAmount: '100000', // 0.001 LTC in litoshis
      description: 'Peer-to-peer Internet currency'
    },
    [SupportedAsset.DOGE]: {
      symbol: SupportedAsset.DOGE,
      name: 'Dogecoin',
      decimals: 8,
      network: 'dogecoin',
      addressPrefix: 'D|A',
      minPayoutAmount: '100000000', // 1 DOGE
      description: 'The fun and friendly internet currency'
    },
    [SupportedAsset.XMR]: {
      symbol: SupportedAsset.XMR,
      name: 'Monero',
      decimals: 12,
      network: 'monero',
      addressPrefix: '4|8',
      minPayoutAmount: '10000000000', // 0.01 XMR in piconero
      description: 'Private digital currency'
    },
    [SupportedAsset.KAS]: {
      symbol: SupportedAsset.KAS,
      name: 'Kaspa',
      decimals: 8,
      network: 'kaspa',
      addressPrefix: 'kaspa:',
      minPayoutAmount: '100000000', // 1 KAS in sompi
      description: 'Fastest, open-source, decentralized blockchain'
    },
    [SupportedAsset.ERG]: {
      symbol: SupportedAsset.ERG,
      name: 'Ergo',
      decimals: 9,
      network: 'ergo',
      addressPrefix: '9',
      minPayoutAmount: '1000000000', // 1 ERG in nanoERG
      description: 'Platform for contractual money'
    },
    [SupportedAsset.RVN]: {
      symbol: SupportedAsset.RVN,
      name: 'Ravencoin',
      decimals: 8,
      network: 'ravencoin',
      addressPrefix: 'R',
      minPayoutAmount: '100000000', // 1 RVN
      description: 'Digital peer-to-peer network for asset transfers'
    }
  };

  /**
   * Get metadata for a specific asset
   */
  static getMetadata(asset: SupportedAsset): AssetMetadata {
    return this.ASSET_METADATA[asset];
  }

  /**
   * Get metadata for all assets
   */
  static getAllMetadata(): AssetMetadata[] {
    return Object.values(this.ASSET_METADATA);
  }

  /**
   * Check if an asset is supported
   */
  static isSupported(asset: string): boolean {
    return asset in this.ASSET_METADATA;
  }

  /**
   * Get asset metadata by symbol string
   */
  static getMetadataBySymbol(symbol: string): AssetMetadata | null {
    if (!this.isSupported(symbol)) {
      return null;
    }
    return this.ASSET_METADATA[symbol as SupportedAsset];
  }
}