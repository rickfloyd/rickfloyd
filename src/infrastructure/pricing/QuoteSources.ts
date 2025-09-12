import { IQuoteSource, AssetPrice } from '../../domain/pricing';
import { SupportedAsset } from '../../domain/assets';

/**
 * CoinGecko API implementation of IQuoteSource
 */
export class CoinGeckoQuoteSource implements IQuoteSource {
  readonly name = 'coingecko';
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  
  // Mapping from SupportedAsset to CoinGecko IDs
  private readonly assetMapping: Record<SupportedAsset, string> = {
    [SupportedAsset.BTC]: 'bitcoin',
    [SupportedAsset.LTC]: 'litecoin',
    [SupportedAsset.DOGE]: 'dogecoin',
    [SupportedAsset.XMR]: 'monero',
    [SupportedAsset.KAS]: 'kaspa',
    [SupportedAsset.ERG]: 'ergo',
    [SupportedAsset.RVN]: 'ravencoin'
  };

  async getPrice(asset: SupportedAsset): Promise<AssetPrice> {
    const prices = await this.getPrices([asset]);
    return prices[0];
  }

  async getPrices(assets: SupportedAsset[]): Promise<AssetPrice[]> {
    const coinIds = assets.map(asset => this.assetMapping[asset]).join(',');
    const url = `${this.baseUrl}/simple/price?ids=${coinIds}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;
    
    try {
      // Placeholder implementation - in production this would make actual HTTP requests
      // For now, return mock data to allow compilation and testing
      const mockResponse = this.generateMockResponse(assets);
      return this.parseResponse(mockResponse, assets);
    } catch (error) {
      throw new Error(`CoinGecko API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Placeholder - in production this would ping the API
      return true;
    } catch (error) {
      return false;
    }
  }

  private generateMockResponse(assets: SupportedAsset[]): any {
    const response: any = {};
    const baseTimestamp = Date.now();
    
    // Mock price data - in production this would come from actual API
    const mockPrices: Record<SupportedAsset, number> = {
      [SupportedAsset.BTC]: 45000,
      [SupportedAsset.LTC]: 80,
      [SupportedAsset.DOGE]: 0.08,
      [SupportedAsset.XMR]: 160,
      [SupportedAsset.KAS]: 0.15,
      [SupportedAsset.ERG]: 3.5,
      [SupportedAsset.RVN]: 0.035
    };

    for (const asset of assets) {
      const coinId = this.assetMapping[asset];
      const basePrice = mockPrices[asset] || 1;
      
      response[coinId] = {
        usd: basePrice + (Math.random() - 0.5) * basePrice * 0.1, // ±10% variation
        usd_market_cap: basePrice * 21000000 * (0.8 + Math.random() * 0.4),
        usd_24h_vol: basePrice * 1000000 * (0.5 + Math.random()),
        usd_24h_change: (Math.random() - 0.5) * 20 // ±10% change
      };
    }
    
    return response;
  }

  private parseResponse(response: any, assets: SupportedAsset[]): AssetPrice[] {
    const results: AssetPrice[] = [];
    const timestamp = new Date();
    
    for (const asset of assets) {
      const coinId = this.assetMapping[asset];
      const data = response[coinId];
      
      if (!data) {
        throw new Error(`No price data available for ${asset}`);
      }
      
      results.push({
        asset,
        priceUsd: data.usd,
        timestamp,
        source: this.name,
        volume24h: data.usd_24h_vol,
        marketCap: data.usd_market_cap,
        change24h: data.usd_24h_change
      });
    }
    
    return results;
  }
}

/**
 * CryptoCompare API implementation of IQuoteSource
 */
export class CryptoCompareQuoteSource implements IQuoteSource {
  readonly name = 'cryptocompare';
  private readonly baseUrl = 'https://min-api.cryptocompare.com/data';

  async getPrice(asset: SupportedAsset): Promise<AssetPrice> {
    const prices = await this.getPrices([asset]);
    return prices[0];
  }

  async getPrices(assets: SupportedAsset[]): Promise<AssetPrice[]> {
    const symbols = assets.join(',');
    const url = `${this.baseUrl}/pricemultifull?fsyms=${symbols}&tsyms=USD`;
    
    try {
      // Placeholder implementation - in production this would make actual HTTP requests
      const mockResponse = this.generateMockResponse(assets);
      return this.parseResponse(mockResponse, assets);
    } catch (error) {
      throw new Error(`CryptoCompare API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Placeholder - in production this would ping the API
      return true;
    } catch (error) {
      return false;
    }
  }

  private generateMockResponse(assets: SupportedAsset[]): any {
    const response: any = { RAW: {} };
    
    // Mock price data with slightly different values than CoinGecko
    const mockPrices: Record<SupportedAsset, number> = {
      [SupportedAsset.BTC]: 44800,
      [SupportedAsset.LTC]: 81,
      [SupportedAsset.DOGE]: 0.079,
      [SupportedAsset.XMR]: 158,
      [SupportedAsset.KAS]: 0.14,
      [SupportedAsset.ERG]: 3.6,
      [SupportedAsset.RVN]: 0.036
    };

    for (const asset of assets) {
      const basePrice = mockPrices[asset] || 1;
      
      response.RAW[asset] = {
        USD: {
          PRICE: basePrice + (Math.random() - 0.5) * basePrice * 0.05, // ±5% variation
          VOLUME24HOUR: basePrice * 500000 * (0.5 + Math.random()),
          MKTCAP: basePrice * 18000000 * (0.9 + Math.random() * 0.2),
          CHANGEPCT24HOUR: (Math.random() - 0.5) * 15 // ±7.5% change
        }
      };
    }
    
    return response;
  }

  private parseResponse(response: any, assets: SupportedAsset[]): AssetPrice[] {
    const results: AssetPrice[] = [];
    const timestamp = new Date();
    
    for (const asset of assets) {
      const data = response.RAW?.[asset]?.USD;
      
      if (!data) {
        throw new Error(`No price data available for ${asset}`);
      }
      
      results.push({
        asset,
        priceUsd: data.PRICE,
        timestamp,
        source: this.name,
        volume24h: data.VOLUME24HOUR,
        marketCap: data.MKTCAP,
        change24h: data.CHANGEPCT24HOUR
      });
    }
    
    return results;
  }
}