/**
 * Eventing Metrics Collection
 * TODO: metrics-observability - Implement actual metrics emission using OpenTelemetry or similar
 */

export interface EventingMetrics {
  recordEventDispatched(eventType: string, handlerCount: number): void;
  recordEventProcessed(eventType: string, duration: number, success: boolean): void;
  recordEventFailed(eventType: string, error: string): void;
  recordDeadLetterQueued(eventType: string, reason: string): void;
}

export class DefaultEventingMetrics implements EventingMetrics {
  private static instance: DefaultEventingMetrics;

  public static getInstance(): DefaultEventingMetrics {
    if (!DefaultEventingMetrics.instance) {
      DefaultEventingMetrics.instance = new DefaultEventingMetrics();
    }
    return DefaultEventingMetrics.instance;
  }

  recordEventDispatched(eventType: string, handlerCount: number): void {
    // TODO: metrics-observability - Emit actual metric
    console.debug(`[METRICS] Event dispatched: ${eventType}, handlers: ${handlerCount}`);
  }

  recordEventProcessed(eventType: string, duration: number, success: boolean): void {
    // TODO: metrics-observability - Emit actual metric
    console.debug(`[METRICS] Event processed: ${eventType}, duration: ${duration}ms, success: ${success}`);
  }

  recordEventFailed(eventType: string, error: string): void {
    // TODO: metrics-observability - Emit actual metric
    console.debug(`[METRICS] Event failed: ${eventType}, error: ${error}`);
  }

  recordDeadLetterQueued(eventType: string, reason: string): void {
    // TODO: metrics-observability - Emit actual metric
    console.debug(`[METRICS] Dead letter queued: ${eventType}, reason: ${reason}`);
  }
}