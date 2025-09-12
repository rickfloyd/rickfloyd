/**
 * Event Dispatcher Options Validator
 * TODO: config-validation - Implement comprehensive validation rules
 */

export interface EventDispatcherOptions {
  maxConcurrency: number;
  timeoutMs: number;
  enableParallelExecution: boolean;
  enableDeadLetterQueue: boolean;
  enableMetrics: boolean;
  enableTracing: boolean;
  retryOptions?: {
    maxAttempts: number;
    baseDelayMs: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class EventDispatcherOptionsValidator {
  private static instance: EventDispatcherOptionsValidator;

  public static getInstance(): EventDispatcherOptionsValidator {
    if (!EventDispatcherOptionsValidator.instance) {
      EventDispatcherOptionsValidator.instance = new EventDispatcherOptionsValidator();
    }
    return EventDispatcherOptionsValidator.instance;
  }

  validate(options: EventDispatcherOptions): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate concurrency
    if (options.maxConcurrency <= 0) {
      errors.push('maxConcurrency must be greater than 0');
    } else if (options.maxConcurrency > 100) {
      warnings.push('maxConcurrency > 100 may cause resource exhaustion');
    }

    // Validate timeout
    if (options.timeoutMs <= 0) {
      errors.push('timeoutMs must be greater than 0');
    } else if (options.timeoutMs < 1000) {
      warnings.push('timeoutMs < 1000ms may be too aggressive');
    } else if (options.timeoutMs > 300000) {
      warnings.push('timeoutMs > 5 minutes may cause blocking');
    }

    // Validate retry options
    if (options.retryOptions) {
      if (options.retryOptions.maxAttempts < 0) {
        errors.push('retryOptions.maxAttempts cannot be negative');
      } else if (options.retryOptions.maxAttempts > 10) {
        warnings.push('retryOptions.maxAttempts > 10 may cause excessive delays');
      }

      if (options.retryOptions.baseDelayMs <= 0) {
        errors.push('retryOptions.baseDelayMs must be greater than 0');
      }
    }

    // Validate feature dependencies
    if (options.enableParallelExecution && options.maxConcurrency === 1) {
      warnings.push('Parallel execution enabled but maxConcurrency is 1');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateAndThrow(options: EventDispatcherOptions): void {
    const result = this.validate(options);
    if (!result.isValid) {
      throw new Error(`EventDispatcher configuration is invalid: ${result.errors.join(', ')}`);
    }
    
    if (result.warnings.length > 0) {
      console.warn('[CONFIG] EventDispatcher warnings:', result.warnings);
    }
  }

  getDefaultOptions(): EventDispatcherOptions {
    return {
      maxConcurrency: 10,
      timeoutMs: 30000,
      enableParallelExecution: false,
      enableDeadLetterQueue: true,
      enableMetrics: true,
      enableTracing: false,
      retryOptions: {
        maxAttempts: 3,
        baseDelayMs: 1000
      }
    };
  }
}