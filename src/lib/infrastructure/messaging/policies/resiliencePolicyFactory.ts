/**
 * Resilience Policy Factory
 * TODO: externalbus-retries-circuitbreaker - Implement actual retry and circuit breaker logic
 */

import { ResiliencePolicyOptions, DEFAULT_RESILIENCE_POLICY_OPTIONS } from './resiliencePolicyOptions';

export interface ResiliencePolicy<T> {
  execute<TResult>(operation: () => Promise<TResult>): Promise<TResult>;
  executeSync<TResult>(operation: () => TResult): TResult;
}

export class DefaultResiliencePolicy<T> implements ResiliencePolicy<T> {
  constructor(private options: ResiliencePolicyOptions) {}

  async execute<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    // TODO: externalbus-retries-circuitbreaker - Implement actual resilience logic
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= (this.options.retry?.maxAttempts || 1); attempt++) {
      try {
        console.debug(`[RESILIENCE] Attempt ${attempt}/${this.options.retry?.maxAttempts}`);
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.debug(`[RESILIENCE] Attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < (this.options.retry?.maxAttempts || 1)) {
          const delay = this.calculateDelay(attempt);
          console.debug(`[RESILIENCE] Retrying in ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  executeSync<TResult>(operation: () => TResult): TResult {
    // TODO: externalbus-retries-circuitbreaker - Implement sync resilience logic
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= (this.options.retry?.maxAttempts || 1); attempt++) {
      try {
        console.debug(`[RESILIENCE] Sync attempt ${attempt}/${this.options.retry?.maxAttempts}`);
        return operation();
      } catch (error) {
        lastError = error as Error;
        console.debug(`[RESILIENCE] Sync attempt ${attempt} failed:`, lastError.message);
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  private calculateDelay(attempt: number): number {
    const options = this.options.retry!;
    let delay = options.baseDelay * Math.pow(options.backoffMultiplier, attempt - 1);
    delay = Math.min(delay, options.maxDelay);
    
    if (options.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.floor(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class ResiliencePolicyFactory {
  static create<T>(options?: Partial<ResiliencePolicyOptions>): ResiliencePolicy<T> {
    const mergedOptions = { ...DEFAULT_RESILIENCE_POLICY_OPTIONS, ...options };
    return new DefaultResiliencePolicy<T>(mergedOptions);
  }

  static createRetryOnly<T>(maxAttempts: number, baseDelay: number = 1000): ResiliencePolicy<T> {
    return this.create<T>({
      retry: {
        maxAttempts,
        baseDelay,
        maxDelay: baseDelay * 10,
        backoffMultiplier: 2,
        jitter: true
      }
    });
  }

  static createCircuitBreakerOnly<T>(failureThreshold: number = 5): ResiliencePolicy<T> {
    return this.create<T>({
      circuitBreaker: {
        failureThreshold,
        successThreshold: Math.ceil(failureThreshold / 2),
        timeout: 60000,
        resetTimeout: 30000
      }
    });
  }
}