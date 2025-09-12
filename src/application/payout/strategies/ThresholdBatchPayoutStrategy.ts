import {
  IPayoutStrategy,
  IAccrualStore,
  DistributableBalance,
  PlannedPayout,
  CharityAllocationContext,
  PayoutResult,
  PayoutPriority
} from '../../../domain/payout';
import { AssetCatalog } from '../../../domain/assets';

// Simple ID generator for placeholder implementation
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Threshold-based batch payout strategy - accumulates balances until threshold is met,
 * then executes batch payouts
 */
export class ThresholdBatchPayoutStrategy implements IPayoutStrategy {
  readonly name = 'ThresholdBatchPayout';

  constructor(private accrualStore: IAccrualStore) {}

  async calculatePayouts(
    balances: DistributableBalance[],
    context: CharityAllocationContext
  ): Promise<PlannedPayout[]> {
    const payouts: PlannedPayout[] = [];

    for (const balance of balances) {
      // Apply reserve percentage
      const reserveAmount = BigInt(balance.amount) * BigInt(context.globalPolicy.reservePercentage) / BigInt(100);
      const distributableAmount = BigInt(balance.amount) - reserveAmount;
      
      if (distributableAmount <= 0) {
        continue;
      }

      // Calculate equal allocation among eligible charities
      const charityCount = BigInt(context.eligibleCharities.length);
      const amountPerCharity = distributableAmount / charityCount;
      
      if (amountPerCharity <= 0) {
        continue;
      }

      // Accrue amounts for each charity
      for (const charityId of context.eligibleCharities) {
        await this.accrualStore.accrue(charityId, {
          charityId,
          asset: balance.asset,
          allocatedAmount: amountPerCharity.toString(),
          percentage: 100 / context.eligibleCharities.length,
          allocationMethod: 'equal_threshold_batch',
          calculatedAt: new Date()
        });
      }
    }

    // Check which charities are above threshold and create payouts
    const thresholds = context.globalPolicy.minimumPayoutThreshold;
    const charitiesAboveThreshold = await this.accrualStore.getCharitiesAboveThreshold(thresholds);

    for (const charityId of charitiesAboveThreshold) {
      const accruedBalances = await this.accrualStore.getAllAccruedBalances(charityId);
      
      for (const [asset, amount] of Object.entries(accruedBalances)) {
        const threshold = thresholds[asset as keyof typeof thresholds];
        if (threshold && BigInt(amount) >= BigInt(threshold)) {
          payouts.push({
            id: generateId(),
            charityId,
            asset: asset as any,
            amount,
            targetAddress: await this.getCharityAddress(charityId, asset),
            plannedAt: new Date(),
            scheduledFor: this.calculateBatchSchedule(context),
            priority: context.globalPolicy.defaultPriority
          });

          // Clear the accrued balance since we're paying it out
          await this.accrualStore.clearAccruedBalance(charityId, asset);
        }
      }
    }

    return payouts;
  }

  async executePayout(payout: PlannedPayout): Promise<PayoutResult> {
    // Placeholder implementation - in production this would integrate with chain clients
    try {
      // Simulate batch transaction execution
      const transactionHash = `batch_0x${Math.random().toString(16).substr(2, 64)}`;
      const mockGasUsed = '150000'; // Higher gas for batch
      const mockFee = '5000';
      
      // Simulate longer network delay for batch
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        transactionHash,
        gasUsed: mockGasUsed,
        actualAmount: payout.amount,
        feePaid: mockFee,
        completedAt: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      };
    }
  }

  canHandle(context: CharityAllocationContext): boolean {
    // Batch strategy requires at least one eligible charity and batch settings
    return context.eligibleCharities.length > 0 && 
           context.globalPolicy.batchIntervalHours > 0;
  }

  private calculateBatchSchedule(context: CharityAllocationContext): Date {
    const now = new Date();
    const batchIntervalMs = context.globalPolicy.batchIntervalHours * 60 * 60 * 1000;
    return new Date(now.getTime() + batchIntervalMs);
  }

  private async getCharityAddress(charityId: string, asset: string): Promise<string> {
    // Placeholder - in production this would query the charity registry
    return `${asset.toLowerCase()}_charity_${charityId}_batch_address`;
  }
}

/**
 * In-memory implementation of IAccrualStore for development/testing
 * In production, this should be replaced with persistent storage
 */
export class InMemoryAccrualStore implements IAccrualStore {
  private balances = new Map<string, Map<string, string>>();

  async accrue(charityId: string, allocation: any): Promise<void> {
    if (!this.balances.has(charityId)) {
      this.balances.set(charityId, new Map());
    }
    
    const charityBalances = this.balances.get(charityId)!;
    const currentAmount = BigInt(charityBalances.get(allocation.asset) || '0');
    const newAmount = currentAmount + BigInt(allocation.allocatedAmount);
    charityBalances.set(allocation.asset, newAmount.toString());
  }

  async getAccruedBalance(charityId: string, asset: string): Promise<string> {
    const charityBalances = this.balances.get(charityId);
    return charityBalances?.get(asset) || '0';
  }

  async getAllAccruedBalances(charityId: string): Promise<Record<string, string>> {
    const charityBalances = this.balances.get(charityId);
    if (!charityBalances) {
      return {};
    }
    
    const result: Record<string, string> = {};
    for (const [asset, amount] of charityBalances.entries()) {
      result[asset] = amount;
    }
    return result;
  }

  async clearAccruedBalance(charityId: string, asset: string): Promise<void> {
    const charityBalances = this.balances.get(charityId);
    if (charityBalances) {
      charityBalances.set(asset, '0');
    }
  }

  async getCharitiesAboveThreshold(thresholds: Record<string, string>): Promise<string[]> {
    const result: string[] = [];
    
    for (const [charityId, balances] of this.balances.entries()) {
      for (const [asset, amount] of balances.entries()) {
        const threshold = thresholds[asset];
        if (threshold && BigInt(amount) >= BigInt(threshold)) {
          if (!result.includes(charityId)) {
            result.push(charityId);
          }
          break;
        }
      }
    }
    
    return result;
  }
}