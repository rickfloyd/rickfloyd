/**
 * Ledger Snapshot Options Validator
 * TODO: config-validation - Add domain-specific validation rules
 */

export interface LedgerSnapshotOptions {
  enableCompression: boolean;
  compressionLevel: number;
  enableIntegrityChecks: boolean;
  enableDifferentialSnapshots: boolean;
  retentionPeriodDays: number;
  maxSnapshotSize: number; // bytes
  snapshotInterval: number; // milliseconds
  storageLocation: string;
  backupLocations?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class LedgerSnapshotOptionsValidator {
  private static instance: LedgerSnapshotOptionsValidator;
  private readonly MAX_RETENTION_DAYS = 365 * 10; // 10 years
  private readonly MIN_RETENTION_DAYS = 1;
  private readonly MAX_SNAPSHOT_SIZE = 100 * 1024 * 1024 * 1024; // 100GB
  private readonly MIN_SNAPSHOT_INTERVAL = 60 * 1000; // 1 minute

  public static getInstance(): LedgerSnapshotOptionsValidator {
    if (!LedgerSnapshotOptionsValidator.instance) {
      LedgerSnapshotOptionsValidator.instance = new LedgerSnapshotOptionsValidator();
    }
    return LedgerSnapshotOptionsValidator.instance;
  }

  validate(options: LedgerSnapshotOptions): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate compression level
    if (options.enableCompression) {
      if (options.compressionLevel < 1 || options.compressionLevel > 9) {
        errors.push('compressionLevel must be between 1 and 9');
      } else if (options.compressionLevel > 6) {
        warnings.push('High compression levels may impact performance');
      }
    }

    // Validate retention period
    if (options.retentionPeriodDays < this.MIN_RETENTION_DAYS) {
      errors.push(`retentionPeriodDays must be at least ${this.MIN_RETENTION_DAYS}`);
    } else if (options.retentionPeriodDays > this.MAX_RETENTION_DAYS) {
      errors.push(`retentionPeriodDays cannot exceed ${this.MAX_RETENTION_DAYS}`);
    } else if (options.retentionPeriodDays < 7) {
      warnings.push('Retention period < 7 days may not provide adequate recovery options');
    }

    // Validate snapshot size
    if (options.maxSnapshotSize <= 0) {
      errors.push('maxSnapshotSize must be greater than 0');
    } else if (options.maxSnapshotSize > this.MAX_SNAPSHOT_SIZE) {
      errors.push(`maxSnapshotSize cannot exceed ${this.MAX_SNAPSHOT_SIZE} bytes`);
    } else if (options.maxSnapshotSize < 1024 * 1024) { // 1MB
      warnings.push('maxSnapshotSize < 1MB may be too restrictive');
    }

    // Validate snapshot interval
    if (options.snapshotInterval < this.MIN_SNAPSHOT_INTERVAL) {
      errors.push(`snapshotInterval must be at least ${this.MIN_SNAPSHOT_INTERVAL}ms`);
    } else if (options.snapshotInterval < 5 * 60 * 1000) { // 5 minutes
      warnings.push('snapshotInterval < 5 minutes may cause high I/O load');
    }

    // Validate storage location
    if (!options.storageLocation || options.storageLocation.trim().length === 0) {
      errors.push('storageLocation is required');
    } else if (!this.isValidPath(options.storageLocation)) {
      errors.push('storageLocation must be a valid file path');
    }

    // Validate backup locations
    if (options.backupLocations) {
      const invalidBackupPaths = options.backupLocations.filter(path => !this.isValidPath(path));
      if (invalidBackupPaths.length > 0) {
        errors.push(`Invalid backup locations: ${invalidBackupPaths.join(', ')}`);
      }

      if (options.backupLocations.includes(options.storageLocation)) {
        warnings.push('Backup location should not be the same as primary storage location');
      }
    }

    // Feature compatibility checks
    if (options.enableDifferentialSnapshots && !options.enableIntegrityChecks) {
      warnings.push('Differential snapshots without integrity checks may lead to corruption');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateAndThrow(options: LedgerSnapshotOptions): void {
    const result = this.validate(options);
    if (!result.isValid) {
      throw new Error(`LedgerSnapshot configuration is invalid: ${result.errors.join(', ')}`);
    }
    
    if (result.warnings.length > 0) {
      console.warn('[CONFIG] LedgerSnapshot warnings:', result.warnings);
    }
  }

  getDefaultOptions(): LedgerSnapshotOptions {
    return {
      enableCompression: true,
      compressionLevel: 6,
      enableIntegrityChecks: true,
      enableDifferentialSnapshots: false,
      retentionPeriodDays: 30,
      maxSnapshotSize: 10 * 1024 * 1024 * 1024, // 10GB
      snapshotInterval: 60 * 60 * 1000, // 1 hour
      storageLocation: './data/snapshots',
      backupLocations: ['./backup/snapshots']
    };
  }

  private isValidPath(path: string): boolean {
    // Basic path validation - in real implementation would be more sophisticated
    return Boolean(path && path.trim().length > 0 && !path.includes('..') && path.length < 260);
  }
}