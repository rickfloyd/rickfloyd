import { SupportedAsset } from '../assets';

/**
 * Price snapshot at a specific point in time
 */
export interface PriceSnapshot {
  readonly asset: SupportedAsset;
  readonly priceUsd: number;
  readonly timestamp: Date;
  readonly source: string; // e.g., "coingecko", "cryptocompare"
}

/**
 * Record of a donation transaction in the ledger
 */
export interface DonationLedgerRecord {
  readonly id: string;
  readonly charityId: string;
  readonly asset: SupportedAsset;
  readonly amount: string; // Amount in base units
  readonly targetAddress: string;
  readonly transactionHash: string;
  readonly blockHeight?: number;
  readonly priceSnapshot: PriceSnapshot;
  readonly usdValue: number; // Calculated USD value at time of donation
  readonly timestamp: Date;
  readonly status: 'pending' | 'confirmed' | 'failed';
  readonly gasUsed?: string;
  readonly feePaid?: string;
}

/**
 * New entry to be added to the ledger (without hash chain data)
 */
export interface NewLedgerEntry {
  readonly donationRecord: DonationLedgerRecord;
  readonly metadata?: Record<string, any>; // Additional metadata
}

/**
 * Ledger entry with hash chain information
 */
export interface LedgerEntry extends NewLedgerEntry {
  readonly sequenceNumber: number;
  readonly previousHash: string;
  readonly entryHash: string;
  readonly addedAt: Date;
}

/**
 * Result of ledger integrity verification
 */
export interface IntegrityVerificationResult {
  readonly isValid: boolean;
  readonly totalEntries: number;
  readonly firstInvalidSequence?: number;
  readonly errors: string[];
  readonly verifiedAt: Date;
}

/**
 * Interface for donation ledger operations
 */
export interface IDonationLedger {
  /**
   * Append a new donation record to the ledger
   */
  append(entry: NewLedgerEntry): Promise<LedgerEntry>;
  
  /**
   * Get a specific ledger entry by sequence number
   */
  getEntry(sequenceNumber: number): Promise<LedgerEntry | null>;
  
  /**
   * Get entries within a sequence range
   */
  getEntries(fromSequence: number, toSequence: number): Promise<LedgerEntry[]>;
  
  /**
   * Get entries for a specific charity
   */
  getEntriesByCharity(charityId: string): Promise<LedgerEntry[]>;
  
  /**
   * Get entries for a specific asset
   */
  getEntriesByAsset(asset: SupportedAsset): Promise<LedgerEntry[]>;
  
  /**
   * Get entries within a date range
   */
  getEntriesByDateRange(from: Date, to: Date): Promise<LedgerEntry[]>;
  
  /**
   * Get the latest entry in the ledger
   */
  getLatestEntry(): Promise<LedgerEntry | null>;
  
  /**
   * Get the total number of entries
   */
  getEntryCount(): Promise<number>;
  
  /**
   * Verify the integrity of the entire ledger
   */
  verifyIntegrity(): Promise<IntegrityVerificationResult>;
  
  /**
   * Get ledger statistics
   */
  getStatistics(): Promise<LedgerStatistics>;
}

/**
 * Ledger statistics summary
 */
export interface LedgerStatistics {
  readonly totalEntries: number;
  readonly totalDonationsUsd: number;
  readonly donationsByAsset: Record<SupportedAsset, {
    count: number;
    totalAmount: string;
    totalUsdValue: number;
  }>;
  readonly donationsByCharity: Record<string, {
    count: number;
    totalUsdValue: number;
  }>;
  readonly firstDonationAt?: Date;
  readonly lastDonationAt?: Date;
  readonly lastVerifiedAt?: Date;
}