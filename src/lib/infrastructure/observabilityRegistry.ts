/**
 * Central Observability Registration
 * TODO: observability-registration - Implement service registration for metrics and tracing
 */

import { DefaultEventingMetrics } from './observability/metrics/eventingMetrics';
import { DefaultSnapshotMetrics } from './observability/metrics/snapshotMetrics';
import { TracingManager } from './observability/tracing/tracingSources';
import { StructuredLogger } from './messaging/diagnostics/eventingLogMessages';

export interface ObservabilityOptions {
  enableMetrics: boolean;
  enableTracing: boolean;
  enableStructuredLogging: boolean;
  serviceName: string;
  serviceVersion: string;
}

export const DEFAULT_OBSERVABILITY_OPTIONS: ObservabilityOptions = {
  enableMetrics: true,
  enableTracing: false, // Disabled by default until OpenTelemetry integration
  enableStructuredLogging: true,
  serviceName: 'rickfloyd-eventing',
  serviceVersion: '2.0.0'
};

export class ObservabilityRegistry {
  private static instance: ObservabilityRegistry;
  private isInitialized = false;
  private options: ObservabilityOptions;

  private constructor(options: ObservabilityOptions = DEFAULT_OBSERVABILITY_OPTIONS) {
    this.options = options;
  }

  public static getInstance(options?: ObservabilityOptions): ObservabilityRegistry {
    if (!ObservabilityRegistry.instance) {
      ObservabilityRegistry.instance = new ObservabilityRegistry(options);
    }
    return ObservabilityRegistry.instance;
  }

  public async initialize(options?: Partial<ObservabilityOptions>): Promise<void> {
    if (this.isInitialized) {
      console.warn('[OBSERVABILITY] Registry already initialized');
      return;
    }

    if (options) {
      this.options = { ...this.options, ...options };
    }

    console.log('[OBSERVABILITY] Initializing observability registry with options:', this.options);

    // Initialize metrics
    if (this.options.enableMetrics) {
      await this.initializeMetrics();
    }

    // Initialize tracing
    if (this.options.enableTracing) {
      await this.initializeTracing();
    }

    // Initialize structured logging
    if (this.options.enableStructuredLogging) {
      await this.initializeLogging();
    }

    this.isInitialized = true;
    console.log('[OBSERVABILITY] Registry initialization complete');
  }

  public getEventingMetrics() {
    if (!this.options.enableMetrics) {
      throw new Error('Metrics not enabled in observability options');
    }
    return DefaultEventingMetrics.getInstance();
  }

  public getSnapshotMetrics() {
    if (!this.options.enableMetrics) {
      throw new Error('Metrics not enabled in observability options');
    }
    return DefaultSnapshotMetrics.getInstance();
  }

  public getTracingManager() {
    if (!this.options.enableTracing) {
      throw new Error('Tracing not enabled in observability options');
    }
    return TracingManager.getInstance();
  }

  public getStructuredLogger() {
    if (!this.options.enableStructuredLogging) {
      throw new Error('Structured logging not enabled in observability options');
    }
    return StructuredLogger.getInstance();
  }

  public isMetricsEnabled(): boolean {
    return this.options.enableMetrics && this.isInitialized;
  }

  public isTracingEnabled(): boolean {
    return this.options.enableTracing && this.isInitialized;
  }

  public isLoggingEnabled(): boolean {
    return this.options.enableStructuredLogging && this.isInitialized;
  }

  private async initializeMetrics(): Promise<void> {
    // TODO: observability-registration - Initialize OpenTelemetry metrics
    console.debug('[OBSERVABILITY] Initializing metrics collection');
    
    // Register meter for the service
    // In a real implementation, this would setup OpenTelemetry:
    // const meterProvider = new MeterProvider({
    //   resource: Resource.default().merge(
    //     new Resource({
    //       [SemanticResourceAttributes.SERVICE_NAME]: this.options.serviceName,
    //       [SemanticResourceAttributes.SERVICE_VERSION]: this.options.serviceVersion,
    //     })
    //   )
    // });
    
    console.debug('[OBSERVABILITY] Metrics collection initialized');
  }

  private async initializeTracing(): Promise<void> {
    // TODO: observability-registration - Initialize OpenTelemetry tracing
    console.debug('[OBSERVABILITY] Initializing distributed tracing');
    
    // Register tracer for the service
    // In a real implementation, this would setup OpenTelemetry:
    // const tracerProvider = new NodeTracerProvider({
    //   resource: Resource.default().merge(
    //     new Resource({
    //       [SemanticResourceAttributes.SERVICE_NAME]: this.options.serviceName,
    //       [SemanticResourceAttributes.SERVICE_VERSION]: this.options.serviceVersion,
    //     })
    //   )
    // });
    
    console.debug('[OBSERVABILITY] Distributed tracing initialized');
  }

  private async initializeLogging(): Promise<void> {
    // TODO: observability-registration - Setup structured logging configuration
    console.debug('[OBSERVABILITY] Initializing structured logging');
    
    // Configure structured logger
    // In a real implementation, this would setup Winston, Pino, or similar:
    // const logger = winston.createLogger({
    //   level: 'info',
    //   format: winston.format.combine(
    //     winston.format.timestamp(),
    //     winston.format.errors({ stack: true }),
    //     winston.format.json()
    //   ),
    //   defaultMeta: { 
    //     service: this.options.serviceName,
    //     version: this.options.serviceVersion
    //   }
    // });
    
    console.debug('[OBSERVABILITY] Structured logging initialized');
  }

  public async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    console.log('[OBSERVABILITY] Shutting down observability registry');

    // TODO: observability-registration - Implement graceful shutdown
    // - Flush pending metrics
    // - Complete active traces
    // - Close log outputs

    this.isInitialized = false;
    console.log('[OBSERVABILITY] Observability registry shutdown complete');
  }
}

// Convenience function for easy initialization
export async function initializeObservability(options?: Partial<ObservabilityOptions>): Promise<ObservabilityRegistry> {
  const registry = ObservabilityRegistry.getInstance();
  await registry.initialize(options);
  return registry;
}

// Export for dependency injection or service container registration
export const observabilityRegistry = ObservabilityRegistry.getInstance();