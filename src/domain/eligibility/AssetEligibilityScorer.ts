import { SupportedAsset } from '../assets';

/**
 * Scoring criteria for asset eligibility in charity payouts
 */
export interface AssetEligibilityScore {
  readonly asset: SupportedAsset;
  readonly liquidityScore: number; // 0-100: availability on exchanges
  readonly adoptionScore: number; // 0-100: charity adoption/acceptance
  readonly networkStabilityScore: number; // 0-100: network reliability
  readonly privacyScore: number; // 0-100: transaction privacy level
  readonly totalScore: number; // Weighted average of above scores
  readonly eligible: boolean; // True if above minimum threshold
}

/**
 * Configuration for eligibility scoring weights and thresholds
 */
export interface EligibilityConfig {
  readonly weights: {
    liquidity: number;
    adoption: number;
    networkStability: number;
    privacy: number;
  };
  readonly minimumScore: number; // Minimum total score for eligibility
  readonly requireAllCriteria: boolean; // If true, all scores must be > 0
}

/**
 * Interface for asset eligibility scoring implementations
 */
export interface IAssetEligibilityScorer {
  /**
   * Calculate eligibility score for a specific asset
   */
  scoreAsset(asset: SupportedAsset): AssetEligibilityScore;
  
  /**
   * Get scores for all supported assets
   */
  scoreAllAssets(): AssetEligibilityScore[];
  
  /**
   * Get only eligible assets
   */
  getEligibleAssets(): SupportedAsset[];
  
  /**
   * Check if a specific asset is eligible
   */
  isAssetEligible(asset: SupportedAsset): boolean;
}

/**
 * Default implementation of asset eligibility scoring with normalized model
 */
export class DefaultAssetEligibilityScorer implements IAssetEligibilityScorer {
  private readonly config: EligibilityConfig;
  
  // Static scoring data - in production this could come from external sources
  private static readonly ASSET_SCORES = {
    [SupportedAsset.BTC]: {
      liquidity: 100,
      adoption: 90,
      networkStability: 95,
      privacy: 30
    },
    [SupportedAsset.LTC]: {
      liquidity: 85,
      adoption: 70,
      networkStability: 90,
      privacy: 35
    },
    [SupportedAsset.DOGE]: {
      liquidity: 80,
      adoption: 65,
      networkStability: 85,
      privacy: 25
    },
    [SupportedAsset.XMR]: {
      liquidity: 75,
      adoption: 50,
      networkStability: 88,
      privacy: 95
    },
    [SupportedAsset.KAS]: {
      liquidity: 60,
      adoption: 30,
      networkStability: 85,
      privacy: 40
    },
    [SupportedAsset.ERG]: {
      liquidity: 55,
      adoption: 25,
      networkStability: 80,
      privacy: 60
    },
    [SupportedAsset.RVN]: {
      liquidity: 50,
      adoption: 35,
      networkStability: 75,
      privacy: 45
    }
  };

  constructor(config?: Partial<EligibilityConfig>) {
    this.config = {
      weights: {
        liquidity: 0.35,
        adoption: 0.30,
        networkStability: 0.25,
        privacy: 0.10
      },
      minimumScore: 60,
      requireAllCriteria: false,
      ...config
    };
    
    // Validate weights sum to 1
    const weightSum = Object.values(this.config.weights).reduce((a, b) => a + b, 0);
    if (Math.abs(weightSum - 1.0) > 0.001) {
      throw new Error(`Scoring weights must sum to 1.0, got ${weightSum}`);
    }
  }

  scoreAsset(asset: SupportedAsset): AssetEligibilityScore {
    const scores = DefaultAssetEligibilityScorer.ASSET_SCORES[asset];
    if (!scores) {
      throw new Error(`No scoring data available for asset: ${asset}`);
    }

    const totalScore = 
      scores.liquidity * this.config.weights.liquidity +
      scores.adoption * this.config.weights.adoption +
      scores.networkStability * this.config.weights.networkStability +
      scores.privacy * this.config.weights.privacy;

    const eligible = this.calculateEligibility(scores, totalScore);

    return {
      asset,
      liquidityScore: scores.liquidity,
      adoptionScore: scores.adoption,
      networkStabilityScore: scores.networkStability,
      privacyScore: scores.privacy,
      totalScore: Math.round(totalScore * 100) / 100,
      eligible
    };
  }

  scoreAllAssets(): AssetEligibilityScore[] {
    return Object.values(SupportedAsset).map(asset => this.scoreAsset(asset));
  }

  getEligibleAssets(): SupportedAsset[] {
    return this.scoreAllAssets()
      .filter(score => score.eligible)
      .map(score => score.asset);
  }

  isAssetEligible(asset: SupportedAsset): boolean {
    return this.scoreAsset(asset).eligible;
  }

  private calculateEligibility(scores: any, totalScore: number): boolean {
    const meetsMinimumScore = totalScore >= this.config.minimumScore;
    
    if (this.config.requireAllCriteria) {
      const allCriteriaPositive = Object.values(scores).every((score: any) => score > 0);
      return meetsMinimumScore && allCriteriaPositive;
    }
    
    return meetsMinimumScore;
  }
}