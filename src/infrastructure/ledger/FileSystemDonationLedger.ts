import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  IDonationLedger,
  NewLedgerEntry,
  LedgerEntry,
  IntegrityVerificationResult,
  LedgerStatistics,
  DonationLedgerRecord
} from '../../domain/ledger';
import { SupportedAsset } from '../../domain/assets';

/**
 * File system implementation of donation ledger with hash chaining and JSONL format
 * Each line in the file represents a single ledger entry in JSON format
 */
export class FileSystemDonationLedger implements IDonationLedger {
  private readonly filePath: string;
  private readonly lockFilePath: string;

  constructor(ledgerDirectory: string, filename: string = 'donations.jsonl') {
    this.filePath = path.join(ledgerDirectory, filename);
    this.lockFilePath = path.join(ledgerDirectory, `${filename}.lock`);
  }

  async append(entry: NewLedgerEntry): Promise<LedgerEntry> {
    return this.withLock(async () => {
      const previousEntry = await this.getLatestEntry();
      const sequenceNumber = previousEntry ? previousEntry.sequenceNumber + 1 : 1;
      const previousHash = previousEntry ? previousEntry.entryHash : this.getGenesisHash();
      
      const ledgerEntry: LedgerEntry = {
        ...entry,
        sequenceNumber,
        previousHash,
        entryHash: '', // Will be calculated
        addedAt: new Date()
      };

      // Calculate hash for this entry
      ledgerEntry.entryHash = this.calculateEntryHash(ledgerEntry as any);

      // Append to file
      const jsonLine = JSON.stringify(ledgerEntry) + '\n';
      await fs.appendFile(this.filePath, jsonLine, 'utf8');

      return ledgerEntry;
    });
  }

  async getEntry(sequenceNumber: number): Promise<LedgerEntry | null> {
    const entries = await this.readAllEntries();
    return entries.find(e => e.sequenceNumber === sequenceNumber) || null;
  }

  async getEntries(fromSequence: number, toSequence: number): Promise<LedgerEntry[]> {
    const entries = await this.readAllEntries();
    return entries.filter(e => 
      e.sequenceNumber >= fromSequence && e.sequenceNumber <= toSequence
    );
  }

  async getEntriesByCharity(charityId: string): Promise<LedgerEntry[]> {
    const entries = await this.readAllEntries();
    return entries.filter(e => e.donationRecord.charityId === charityId);
  }

  async getEntriesByAsset(asset: SupportedAsset): Promise<LedgerEntry[]> {
    const entries = await this.readAllEntries();
    return entries.filter(e => e.donationRecord.asset === asset);
  }

  async getEntriesByDateRange(from: Date, to: Date): Promise<LedgerEntry[]> {
    const entries = await this.readAllEntries();
    return entries.filter(e => {
      const entryDate = new Date(e.donationRecord.timestamp);
      return entryDate >= from && entryDate <= to;
    });
  }

  async getLatestEntry(): Promise<LedgerEntry | null> {
    const entries = await this.readAllEntries();
    return entries.length > 0 ? entries[entries.length - 1] : null;
  }

  async getEntryCount(): Promise<number> {
    const entries = await this.readAllEntries();
    return entries.length;
  }

  async verifyIntegrity(): Promise<IntegrityVerificationResult> {
    const entries = await this.readAllEntries();
    const errors: string[] = [];
    let firstInvalidSequence: number | undefined;

    if (entries.length === 0) {
      return {
        isValid: true,
        totalEntries: 0,
        errors: [],
        verifiedAt: new Date()
      };
    }

    // Verify sequence numbers are consecutive starting from 1
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const expectedSequence = i + 1;
      
      if (entry.sequenceNumber !== expectedSequence) {
        errors.push(`Invalid sequence number at position ${i}: expected ${expectedSequence}, got ${entry.sequenceNumber}`);
        if (firstInvalidSequence === undefined) {
          firstInvalidSequence = entry.sequenceNumber;
        }
      }
    }

    // Verify hash chain
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const expectedPreviousHash = i === 0 ? this.getGenesisHash() : entries[i - 1].entryHash;
      
      if (entry.previousHash !== expectedPreviousHash) {
        errors.push(`Invalid previous hash at sequence ${entry.sequenceNumber}: expected ${expectedPreviousHash}, got ${entry.previousHash}`);
        if (firstInvalidSequence === undefined) {
          firstInvalidSequence = entry.sequenceNumber;
        }
      }

      // Verify entry hash
      const calculatedHash = this.calculateEntryHash(entry);
      if (entry.entryHash !== calculatedHash) {
        errors.push(`Invalid entry hash at sequence ${entry.sequenceNumber}: expected ${calculatedHash}, got ${entry.entryHash}`);
        if (firstInvalidSequence === undefined) {
          firstInvalidSequence = entry.sequenceNumber;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      totalEntries: entries.length,
      firstInvalidSequence,
      errors,
      verifiedAt: new Date()
    };
  }

  async getStatistics(): Promise<LedgerStatistics> {
    const entries = await this.readAllEntries();
    
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        totalDonationsUsd: 0,
        donationsByAsset: {} as any,
        donationsByCharity: {},
        lastVerifiedAt: new Date()
      };
    }

    const donationsByAsset: Record<SupportedAsset, any> = {} as any;
    const donationsByCharity: Record<string, any> = {};
    let totalUsd = 0;
    let firstDonation: Date | undefined;
    let lastDonation: Date | undefined;

    for (const entry of entries) {
      const record = entry.donationRecord;
      const donationDate = new Date(record.timestamp);
      
      if (!firstDonation || donationDate < firstDonation) {
        firstDonation = donationDate;
      }
      if (!lastDonation || donationDate > lastDonation) {
        lastDonation = donationDate;
      }

      totalUsd += record.usdValue;

      // Asset statistics
      if (!donationsByAsset[record.asset]) {
        donationsByAsset[record.asset] = {
          count: 0,
          totalAmount: '0',
          totalUsdValue: 0
        };
      }
      donationsByAsset[record.asset].count++;
      donationsByAsset[record.asset].totalAmount = (
        BigInt(donationsByAsset[record.asset].totalAmount) + BigInt(record.amount)
      ).toString();
      donationsByAsset[record.asset].totalUsdValue += record.usdValue;

      // Charity statistics
      if (!donationsByCharity[record.charityId]) {
        donationsByCharity[record.charityId] = {
          count: 0,
          totalUsdValue: 0
        };
      }
      donationsByCharity[record.charityId].count++;
      donationsByCharity[record.charityId].totalUsdValue += record.usdValue;
    }

    return {
      totalEntries: entries.length,
      totalDonationsUsd: totalUsd,
      donationsByAsset,
      donationsByCharity,
      firstDonationAt: firstDonation,
      lastDonationAt: lastDonation,
      lastVerifiedAt: new Date()
    };
  }

  private async readAllEntries(): Promise<LedgerEntry[]> {
    try {
      const content = await fs.readFile(this.filePath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.length > 0);
      return lines.map(line => JSON.parse(line) as LedgerEntry);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet
        return [];
      }
      throw error;
    }
  }

  private calculateEntryHash(entry: LedgerEntry): string {
    // Create a deterministic string representation for hashing
    const hashData = {
      sequenceNumber: entry.sequenceNumber,
      previousHash: entry.previousHash,
      donationRecord: entry.donationRecord,
      metadata: entry.metadata || {},
      addedAt: entry.addedAt.toISOString()
    };
    
    const canonicalString = JSON.stringify(hashData, Object.keys(hashData).sort());
    return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
  }

  private getGenesisHash(): string {
    return crypto.createHash('sha256').update('DONATION_LEDGER_GENESIS', 'utf8').digest('hex');
  }

  private async withLock<T>(operation: () => Promise<T>): Promise<T> {
    // Simple file-based locking mechanism
    let lockAcquired = false;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!lockAcquired && attempts < maxAttempts) {
      try {
        await fs.writeFile(this.lockFilePath, process.pid.toString(), { flag: 'wx' });
        lockAcquired = true;
      } catch (error: any) {
        if (error.code === 'EEXIST') {
          // Lock exists, wait and retry
          await new Promise(resolve => setTimeout(resolve, 10));
          attempts++;
        } else {
          throw error;
        }
      }
    }

    if (!lockAcquired) {
      throw new Error('Could not acquire ledger lock after maximum attempts');
    }

    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      return await operation();
    } finally {
      // Release lock
      try {
        await fs.unlink(this.lockFilePath);
      } catch (error) {
        // Ignore errors when releasing lock
      }
    }
  }
}