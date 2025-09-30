/**
 * Handler Classification System
 * TODO: handler-classification - Implement automatic discovery and routing
 */

import { CriticalHandlerMetadata, getCriticalHandlerMetadata, isCriticalHandler } from './criticalHandlerAttribute';

export enum HandlerPriority {
  Critical = 'critical',
  High = 'high',
  Normal = 'normal',
  Low = 'low',
  Background = 'background'
}

export interface HandlerClassification {
  priority: HandlerPriority;
  isCritical: boolean;
  timeoutMs: number;
  retryCount: number;
  isolateFailures: boolean;
  metadata?: CriticalHandlerMetadata;
}

export class HandlerClassificationService {
  private static instance: HandlerClassificationService;

  public static getInstance(): HandlerClassificationService {
    if (!HandlerClassificationService.instance) {
      HandlerClassificationService.instance = new HandlerClassificationService();
    }
    return HandlerClassificationService.instance;
  }

  classifyHandler(handler: any): HandlerClassification {
    const isCritical = isCriticalHandler(handler);
    const metadata = getCriticalHandlerMetadata(handler);
    
    if (isCritical && metadata) {
      return {
        priority: this.determinePriority(metadata.priority),
        isCritical: true,
        timeoutMs: metadata.timeoutMs || 10000,
        retryCount: metadata.retryCount || 3,
        isolateFailures: metadata.isolateFailures || true,
        metadata
      };
    }
    
    // Default classification for non-critical handlers
    return {
      priority: HandlerPriority.Normal,
      isCritical: false,
      timeoutMs: 30000,
      retryCount: 1,
      isolateFailures: false
    };
  }

  sortHandlersByPriority<T>(handlers: T[]): T[] {
    return handlers.sort((a, b) => {
      const classA = this.classifyHandler(a);
      const classB = this.classifyHandler(b);
      
      // Critical handlers first
      if (classA.isCritical && !classB.isCritical) return -1;
      if (!classA.isCritical && classB.isCritical) return 1;
      
      // Then by priority value (higher number = higher priority)
      const priorityA = classA.metadata?.priority || this.getPriorityValue(classA.priority);
      const priorityB = classB.metadata?.priority || this.getPriorityValue(classB.priority);
      
      return priorityB - priorityA;
    });
  }

  getCriticalHandlers<T>(handlers: T[]): T[] {
    return handlers.filter(handler => this.classifyHandler(handler).isCritical);
  }

  getNormalHandlers<T>(handlers: T[]): T[] {
    return handlers.filter(handler => !this.classifyHandler(handler).isCritical);
  }

  private determinePriority(priorityValue: number): HandlerPriority {
    if (priorityValue >= 200) return HandlerPriority.Critical;
    if (priorityValue >= 150) return HandlerPriority.High;
    if (priorityValue >= 100) return HandlerPriority.Normal;
    if (priorityValue >= 50) return HandlerPriority.Low;
    return HandlerPriority.Background;
  }

  private getPriorityValue(priority: HandlerPriority): number {
    switch (priority) {
      case HandlerPriority.Critical: return 200;
      case HandlerPriority.High: return 150;
      case HandlerPriority.Normal: return 100;
      case HandlerPriority.Low: return 50;
      case HandlerPriority.Background: return 10;
      default: return 100;
    }
  }
}