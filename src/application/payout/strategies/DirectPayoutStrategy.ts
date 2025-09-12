import {
  IPayoutStrategy,
  DistributableBalance,
  PlannedPayout,
  CharityAllocationContext,
  PayoutResult,
  PayoutPriority,
  PayoutStatus
} from '../../../domain/payout';
import { AssetCatalog } from '../../../domain/assets';
// Simple UUID generator for placeholder implementation
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Direct payout strategy - immediately distributes available balances to charities
 * without accumulation or batching
 */
export class DirectPayoutStrategy implements IPayoutStrategy {
  readonly name = 'DirectPayout';

  async calculatePayouts(
    balances: DistributableBalance[],
    context: CharityAllocationContext
  ): Promise<PlannedPayout[]> {
    const payouts: PlannedPayout[] = [];
    
    for (const balance of balances) {
      // Skip if balance is below minimum threshold
      const minThreshold = context.globalPolicy.minimumPayoutThreshold[balance.asset];
      if (minThreshold && BigInt(balance.amount) < BigInt(minThreshold)) {
        continue;
      }

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

      // Create payout for each charity
      for (const charityId of context.eligibleCharities) {
        payouts.push({
          id: generateId(),
          charityId,
          asset: balance.asset,
          amount: amountPerCharity.toString(),
          targetAddress: await this.getCharityAddress(charityId, balance.asset),
          plannedAt: new Date(),
          priority: context.globalPolicy.defaultPriority
        });
      }
    }

    return payouts;
  }

  async executePayout(payout: PlannedPayout): Promise<PayoutResult> {
    // Placeholder implementation - in production this would integrate with chain clients
    try {
      // Simulate transaction execution
      const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const mockGasUsed = '21000';
      const mockFee = '1000';
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
    // Direct strategy can handle any context
    return context.eligibleCharities.length > 0;
  }

  private async getCharityAddress(charityId: string, asset: string): Promise<string> {
    // Placeholder - in production this would query the charity registry
    return `${asset.toLowerCase()}_charity_${charityId}_address`;
  }
}