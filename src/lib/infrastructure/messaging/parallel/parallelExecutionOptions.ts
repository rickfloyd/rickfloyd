/**
 * Parallel Execution Options
 * TODO: parallel-dispatcher - Add more sophisticated scheduling options
 */

export interface ParallelExecutionOptions {
  maxConcurrency: number;
  timeoutMs: number;
  enableBatching: boolean;
  batchSize: number;
  batchTimeoutMs: number;
  retryFailedHandlers: boolean;
  isolateFailures: boolean;
}

export const DEFAULT_PARALLEL_EXECUTION_OPTIONS: ParallelExecutionOptions = {
  maxConcurrency: 10,
  timeoutMs: 30000,
  enableBatching: false,
  batchSize: 100,
  batchTimeoutMs: 5000,
  retryFailedHandlers: true,
  isolateFailures: true
};

export interface BatchExecutionOptions {
  maxBatchSize: number;
  batchTimeoutMs: number;
  flushOnShutdown: boolean;
}

export interface WorkerPoolOptions {
  minWorkers: number;
  maxWorkers: number;
  idleTimeoutMs: number;
  workerTimeoutMs: number;
}

export const DEFAULT_WORKER_POOL_OPTIONS: WorkerPoolOptions = {
  minWorkers: 2,
  maxWorkers: 10,
  idleTimeoutMs: 30000,
  workerTimeoutMs: 60000
};