/**
 * Standard Tracing Tags
 * TODO: tracing-observability - Expand with domain-specific tags
 */

export const TRACING_TAGS = {
  // Event-related tags
  EVENT_TYPE: 'event.type',
  EVENT_ID: 'event.id',
  EVENT_VERSION: 'event.version',
  
  // Handler-related tags
  HANDLER_TYPE: 'handler.type',
  HANDLER_CRITICAL: 'handler.critical',
  HANDLER_PARALLEL: 'handler.parallel',
  
  // Snapshot-related tags
  SNAPSHOT_TYPE: 'snapshot.type',
  SNAPSHOT_SIZE: 'snapshot.size',
  SNAPSHOT_COMPRESSED: 'snapshot.compressed',
  SNAPSHOT_HASH: 'snapshot.hash',
  
  // Performance tags
  OPERATION_DURATION: 'operation.duration',
  OPERATION_SUCCESS: 'operation.success',
  OPERATION_ERROR: 'operation.error',
  
  // Infrastructure tags
  QUEUE_NAME: 'queue.name',
  DEAD_LETTER: 'deadletter.reason',
  RETRY_ATTEMPT: 'retry.attempt',
  CIRCUIT_BREAKER_STATE: 'circuitbreaker.state'
} as const;

export type TracingTag = typeof TRACING_TAGS[keyof typeof TRACING_TAGS];

export interface TaggedSpan {
  setTag(key: TracingTag | string, value: string | number | boolean): TaggedSpan;
  setTags(tags: Record<string, string | number | boolean>): TaggedSpan;
  finish(error?: Error): void;
}

export class DefaultTaggedSpan implements TaggedSpan {
  private tags: Record<string, string | number | boolean> = {};
  
  constructor(private spanName: string) {}

  setTag(key: TracingTag | string, value: string | number | boolean): TaggedSpan {
    this.tags[key] = value;
    // TODO: tracing-observability - Set actual span tag
    console.debug(`[TRACE] Tag set: ${key}=${value} on span ${this.spanName}`);
    return this;
  }

  setTags(tags: Record<string, string | number | boolean>): TaggedSpan {
    Object.entries(tags).forEach(([key, value]) => {
      this.setTag(key, value);
    });
    return this;
  }

  finish(error?: Error): void {
    if (error) {
      this.setTag(TRACING_TAGS.OPERATION_SUCCESS, false);
      this.setTag(TRACING_TAGS.OPERATION_ERROR, error.message);
    } else {
      this.setTag(TRACING_TAGS.OPERATION_SUCCESS, true);
    }
    // TODO: tracing-observability - Finish actual span
    console.debug(`[TRACE] Span finished: ${this.spanName}, tags:`, this.tags);
  }
}