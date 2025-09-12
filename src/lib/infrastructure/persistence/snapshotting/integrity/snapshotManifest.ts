/**
 * Snapshot Manifest for integrity verification
 * TODO: snapshot-compression-hashing - Add more sophisticated manifest chaining
 */

export interface SnapshotManifest {
  id: string;
  timestamp: Date;
  version: string;
  dataHash: string;
  compressedHash?: string;
  compressionAlgorithm?: string;
  compressionRatio?: number;
  originalSize: number;
  compressedSize?: number;
  metadata: SnapshotMetadata;
  dependencies?: string[]; // IDs of snapshots this one depends on
  signature?: string; // For cryptographic verification
}

export interface SnapshotMetadata {
  source: string;
  type: 'full' | 'differential' | 'incremental';
  baseSnapshotId?: string; // For differential snapshots
  entityCount?: number;
  schemaVersion?: string;
  tags?: Record<string, string>;
  customProperties?: Record<string, any>;
}

export class SnapshotManifestBuilder {
  private manifest: Partial<SnapshotManifest> = {};

  static create(): SnapshotManifestBuilder {
    return new SnapshotManifestBuilder();
  }

  withId(id: string): SnapshotManifestBuilder {
    this.manifest.id = id;
    return this;
  }

  withVersion(version: string): SnapshotManifestBuilder {
    this.manifest.version = version;
    return this;
  }

  withDataHash(hash: string): SnapshotManifestBuilder {
    this.manifest.dataHash = hash;
    return this;
  }

  withCompression(algorithm: string, compressedHash: string, ratio: number): SnapshotManifestBuilder {
    this.manifest.compressionAlgorithm = algorithm;
    this.manifest.compressedHash = compressedHash;
    this.manifest.compressionRatio = ratio;
    return this;
  }

  withSizes(originalSize: number, compressedSize?: number): SnapshotManifestBuilder {
    this.manifest.originalSize = originalSize;
    this.manifest.compressedSize = compressedSize;
    return this;
  }

  withMetadata(metadata: SnapshotMetadata): SnapshotManifestBuilder {
    this.manifest.metadata = metadata;
    return this;
  }

  withDependencies(dependencies: string[]): SnapshotManifestBuilder {
    this.manifest.dependencies = dependencies;
    return this;
  }

  withSignature(signature: string): SnapshotManifestBuilder {
    this.manifest.signature = signature;
    return this;
  }

  build(): SnapshotManifest {
    if (!this.manifest.id || !this.manifest.dataHash || !this.manifest.metadata) {
      throw new Error('Manifest missing required fields: id, dataHash, and metadata');
    }

    return {
      timestamp: new Date(),
      version: this.manifest.version || '1.0',
      ...this.manifest
    } as SnapshotManifest;
  }
}

export class SnapshotManifestValidator {
  static validate(manifest: SnapshotManifest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!manifest.id) errors.push('Missing required field: id');
    if (!manifest.dataHash) errors.push('Missing required field: dataHash');
    if (!manifest.metadata) errors.push('Missing required field: metadata');
    if (!manifest.originalSize || manifest.originalSize < 0) errors.push('Invalid originalSize');
    
    if (manifest.compressedSize !== undefined && manifest.compressedSize < 0) {
      errors.push('Invalid compressedSize');
    }
    
    if (manifest.compressionRatio !== undefined && (manifest.compressionRatio < 0 || manifest.compressionRatio > 100)) {
      errors.push('Invalid compressionRatio (must be 0-100)');
    }

    // Validate differential snapshot requirements
    if (manifest.metadata.type === 'differential' && !manifest.metadata.baseSnapshotId) {
      errors.push('Differential snapshots must specify baseSnapshotId');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}