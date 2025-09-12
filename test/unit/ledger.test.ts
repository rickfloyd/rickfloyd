import { FileSystemDonationLedger } from '../../../src/infrastructure/ledger';
import { NewLedgerEntry, DonationLedgerRecord } from '../../../src/domain/ledger';
import { SupportedAsset } from '../../../src/domain/assets';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('Ledger Operations', () => {
  describe('FileSystemDonationLedger', () => {
    let ledger: FileSystemDonationLedger;
    let tempDir: string;

    beforeEach(async () => {
      // Create temporary directory for test ledger
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ledger-test-'));
      ledger = new FileSystemDonationLedger(tempDir, 'test-donations.jsonl');
    });

    afterEach(async () => {
      // Cleanup temporary directory
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    it('should start with empty ledger', async () => {
      const count = await ledger.getEntryCount();
      expect(count).toBe(0);
    });

    it('should append entries correctly', async () => {
      const donationRecord: DonationLedgerRecord = {
        id: 'test-donation-1',
        charityId: 'charity-123',
        asset: SupportedAsset.BTC,
        amount: '100000',
        targetAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        transactionHash: 'tx_hash_123',
        priceSnapshot: {
          asset: SupportedAsset.BTC,
          priceUsd: 45000,
          timestamp: new Date(),
          source: 'coingecko'
        },
        usdValue: 45,
        timestamp: new Date(),
        status: 'confirmed'
      };

      const entry: NewLedgerEntry = {
        donationRecord,
        metadata: { source: 'test' }
      };

      const appendedEntry = await ledger.append(entry);

      expect(appendedEntry.sequenceNumber).toBe(1);
      expect(appendedEntry.donationRecord).toEqual(donationRecord);
      expect(appendedEntry.entryHash).toBeDefined();
      expect(appendedEntry.previousHash).toBeDefined();
    });

    it('should maintain hash chain integrity', async () => {
      // Add multiple entries
      const entries: NewLedgerEntry[] = [];
      for (let i = 1; i <= 3; i++) {
        entries.push({
          donationRecord: {
            id: `test-donation-${i}`,
            charityId: 'charity-123',
            asset: SupportedAsset.BTC,
            amount: (100000 * i).toString(),
            targetAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
            transactionHash: `tx_hash_${i}`,
            priceSnapshot: {
              asset: SupportedAsset.BTC,
              priceUsd: 45000,
              timestamp: new Date(),
              source: 'coingecko'
            },
            usdValue: 45 * i,
            timestamp: new Date(),
            status: 'confirmed'
          }
        });
      }

      // Append entries
      for (const entry of entries) {
        await ledger.append(entry);
      }

      // Verify integrity
      const integrity = await ledger.verifyIntegrity();
      expect(integrity.isValid).toBe(true);
      expect(integrity.errors).toHaveLength(0);
      expect(integrity.totalEntries).toBe(3);
    });

    it('should detect integrity violations', async () => {
      // Add an entry normally
      const entry: NewLedgerEntry = {
        donationRecord: {
          id: 'test-donation-1',
          charityId: 'charity-123',
          asset: SupportedAsset.BTC,
          amount: '100000',
          targetAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
          transactionHash: 'tx_hash_123',
          priceSnapshot: {
            asset: SupportedAsset.BTC,
            priceUsd: 45000,
            timestamp: new Date(),
            source: 'coingecko'
          },
          usdValue: 45,
          timestamp: new Date(),
          status: 'confirmed'
        }
      };

      await ledger.append(entry);

      // Manually corrupt the ledger file
      const ledgerFile = path.join(tempDir, 'test-donations.jsonl');
      const content = await fs.readFile(ledgerFile, 'utf8');
      const corrupted = content.replace('"entryHash":', '"corruptedHash":');
      await fs.writeFile(ledgerFile, corrupted);

      // Verify integrity should fail
      const integrity = await ledger.verifyIntegrity();
      expect(integrity.isValid).toBe(false);
      expect(integrity.errors.length).toBeGreaterThan(0);
    });

    it('should retrieve entries by charity', async () => {
      // Add entries for different charities
      const charities = ['charity-1', 'charity-2', 'charity-1'];
      
      for (let i = 0; i < charities.length; i++) {
        const entry: NewLedgerEntry = {
          donationRecord: {
            id: `donation-${i}`,
            charityId: charities[i],
            asset: SupportedAsset.BTC,
            amount: '100000',
            targetAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
            transactionHash: `tx_${i}`,
            priceSnapshot: {
              asset: SupportedAsset.BTC,
              priceUsd: 45000,
              timestamp: new Date(),
              source: 'coingecko'
            },
            usdValue: 45,
            timestamp: new Date(),
            status: 'confirmed'
          }
        };
        await ledger.append(entry);
      }

      const charity1Entries = await ledger.getEntriesByCharity('charity-1');
      expect(charity1Entries).toHaveLength(2);
      expect(charity1Entries.every(e => e.donationRecord.charityId === 'charity-1')).toBe(true);
    });

    it('should generate correct statistics', async () => {
      // Add test entries
      const assets = [SupportedAsset.BTC, SupportedAsset.LTC, SupportedAsset.BTC];
      const amounts = ['100000', '200000', '150000'];
      const usdValues = [45, 16, 67.5];

      for (let i = 0; i < assets.length; i++) {
        const entry: NewLedgerEntry = {
          donationRecord: {
            id: `donation-${i}`,
            charityId: 'charity-1',
            asset: assets[i],
            amount: amounts[i],
            targetAddress: 'test_address',
            transactionHash: `tx_${i}`,
            priceSnapshot: {
              asset: assets[i],
              priceUsd: 45000,
              timestamp: new Date(),
              source: 'coingecko'
            },
            usdValue: usdValues[i],
            timestamp: new Date(),
            status: 'confirmed'
          }
        };
        await ledger.append(entry);
      }

      const stats = await ledger.getStatistics();
      expect(stats.totalEntries).toBe(3);
      expect(stats.totalDonationsUsd).toBeCloseTo(128.5, 2);
      expect(stats.donationsByAsset[SupportedAsset.BTC].count).toBe(2);
      expect(stats.donationsByAsset[SupportedAsset.LTC].count).toBe(1);
    });

    // TODO: Add tests for concurrent access and file locking
    describe.skip('Concurrent Access', () => {
      it('should handle concurrent append operations', async () => {
        // Test implementation placeholder
      });

      it('should properly lock and unlock ledger file', async () => {
        // Test implementation placeholder
      });
    });
  });

  // TODO: Add tests for other ledger implementations
  describe.skip('Alternative Ledger Implementations', () => {
    // Test placeholder for future database-backed ledger
  });
});