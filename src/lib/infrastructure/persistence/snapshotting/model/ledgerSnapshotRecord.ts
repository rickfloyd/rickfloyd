/**
 * Ledger Snapshot Record Model
 * TODO: ledger-modeling - Expand with domain-specific properties
 */

export interface LedgerSnapshotRecord {
  id: string;
  version: string;
  timestamp: Date;
  blockNumber?: number;
  stateRoot: string;
  transactionCount: number;
  accountCount: number;
  totalSupply?: number;
  metadata: LedgerSnapshotMetadata;
  integrity: SnapshotIntegrityInfo;
  compression?: CompressionInfo;
}

export interface LedgerSnapshotMetadata {
  networkId: string;
  chainId?: string;
  consensusAlgorithm?: string;
  snapshotType: 'genesis' | 'checkpoint' | 'backup' | 'migration';
  triggerReason: 'scheduled' | 'manual' | 'threshold' | 'emergency';
  retentionPolicy: 'permanent' | 'temporary' | 'archive';
  tags: Record<string, string>;
  customProperties: Record<string, any>;
}

export interface SnapshotIntegrityInfo {
  dataHash: string;
  merkleRoot?: string;
  signatureHash?: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  verifiedAt?: Date;
  verifiedBy?: string;
}

export interface CompressionInfo {
  algorithm: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  compressedHash: string;
}

export class LedgerSnapshotRecordBuilder {
  private record: Partial<LedgerSnapshotRecord> = {};

  static create(): LedgerSnapshotRecordBuilder {
    return new LedgerSnapshotRecordBuilder();
  }

  withId(id: string): LedgerSnapshotRecordBuilder {
    this.record.id = id;
    return this;
  }

  withVersion(version: string): LedgerSnapshotRecordBuilder {
    this.record.version = version;
    return this;
  }

  withStateRoot(stateRoot: string): LedgerSnapshotRecordBuilder {
    this.record.stateRoot = stateRoot;
    return this;
  }

  withCounts(transactionCount: number, accountCount: number): LedgerSnapshotRecordBuilder {
    this.record.transactionCount = transactionCount;
    this.record.accountCount = accountCount;
    return this;
  }

  withBlockNumber(blockNumber: number): LedgerSnapshotRecordBuilder {
    this.record.blockNumber = blockNumber;
    return this;
  }

  withTotalSupply(totalSupply: number): LedgerSnapshotRecordBuilder {
    this.record.totalSupply = totalSupply;
    return this;
  }

  withMetadata(metadata: LedgerSnapshotMetadata): LedgerSnapshotRecordBuilder {
    this.record.metadata = metadata;
    return this;
  }

  withIntegrity(integrity: SnapshotIntegrityInfo): LedgerSnapshotRecordBuilder {
    this.record.integrity = integrity;
    return this;
  }

  withCompression(compression: CompressionInfo): LedgerSnapshotRecordBuilder {
    this.record.compression = compression;
    return this;
  }

  build(): LedgerSnapshotRecord {
    const requiredFields = ['id', 'stateRoot', 'transactionCount', 'accountCount', 'metadata', 'integrity'];
    const missing = requiredFields.filter(field => !(field in this.record));
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    return {
      timestamp: new Date(),
      version: this.record.version || '1.0.0',
      ...this.record
    } as LedgerSnapshotRecord;
  }
}

export class LedgerSnapshotRecordValidator {
  static validate(record: LedgerSnapshotRecord): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!record.id) errors.push('Missing required field: id');
    if (!record.stateRoot) errors.push('Missing required field: stateRoot');
    if (record.transactionCount < 0) errors.push('Invalid transactionCount');
    if (record.accountCount < 0) errors.push('Invalid accountCount');
    if (!record.metadata) errors.push('Missing required field: metadata');
    if (!record.integrity) errors.push('Missing required field: integrity');

    // Validate metadata
    if (record.metadata) {
      if (!record.metadata.networkId) errors.push('Missing metadata.networkId');
      if (!['genesis', 'checkpoint', 'backup', 'migration'].includes(record.metadata.snapshotType)) {
        errors.push('Invalid metadata.snapshotType');
      }
    }

    // Validate integrity
    if (record.integrity) {
      if (!record.integrity.dataHash) errors.push('Missing integrity.dataHash');
      if (!['pending', 'verified', 'failed'].includes(record.integrity.verificationStatus)) {
        errors.push('Invalid integrity.verificationStatus');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}