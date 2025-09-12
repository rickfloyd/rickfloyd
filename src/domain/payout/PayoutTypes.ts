import { SupportedAsset } from '../assets';

/**
 * Represents a balance available for distribution to charities
 */
export interface DistributableBalance {
  readonly asset: SupportedAsset;
  readonly amount: string; // Amount in base units (satoshis, wei, etc.)
  readonly timestamp: Date;
  readonly sourceAddress?: string; // Mining pool address or wallet
}

/**
 * A planned payout to a charity
 */
export interface PlannedPayout {
  readonly id: string;
  readonly charityId: string;
  readonly asset: SupportedAsset;
  readonly amount: string; // Amount in base units
  readonly targetAddress: string;
  readonly plannedAt: Date;
  readonly scheduledFor?: Date; // For batched/delayed payouts
  readonly priority: PayoutPriority;
}

/**
 * Priority levels for payouts
 */
export enum PayoutPriority {
  LOW = 'low',
  NORMAL = 'normal', 
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Context information for charity allocation calculations
 */
export interface CharityAllocationContext {
  readonly totalDistributableAmount: string;
  readonly asset: SupportedAsset;
  readonly allocationPeriod: {
    start: Date;
    end: Date;
  };
  readonly eligibleCharities: string[]; // Charity IDs
  readonly globalPolicy: PayoutGlobalPolicy;
}

/**
 * Allocation result for a specific charity
 */
export interface CharityAllocation {
  readonly charityId: string;
  readonly asset: SupportedAsset;
  readonly allocatedAmount: string; // Amount in base units
  readonly percentage: number; // Percentage of total distribution
  readonly allocationMethod: string; // E.g., "equal", "weighted", "donation-based"
  readonly calculatedAt: Date;
}

/**
 * Global policy settings for payouts
 */
export interface PayoutGlobalPolicy {
  readonly minimumPayoutThreshold: Record<SupportedAsset, string>; // Min amount per asset
  readonly maxPayoutsPerBatch: number;
  readonly batchIntervalHours: number;
  readonly reservePercentage: number; // Percentage to hold as reserve (0-100)
  readonly emergencyStopEnabled: boolean;
  readonly allowPartialPayouts: boolean; // If true, pay what's available even if below threshold
  readonly defaultPriority: PayoutPriority;
}

/**
 * Result of a payout operation
 */
export interface PayoutResult {
  readonly success: boolean;
  readonly transactionHash?: string;
  readonly error?: string;
  readonly gasUsed?: string;
  readonly actualAmount?: string; // May differ from planned due to fees
  readonly feePaid?: string;
  readonly completedAt: Date;
}

/**
 * Status of a payout operation
 */
export enum PayoutStatus {
  PLANNED = 'planned',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Extended payout record with execution status
 */
export interface PayoutExecution extends PlannedPayout {
  readonly status: PayoutStatus;
  readonly result?: PayoutResult;
  readonly attempts: number;
  readonly lastAttemptAt?: Date;
  readonly nextRetryAt?: Date;
}