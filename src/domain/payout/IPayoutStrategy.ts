import {
  DistributableBalance,
  PlannedPayout,
  CharityAllocationContext,
  CharityAllocation,
  PayoutResult
} from './PayoutTypes';

/**
 * Interface for storing and retrieving accrued balances for batch payouts
 */
export interface IAccrualStore {
  /**
   * Add an amount to a charity's accrued balance
   */
  accrue(charityId: string, allocation: CharityAllocation): Promise<void>;
  
  /**
   * Get the current accrued balance for a charity and asset
   */
  getAccruedBalance(charityId: string, asset: string): Promise<string>;
  
  /**
   * Get all accrued balances for a charity
   */
  getAllAccruedBalances(charityId: string): Promise<Record<string, string>>;
  
  /**
   * Clear accrued balance after payout (set to zero)
   */
  clearAccruedBalance(charityId: string, asset: string): Promise<void>;
  
  /**
   * Get all charities with accrued balances above threshold
   */
  getCharitiesAboveThreshold(thresholds: Record<string, string>): Promise<string[]>;
}

/**
 * Base interface for payout strategies
 */
export interface IPayoutStrategy {
  /**
   * Strategy identifier
   */
  readonly name: string;
  
  /**
   * Calculate planned payouts for given distributable balances
   */
  calculatePayouts(
    balances: DistributableBalance[],
    context: CharityAllocationContext
  ): Promise<PlannedPayout[]>;
  
  /**
   * Execute a planned payout
   */
  executePayout(payout: PlannedPayout): Promise<PayoutResult>;
  
  /**
   * Check if the strategy can handle a specific allocation context
   */
  canHandle(context: CharityAllocationContext): boolean;
}