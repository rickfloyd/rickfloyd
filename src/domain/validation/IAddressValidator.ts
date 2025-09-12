import { SupportedAsset } from '../assets';

/**
 * Result of address validation
 */
export interface AddressValidationResult {
  readonly isValid: boolean;
  readonly asset: SupportedAsset;
  readonly address: string;
  readonly errorMessage?: string;
  readonly addressType?: string; // e.g., "P2PKH", "P2SH", "bech32"
  readonly network?: string; // e.g., "mainnet", "testnet"
}

/**
 * Interface for validating cryptocurrency addresses
 */
export interface IAddressValidator {
  /**
   * Asset this validator supports
   */
  readonly supportedAsset: SupportedAsset;
  
  /**
   * Validate a cryptocurrency address
   */
  validateAddress(address: string): Promise<AddressValidationResult>;
  
  /**
   * Check if the validator can handle the given asset
   */
  canValidate(asset: SupportedAsset): boolean;
}

/**
 * Registry for managing multiple address validators
 */
export interface IAddressValidatorRegistry {
  /**
   * Register a validator for an asset
   */
  registerValidator(validator: IAddressValidator): void;
  
  /**
   * Get validator for a specific asset
   */
  getValidator(asset: SupportedAsset): IAddressValidator | null;
  
  /**
   * Validate an address using the appropriate validator
   */
  validateAddress(asset: SupportedAsset, address: string): Promise<AddressValidationResult>;
  
  /**
   * Get all supported assets
   */
  getSupportedAssets(): SupportedAsset[];
  
  /**
   * Check if an asset is supported
   */
  isAssetSupported(asset: SupportedAsset): boolean;
}