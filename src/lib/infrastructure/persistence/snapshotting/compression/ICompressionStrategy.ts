/**
 * Compression Strategy Interface
 * TODO: snapshot-compression-hashing - Implement actual compression algorithms
 */

export interface CompressionStrategy {
  compress(data: Buffer): Promise<Buffer>;
  decompress(compressedData: Buffer): Promise<Buffer>;
  getCompressionRatio(originalSize: number, compressedSize: number): number;
  readonly algorithmName: string;
}

export interface CompressionOptions {
  level?: number; // 1-9, where 9 is maximum compression
  windowBits?: number;
  memLevel?: number;
  strategy?: 'default' | 'filtered' | 'huffman' | 'rle' | 'fixed';
}

export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  level: 6,
  windowBits: 15,
  memLevel: 8,
  strategy: 'default'
};