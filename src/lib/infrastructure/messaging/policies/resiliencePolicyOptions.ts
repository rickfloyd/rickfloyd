/**
 * Resilience Policy Options
 * TODO: externalbus-retries-circuitbreaker - Implement with actual resilience library
 */

export interface RetryPolicyOptions {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  jitter: boolean;
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  successThreshold: number;
  timeout: number; // milliseconds
  resetTimeout: number; // milliseconds
}

export interface ResiliencePolicyOptions {
  retry?: RetryPolicyOptions;
  circuitBreaker?: CircuitBreakerOptions;
  timeout?: number; // milliseconds
  bulkhead?: {
    maxConcurrency: number;
    maxQueueSize: number;
  };
}

export const DEFAULT_RESILIENCE_POLICY_OPTIONS: ResiliencePolicyOptions = {
  retry: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true
  },
  circuitBreaker: {
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 60000,
    resetTimeout: 30000
  },
  timeout: 30000,
  bulkhead: {
    maxConcurrency: 10,
    maxQueueSize: 100
  }
};