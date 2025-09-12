/**
 * Differential Snapshot Service Interface
 * TODO: differential-snapshots - Implement actual differential algorithms
 */

export interface DifferentialSnapshotOptions {
  compressionEnabled: boolean;
  maxDeltaSize: number; // bytes
  retainBaseSnapshots: boolean;
  maxChainLength: number;
}

export interface SnapshotDelta {
  baseSnapshotId: string;
  deltaId: string;
  operations: DeltaOperation[];
  metadata: {
    timestamp: Date;
    size: number;
    operationCount: number;
  };
}

export interface DeltaOperation {
  type: 'insert' | 'update' | 'delete';
  entityId: string;
  entityType: string;
  oldValue?: any;
  newValue?: any;
  position?: number;
}

export interface IDifferentialSnapshotService {
  createDifferentialSnapshot(baseSnapshotId: string, currentData: any): Promise<SnapshotDelta>;
  applyDifferentialSnapshot(baseData: any, delta: SnapshotDelta): Promise<any>;
  validateDifferentialChain(deltas: SnapshotDelta[]): Promise<boolean>;
  optimizeChain(deltas: SnapshotDelta[]): Promise<SnapshotDelta[]>;
  getChainLength(snapshotId: string): Promise<number>;
}