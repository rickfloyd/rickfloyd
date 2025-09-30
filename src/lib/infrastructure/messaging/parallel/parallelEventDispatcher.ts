/**
 * Parallel Event Dispatcher
 * TODO: parallel-dispatcher - Implement actual parallel execution with configurable concurrency
 */

import { ParallelExecutionOptions, DEFAULT_PARALLEL_EXECUTION_OPTIONS } from './parallelExecutionOptions';

export interface Event {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  version?: string;
}

export interface EventHandler<T = any> {
  handle(event: Event): Promise<T>;
  canHandle?(event: Event): boolean;
}

export interface ParallelDispatchResult {
  successful: number;
  failed: number;
  totalTime: number;
  results: Array<{
    handlerName: string;
    success: boolean;
    result?: any;
    error?: string;
    duration: number;
  }>;
}

export class ParallelEventDispatcher {
  private handlers: Map<string, EventHandler[]> = new Map();
  
  constructor(private options: ParallelExecutionOptions = DEFAULT_PARALLEL_EXECUTION_OPTIONS) {}

  registerHandler(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    console.debug(`[PARALLEL_DISPATCHER] Handler registered for event type: ${eventType}`);
  }

  async dispatch(event: Event): Promise<ParallelDispatchResult> {
    // TODO: parallel-dispatcher - Implement actual parallel execution
    const startTime = Date.now();
    const handlers = this.handlers.get(event.type) || [];
    
    console.debug(`[PARALLEL_DISPATCHER] Dispatching event ${event.id} to ${handlers.length} handlers`);
    
    if (handlers.length === 0) {
      return {
        successful: 0,
        failed: 0,
        totalTime: Date.now() - startTime,
        results: []
      };
    }

    // TODO: parallel-dispatcher - Replace with actual parallel execution using worker pools
    const results = await this.executeHandlersSequentially(event, handlers);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    return {
      successful,
      failed,
      totalTime: Date.now() - startTime,
      results
    };
  }

  private async executeHandlersSequentially(event: Event, handlers: EventHandler[]): Promise<Array<{
    handlerName: string;
    success: boolean;
    result?: any;
    error?: string;
    duration: number;
  }>> {
    const results = [];
    
    for (const handler of handlers) {
      const handlerStart = Date.now();
      const handlerName = handler.constructor.name;
      
      try {
        if (handler.canHandle && !handler.canHandle(event)) {
          console.debug(`[PARALLEL_DISPATCHER] Handler ${handlerName} cannot handle event ${event.id}`);
          continue;
        }
        
        const result = await handler.handle(event);
        const duration = Date.now() - handlerStart;
        
        results.push({
          handlerName,
          success: true,
          result,
          duration
        });
        
        console.debug(`[PARALLEL_DISPATCHER] Handler ${handlerName} completed successfully in ${duration}ms`);
      } catch (error) {
        const duration = Date.now() - handlerStart;
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        results.push({
          handlerName,
          success: false,
          error: errorMessage,
          duration
        });
        
        console.debug(`[PARALLEL_DISPATCHER] Handler ${handlerName} failed in ${duration}ms:`, errorMessage);
      }
    }
    
    return results;
  }

  getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.length || 0;
  }

  getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}