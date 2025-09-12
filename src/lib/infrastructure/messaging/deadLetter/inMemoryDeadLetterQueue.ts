/**
 * In-Memory Dead Letter Queue Implementation
 * TODO: deadletter-queue - Add persistence layer and retry mechanisms
 */

import { DeadLetterQueue, DeadLetterMessage, DeadLetterStats } from './IDeadLetterQueue';

export class InMemoryDeadLetterQueue<T = any> implements DeadLetterQueue<T> {
  private messages: Map<string, DeadLetterMessage<T>> = new Map();
  private static instance: InMemoryDeadLetterQueue;

  public static getInstance<T = any>(): InMemoryDeadLetterQueue<T> {
    if (!InMemoryDeadLetterQueue.instance) {
      InMemoryDeadLetterQueue.instance = new InMemoryDeadLetterQueue();
    }
    return InMemoryDeadLetterQueue.instance as InMemoryDeadLetterQueue<T>;
  }

  async enqueue(message: T, reason: string, originalQueue?: string): Promise<void> {
    const id = this.generateId();
    const now = new Date();
    
    const deadLetterMessage: DeadLetterMessage<T> = {
      id,
      originalMessage: message,
      failureReason: reason,
      failureCount: 1,
      firstFailedAt: now,
      lastFailedAt: now,
      originalQueue,
      metadata: {}
    };

    this.messages.set(id, deadLetterMessage);
    console.debug(`[DEAD_LETTER] Message enqueued: ${id}, reason: ${reason}`);
  }

  async dequeue(count: number = 1): Promise<DeadLetterMessage<T>[]> {
    // TODO: deadletter-queue - Implement proper FIFO ordering
    const messages = Array.from(this.messages.values())
      .sort((a, b) => a.firstFailedAt.getTime() - b.firstFailedAt.getTime())
      .slice(0, count);

    messages.forEach(msg => {
      this.messages.delete(msg.id);
      console.debug(`[DEAD_LETTER] Message dequeued: ${msg.id}`);
    });

    return messages;
  }

  async peek(count: number = 1): Promise<DeadLetterMessage<T>[]> {
    return Array.from(this.messages.values())
      .sort((a, b) => a.firstFailedAt.getTime() - b.firstFailedAt.getTime())
      .slice(0, count);
  }

  async requeue(messageId: string, targetQueue?: string): Promise<boolean> {
    const message = this.messages.get(messageId);
    if (!message) {
      return false;
    }

    // TODO: deadletter-queue - Implement actual requeuing to target queue
    console.debug(`[DEAD_LETTER] Message requeued: ${messageId} to ${targetQueue || 'default'}`);
    this.messages.delete(messageId);
    return true;
  }

  async remove(messageId: string): Promise<boolean> {
    const existed = this.messages.has(messageId);
    this.messages.delete(messageId);
    
    if (existed) {
      console.debug(`[DEAD_LETTER] Message removed: ${messageId}`);
    }
    
    return existed;
  }

  async getStats(): Promise<DeadLetterStats> {
    const messages = Array.from(this.messages.values());
    const reasonCounts: Record<string, number> = {};

    messages.forEach(msg => {
      reasonCounts[msg.failureReason] = (reasonCounts[msg.failureReason] || 0) + 1;
    });

    const dates = messages.map(msg => msg.firstFailedAt);
    
    return {
      totalMessages: messages.length,
      oldestMessage: dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : undefined,
      newestMessage: dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : undefined,
      messagesByReason: reasonCounts
    };
  }

  private generateId(): string {
    return `dl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // For testing and debugging
  clear(): void {
    this.messages.clear();
    console.debug('[DEAD_LETTER] Queue cleared');
  }

  size(): number {
    return this.messages.size;
  }
}