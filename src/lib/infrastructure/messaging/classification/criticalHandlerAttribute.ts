/**
 * Critical Handler Attribute
 * TODO: handler-classification - Implement handler discovery and priority execution
 */

export const CRITICAL_HANDLER_SYMBOL = Symbol('CriticalHandler');

export interface CriticalHandlerMetadata {
  priority: number;
  timeoutMs?: number;
  retryCount?: number;
  isolateFailures?: boolean;
}

export function CriticalHandler(metadata?: Partial<CriticalHandlerMetadata>) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    const fullMetadata: CriticalHandlerMetadata = {
      priority: 100,
      timeoutMs: 10000,
      retryCount: 3,
      isolateFailures: true,
      ...metadata
    };
    
    // Attach metadata to the constructor
    (constructor as any)[CRITICAL_HANDLER_SYMBOL] = fullMetadata;
    
    console.debug(`[HANDLER_CLASSIFICATION] Critical handler registered: ${constructor.name}`, fullMetadata);
    
    return constructor;
  };
}

export function isCriticalHandler(handler: any): boolean {
  return handler && typeof handler === 'object' && 
         (handler.constructor[CRITICAL_HANDLER_SYMBOL] !== undefined ||
          handler[CRITICAL_HANDLER_SYMBOL] !== undefined);
}

export function getCriticalHandlerMetadata(handler: any): CriticalHandlerMetadata | undefined {
  if (!isCriticalHandler(handler)) {
    return undefined;
  }
  
  return handler.constructor[CRITICAL_HANDLER_SYMBOL] || handler[CRITICAL_HANDLER_SYMBOL];
}

// Example usage decorator
export const HighPriorityCritical = CriticalHandler({ priority: 200, timeoutMs: 5000 });
export const StandardCritical = CriticalHandler({ priority: 100 });
export const LowPriorityCritical = CriticalHandler({ priority: 50, retryCount: 5 });