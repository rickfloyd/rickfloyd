/**
 * Phase 2 Infrastructure Exports
 * Main entry point for Phase 2 observability, resilience, and performance features
 */

// Observability
export * from './infrastructure/observability/metrics/eventingMetrics';
export * from './infrastructure/observability/metrics/snapshotMetrics';
export * from './infrastructure/observability/tracing/tracingSources';
export * from './infrastructure/observability/tracing/tracingTags';
export * from './infrastructure/observabilityRegistry';

// Messaging & Resilience
export * from './infrastructure/messaging/policies/resiliencePolicyOptions';
export * from './infrastructure/messaging/policies/resiliencePolicyFactory';
export * from './infrastructure/messaging/deadLetter/IDeadLetterQueue';
export * from './infrastructure/messaging/deadLetter/inMemoryDeadLetterQueue';
export * from './infrastructure/messaging/parallel/parallelEventDispatcher';
export * from './infrastructure/messaging/parallel/parallelExecutionOptions';
export * from './infrastructure/messaging/classification/criticalHandlerAttribute';
export * from './infrastructure/messaging/classification/handlerClassification';
export * from './infrastructure/messaging/diagnostics/eventingLogMessages';

// Persistence & Snapshots
export * from './infrastructure/persistence/snapshotting/compression/ICompressionStrategy';
export * from './infrastructure/persistence/snapshotting/compression/gzipCompressionStrategy';
export * from './infrastructure/persistence/snapshotting/integrity/IHashingService';
export * from './infrastructure/persistence/snapshotting/integrity/sha256HashingService';
export * from './infrastructure/persistence/snapshotting/integrity/snapshotManifest';
export * from './infrastructure/persistence/snapshotting/differential/IDifferentialSnapshotService';
export * from './infrastructure/persistence/snapshotting/differential/differentialSnapshotService';
export * from './infrastructure/persistence/snapshotting/model/ledgerSnapshotRecord';

// Configuration & Validation
export * from './infrastructure/configuration/validation/eventDispatcherOptionsValidator';
export type { 
  LedgerSnapshotOptions,
  ValidationResult as LedgerValidationResult 
} from './infrastructure/configuration/validation/ledgerSnapshotOptionsValidator';
export { LedgerSnapshotOptionsValidator } from './infrastructure/configuration/validation/ledgerSnapshotOptionsValidator';

// CLI Commands
export * from './application/cli/events/eventsStatsCommand';
export * from './application/cli/snapshot/verifySnapshotCommand';

// Benchmarks & Testing
export * from './tooling/benchmarks/dispatcherBenchmarks';