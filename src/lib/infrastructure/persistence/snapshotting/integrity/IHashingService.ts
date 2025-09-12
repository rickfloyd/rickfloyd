/**
 * Hashing Service Interface
 * TODO: snapshot-compression-hashing - Implement actual cryptographic hashing
 */

export interface HashingService {
  computeHash(data: Buffer): Promise<string>;
  verifyHash(data: Buffer, expectedHash: string): Promise<boolean>;
  readonly algorithmName: string;
}

export type HashAlgorithm = 'sha256' | 'sha512' | 'md5' | 'sha1';

export interface HashingOptions {
  algorithm: HashAlgorithm;
  encoding: 'hex' | 'base64';
}