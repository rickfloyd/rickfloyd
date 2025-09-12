import { SupportedAsset } from '../assets';

/**
 * Represents a balance for a specific address on a blockchain
 */
export interface ChainBalance {
  readonly asset: SupportedAsset;
  readonly address: string;
  readonly confirmed: string; // Confirmed balance in base units
  readonly unconfirmed: string; // Unconfirmed balance in base units
  readonly total: string; // Total balance (confirmed + unconfirmed)
  readonly blockHeight: number;
  readonly retrievedAt: Date;
}

/**
 * Output for a transaction
 */
export interface TransactionOutput {
  readonly address: string;
  readonly amount: string; // Amount in base units
  readonly asset: SupportedAsset;
}

/**
 * Request for building a payout transaction
 */
export interface PayoutBuildRequest {
  readonly fromAddress: string;
  readonly outputs: TransactionOutput[];
  readonly feeRate?: string; // Fee rate (e.g., satoshis per byte)
  readonly priority?: 'low' | 'medium' | 'high';
  readonly rbfEnabled?: boolean; // Replace-by-fee enabled
}

/**
 * Built transaction ready for signing and broadcasting
 */
export interface BuiltTransaction {
  readonly asset: SupportedAsset;
  readonly rawTransaction: string; // Raw transaction hex/bytes
  readonly transactionId: string;
  readonly size: number; // Transaction size in bytes
  readonly fee: string; // Transaction fee in base units
  readonly outputs: TransactionOutput[];
  readonly builtAt: Date;
}

/**
 * Result of broadcasting a transaction
 */
export interface BroadcastResult {
  readonly success: boolean;
  readonly transactionHash?: string;
  readonly error?: string;
  readonly broadcastAt: Date;
}

/**
 * Transaction status information
 */
export interface TransactionStatus {
  readonly transactionHash: string;
  readonly confirmations: number;
  readonly isConfirmed: boolean;
  readonly blockHeight?: number;
  readonly blockHash?: string;
  readonly fee?: string;
  readonly status: 'pending' | 'confirmed' | 'failed' | 'rejected';
  readonly checkedAt: Date;
}

/**
 * Interface for interacting with blockchain networks
 */
export interface IChainClient {
  /**
   * Asset this client supports
   */
  readonly supportedAsset: SupportedAsset;
  
  /**
   * Get balance for an address
   */
  getBalance(address: string): Promise<ChainBalance>;
  
  /**
   * Build a transaction for multiple outputs
   */
  buildTransaction(request: PayoutBuildRequest): Promise<BuiltTransaction>;
  
  /**
   * Sign a built transaction (requires wallet integration)
   */
  signTransaction(transaction: BuiltTransaction, privateKey?: string): Promise<BuiltTransaction>;
  
  /**
   * Broadcast a signed transaction to the network
   */
  broadcastTransaction(signedTransaction: BuiltTransaction): Promise<BroadcastResult>;
  
  /**
   * Get transaction status by hash
   */
  getTransactionStatus(transactionHash: string): Promise<TransactionStatus>;
  
  /**
   * Get current network fee estimate
   */
  estimateFee(priority?: 'low' | 'medium' | 'high'): Promise<string>;
  
  /**
   * Check if the client is connected to the network
   */
  isConnected(): Promise<boolean>;
  
  /**
   * Get current block height
   */
  getCurrentBlockHeight(): Promise<number>;
}