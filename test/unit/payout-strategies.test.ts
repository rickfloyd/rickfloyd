import {
  DirectPayoutStrategy,
  ThresholdBatchPayoutStrategy,
  InMemoryAccrualStore
} from '../../../src/application/payout/strategies';
import {
  DistributableBalance,
  CharityAllocationContext,
  PayoutGlobalPolicy,
  PayoutPriority
} from '../../../src/domain/payout';
import { SupportedAsset } from '../../../src/domain/assets';

describe('Payout Strategies', () => {
  describe('DirectPayoutStrategy', () => {
    let strategy: DirectPayoutStrategy;
    let mockContext: CharityAllocationContext;
    let mockPolicy: PayoutGlobalPolicy;

    beforeEach(() => {
      strategy = new DirectPayoutStrategy();
      
      mockPolicy = {
        minimumPayoutThreshold: {
          [SupportedAsset.BTC]: '10000',
          [SupportedAsset.LTC]: '100000',
          [SupportedAsset.DOGE]: '100000000',
          [SupportedAsset.XMR]: '10000000000',
          [SupportedAsset.KAS]: '100000000',
          [SupportedAsset.ERG]: '1000000000',
          [SupportedAsset.RVN]: '100000000'
        },
        maxPayoutsPerBatch: 50,
        batchIntervalHours: 24,
        reservePercentage: 5,
        emergencyStopEnabled: false,
        allowPartialPayouts: true,
        defaultPriority: PayoutPriority.NORMAL
      };

      mockContext = {
        totalDistributableAmount: '1000000',
        asset: SupportedAsset.BTC,
        allocationPeriod: {
          start: new Date(Date.now() - 86400000), // 1 day ago
          end: new Date()
        },
        eligibleCharities: ['charity-1', 'charity-2', 'charity-3'],
        globalPolicy: mockPolicy
      };
    });

    it('should have correct strategy name', () => {
      expect(strategy.name).toBe('DirectPayout');
    });

    it('should handle empty charity list', async () => {
      const emptyContext = { ...mockContext, eligibleCharities: [] };
      const payouts = await strategy.calculatePayouts([], emptyContext);
      
      expect(payouts).toHaveLength(0);
    });

    it('should calculate equal distribution among charities', async () => {
      const balance: DistributableBalance = {
        asset: SupportedAsset.BTC,
        amount: '1000000', // 0.01 BTC in satoshis
        timestamp: new Date()
      };

      const payouts = await strategy.calculatePayouts([balance], mockContext);
      
      expect(payouts).toHaveLength(3); // One per charity
      
      // After 5% reserve, 950000 / 3 = 316666 per charity
      const expectedAmount = Math.floor(950000 / 3);
      expect(payouts.every(p => 
        parseInt(p.amount) === expectedAmount
      )).toBe(true);
      
      expect(payouts.every(p => p.asset === SupportedAsset.BTC)).toBe(true);
      expect(payouts.every(p => p.priority === PayoutPriority.NORMAL)).toBe(true);
    });

    it('should respect minimum payout thresholds', async () => {
      const smallBalance: DistributableBalance = {
        asset: SupportedAsset.BTC,
        amount: '5000', // Below threshold of 10000
        timestamp: new Date()
      };

      const payouts = await strategy.calculatePayouts([smallBalance], mockContext);
      
      expect(payouts).toHaveLength(0); // Should skip due to threshold
    });

    it('should apply reserve percentage correctly', async () => {
      const balance: DistributableBalance = {
        asset: SupportedAsset.BTC,
        amount: '1000000',
        timestamp: new Date()
      };

      const payouts = await strategy.calculatePayouts([balance], mockContext);
      
      const totalPayout = payouts.reduce((sum, p) => sum + parseInt(p.amount), 0);
      const expectedTotal = 1000000 * 0.95; // After 5% reserve
      
      expect(totalPayout).toBe(expectedTotal);
    });

    it('should execute payouts successfully', async () => {
      const mockPayout = {
        id: 'payout-123',
        charityId: 'charity-1',
        asset: SupportedAsset.BTC,
        amount: '100000',
        targetAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        plannedAt: new Date(),
        priority: PayoutPriority.NORMAL
      };

      const result = await strategy.executePayout(mockPayout);
      
      expect(result.success).toBe(true);
      expect(result.transactionHash).toBeDefined();
      expect(result.actualAmount).toBe(mockPayout.amount);
      expect(result.feePaid).toBeDefined();
    });

    it('should handle context validation', () => {
      expect(strategy.canHandle(mockContext)).toBe(true);
      
      const emptyContext = { ...mockContext, eligibleCharities: [] };
      expect(strategy.canHandle(emptyContext)).toBe(false);
    });
  });

  describe('ThresholdBatchPayoutStrategy', () => {
    let strategy: ThresholdBatchPayoutStrategy;
    let accrualStore: InMemoryAccrualStore;
    let mockContext: CharityAllocationContext;

    beforeEach(() => {
      accrualStore = new InMemoryAccrualStore();
      strategy = new ThresholdBatchPayoutStrategy(accrualStore);
      
      mockContext = {
        totalDistributableAmount: '1000000',
        asset: SupportedAsset.XMR,
        allocationPeriod: {
          start: new Date(Date.now() - 86400000),
          end: new Date()
        },
        eligibleCharities: ['charity-1', 'charity-2'],
        globalPolicy: {
          minimumPayoutThreshold: {
            [SupportedAsset.XMR]: '50000000000' // 0.05 XMR threshold
          },
          maxPayoutsPerBatch: 25,
          batchIntervalHours: 24,
          reservePercentage: 10,
          emergencyStopEnabled: false,
          allowPartialPayouts: true,
          defaultPriority: PayoutPriority.NORMAL
        } as PayoutGlobalPolicy
      };
    });

    it('should have correct strategy name', () => {
      expect(strategy.name).toBe('ThresholdBatchPayout');
    });

    it('should accumulate amounts below threshold', async () => {
      const balance: DistributableBalance = {
        asset: SupportedAsset.XMR,
        amount: '20000000000', // 0.02 XMR - below threshold
        timestamp: new Date()
      };

      const payouts = await strategy.calculatePayouts([balance], mockContext);
      
      expect(payouts).toHaveLength(0); // No immediate payouts
      
      // Check that amounts were accrued
      const accruedBalance = await accrualStore.getAccruedBalance('charity-1', SupportedAsset.XMR);
      expect(parseInt(accruedBalance)).toBeGreaterThan(0);
    });

    it('should create payouts when threshold is reached', async () => {
      // First, accumulate some amounts
      const smallBalance: DistributableBalance = {
        asset: SupportedAsset.XMR,
        amount: '30000000000', // 0.03 XMR
        timestamp: new Date()
      };

      await strategy.calculatePayouts([smallBalance], mockContext);

      // Now add enough to trigger threshold
      const largeBalance: DistributableBalance = {
        asset: SupportedAsset.XMR,
        amount: '50000000000', // 0.05 XMR
        timestamp: new Date()
      };

      const payouts = await strategy.calculatePayouts([largeBalance], mockContext);
      
      expect(payouts.length).toBeGreaterThan(0);
      expect(payouts.every(p => p.scheduledFor)).toBeDefined();
    });

    it('should clear accrued balances after payout', async () => {
      // Accumulate above threshold
      const balance: DistributableBalance = {
        asset: SupportedAsset.XMR,
        amount: '100000000000', // 0.1 XMR
        timestamp: new Date()
      };

      await strategy.calculatePayouts([balance], mockContext);
      
      // Check that balances were cleared for payouts
      const remainingBalance = await accrualStore.getAccruedBalance('charity-1', SupportedAsset.XMR);
      expect(remainingBalance).toBe('0');
    });

    it('should handle context validation correctly', () => {
      expect(strategy.canHandle(mockContext)).toBe(true);
      
      const invalidContext = { 
        ...mockContext, 
        globalPolicy: { 
          ...mockContext.globalPolicy, 
          batchIntervalHours: 0 
        } 
      };
      expect(strategy.canHandle(invalidContext)).toBe(false);
    });

    it('should execute batch payouts with appropriate fees', async () => {
      const mockPayout = {
        id: 'batch-payout-123',
        charityId: 'charity-1',
        asset: SupportedAsset.XMR,
        amount: '100000000000',
        targetAddress: 'xmr_address_123',
        plannedAt: new Date(),
        priority: PayoutPriority.NORMAL
      };

      const result = await strategy.executePayout(mockPayout);
      
      expect(result.success).toBe(true);
      expect(result.transactionHash).toContain('batch_');
      expect(parseInt(result.gasUsed!)).toBeGreaterThan(100000); // Higher gas for batch
    });
  });

  describe('InMemoryAccrualStore', () => {
    let store: InMemoryAccrualStore;

    beforeEach(() => {
      store = new InMemoryAccrualStore();
    });

    it('should start with zero balance', async () => {
      const balance = await store.getAccruedBalance('charity-1', SupportedAsset.BTC);
      expect(balance).toBe('0');
    });

    it('should accumulate balances correctly', async () => {
      const allocation = {
        charityId: 'charity-1',
        asset: SupportedAsset.BTC,
        allocatedAmount: '100000',
        percentage: 33.33,
        allocationMethod: 'equal',
        calculatedAt: new Date()
      };

      await store.accrue('charity-1', allocation);
      await store.accrue('charity-1', allocation);

      const balance = await store.getAccruedBalance('charity-1', SupportedAsset.BTC);
      expect(balance).toBe('200000');
    });

    it('should handle multiple assets per charity', async () => {
      const btcAllocation = {
        charityId: 'charity-1',
        asset: SupportedAsset.BTC,
        allocatedAmount: '100000',
        percentage: 50,
        allocationMethod: 'equal',
        calculatedAt: new Date()
      };

      const ltcAllocation = {
        charityId: 'charity-1',
        asset: SupportedAsset.LTC,
        allocatedAmount: '200000',
        percentage: 50,
        allocationMethod: 'equal',
        calculatedAt: new Date()
      };

      await store.accrue('charity-1', btcAllocation);
      await store.accrue('charity-1', ltcAllocation);

      const allBalances = await store.getAllAccruedBalances('charity-1');
      expect(allBalances[SupportedAsset.BTC]).toBe('100000');
      expect(allBalances[SupportedAsset.LTC]).toBe('200000');
    });

    it('should identify charities above threshold', async () => {
      // Setup balances
      await store.accrue('charity-1', {
        charityId: 'charity-1',
        asset: SupportedAsset.BTC,
        allocatedAmount: '50000',
        percentage: 100,
        allocationMethod: 'equal',
        calculatedAt: new Date()
      });

      await store.accrue('charity-2', {
        charityId: 'charity-2',
        asset: SupportedAsset.BTC,
        allocatedAmount: '5000',
        percentage: 100,
        allocationMethod: 'equal',
        calculatedAt: new Date()
      });

      const thresholds = { [SupportedAsset.BTC]: '10000' };
      const charitiesAbove = await store.getCharitiesAboveThreshold(thresholds);

      expect(charitiesAbove).toContain('charity-1');
      expect(charitiesAbove).not.toContain('charity-2');
    });

    it('should clear balances correctly', async () => {
      await store.accrue('charity-1', {
        charityId: 'charity-1',
        asset: SupportedAsset.BTC,
        allocatedAmount: '100000',
        percentage: 100,
        allocationMethod: 'equal',
        calculatedAt: new Date()
      });

      await store.clearAccruedBalance('charity-1', SupportedAsset.BTC);
      
      const balance = await store.getAccruedBalance('charity-1', SupportedAsset.BTC);
      expect(balance).toBe('0');
    });
  });

  // TODO: Add integration tests
  describe.skip('Strategy Integration Tests', () => {
    it('should handle strategy switching scenarios', async () => {
      // Test implementation placeholder
    });

    it('should maintain consistency across strategy changes', async () => {
      // Test implementation placeholder
    });
  });
});