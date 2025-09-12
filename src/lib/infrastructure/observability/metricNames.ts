/**
 * Centralized metric name definitions.
 * Prefix applied externally (ObservabilityRegistry.metricPrefix).
 */
export const MetricNames = {
  EventsPublishedTotal: 'events.published_total',
  EventsDispatchDurationMs: 'events.dispatch_duration_ms',
  EventsHandlerDurationMs: 'events.handler_duration_ms',
  EventsHandlerFailuresTotal: 'events.handler_failures_total',
  EventsExternalPublishFailuresTotal: 'events.external_publish_failures_total',
  DLQEnqueuedTotal: 'dlq.enqueued_total',
  DLQReplayedTotal: 'dlq.replayed_total',
  SnapshotCreateDurationMs: 'snapshot.create_duration_ms',
  SnapshotFilesPrunedTotal: 'snapshot.files_pruned_total',
  CircuitBreakerOpensTotal: 'circuit_breaker.opens_total'
} as const;

export type MetricName = typeof MetricNames[keyof typeof MetricNames];
