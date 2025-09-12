import { SupportedAsset } from '../assets';

/**
 * Record representing a charity's cryptocurrency address for donations
 */
export interface CharityAddressRecord {
  readonly charityId: string;
  readonly asset: SupportedAsset;
  readonly address: string;
  readonly label?: string; // Optional label for the address
  readonly verified: boolean; // Whether address has been verified by charity
  readonly addedAt: Date;
  readonly lastValidatedAt?: Date;
  readonly isActive: boolean; // Whether this address should receive payouts
}

/**
 * Basic charity information
 */
export interface CharityInfo {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly website?: string;
  readonly contactEmail?: string;
  readonly taxId?: string; // Tax identification number
  readonly registeredAt: Date;
  readonly isActive: boolean;
  readonly verificationStatus: 'pending' | 'verified' | 'rejected';
}

/**
 * Interface for managing charity registry operations
 */
export interface ICharityRegistry {
  /**
   * Register a new charity
   */
  registerCharity(info: Omit<CharityInfo, 'id' | 'registeredAt'>): Promise<string>;
  
  /**
   * Get charity information by ID
   */
  getCharity(charityId: string): Promise<CharityInfo | null>;
  
  /**
   * Get all active charities
   */
  getActiveCharities(): Promise<CharityInfo[]>;
  
  /**
   * Add a cryptocurrency address for a charity
   */
  addCharityAddress(record: Omit<CharityAddressRecord, 'addedAt'>): Promise<void>;
  
  /**
   * Get all addresses for a charity
   */
  getCharityAddresses(charityId: string): Promise<CharityAddressRecord[]>;
  
  /**
   * Get specific address for charity and asset
   */
  getCharityAddress(charityId: string, asset: SupportedAsset): Promise<string | null>;
  
  /**
   * Update address verification status
   */
  updateAddressVerification(
    charityId: string, 
    asset: SupportedAsset, 
    verified: boolean
  ): Promise<void>;
  
  /**
   * Deactivate a charity (stops payouts but preserves records)
   */
  deactivateCharity(charityId: string): Promise<void>;
  
  /**
   * Validate all addresses for a charity using address validators
   */
  validateCharityAddresses(charityId: string): Promise<Record<string, boolean>>;
}