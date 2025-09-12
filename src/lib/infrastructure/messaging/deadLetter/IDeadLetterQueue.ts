/**
 * Dead Letter Queue Interface
 * TODO: deadletter-queue - Implement persistence and processing capabilities
 */

export interface DeadLetterMessage<T = any> {
  id: string;
  originalMessage: T;
  failureReason: string;
  failureCount: number;
  firstFailedAt: Date;
  lastFailedAt: Date;
  originalQueue?: string;
  metadata?: Record<string, any>;
}

export interface DeadLetterQueue<T = any> {
  enqueue(message: T, reason: string, originalQueue?: string): Promise<void>;
  dequeue(count?: number): Promise<DeadLetterMessage<T>[]>;
  peek(count?: number): Promise<DeadLetterMessage<T>[]>;
  requeue(messageId: string, targetQueue?: string): Promise<boolean>;
  remove(messageId: string): Promise<boolean>;
  getStats(): Promise<DeadLetterStats>;
}

export interface DeadLetterStats {
  totalMessages: number;
  oldestMessage?: Date;
  newestMessage?: Date;
  messagesByReason: Record<string, number>;
}