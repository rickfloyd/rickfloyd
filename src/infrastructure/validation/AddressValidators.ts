import { IAddressValidator, AddressValidationResult } from '../../domain/validation';
import { SupportedAsset } from '../../domain/assets';

/**
 * Base class for address validators with common functionality
 */
abstract class BaseAddressValidator implements IAddressValidator {
  abstract readonly supportedAsset: SupportedAsset;

  async validateAddress(address: string): Promise<AddressValidationResult> {
    if (!address || typeof address !== 'string') {
      return this.createErrorResult(address, 'Address must be a non-empty string');
    }

    address = address.trim();
    if (address.length === 0) {
      return this.createErrorResult(address, 'Address cannot be empty');
    }

    return this.performValidation(address);
  }

  canValidate(asset: SupportedAsset): boolean {
    return asset === this.supportedAsset;
  }

  protected abstract performValidation(address: string): Promise<AddressValidationResult>;

  protected createSuccessResult(
    address: string, 
    addressType?: string, 
    network?: string
  ): AddressValidationResult {
    return {
      isValid: true,
      asset: this.supportedAsset,
      address,
      addressType,
      network
    };
  }

  protected createErrorResult(address: string, errorMessage: string): AddressValidationResult {
    return {
      isValid: false,
      asset: this.supportedAsset,
      address,
      errorMessage
    };
  }
}

/**
 * Monero address validator using basic format checking
 * Production implementation should use Monero RPC validate_address
 */
export class MoneroAddressValidator extends BaseAddressValidator {
  readonly supportedAsset = SupportedAsset.XMR;

  protected async performValidation(address: string): Promise<AddressValidationResult> {
    // Monero addresses start with '4' (standard) or '8' (subaddress/integrated)
    if (!address.match(/^[48][0-9A-Za-z]{94,}$/)) {
      return this.createErrorResult(address, 'Invalid Monero address format');
    }

    // Basic length check - Monero addresses are typically 95 characters
    if (address.length !== 95) {
      return this.createErrorResult(
        address, 
        `Invalid Monero address length: expected 95, got ${address.length}`
      );
    }

    const addressType = address.startsWith('4') ? 'standard' : 'subaddress/integrated';
    return this.createSuccessResult(address, addressType, 'mainnet');
  }
}

/**
 * Kaspa address validator
 */
export class KaspaAddressValidator extends BaseAddressValidator {
  readonly supportedAsset = SupportedAsset.KAS;

  protected async performValidation(address: string): Promise<AddressValidationResult> {
    // Kaspa addresses start with 'kaspa:'
    if (!address.startsWith('kaspa:')) {
      return this.createErrorResult(address, 'Kaspa address must start with "kaspa:"');
    }

    const addressPart = address.substring(6); // Remove 'kaspa:' prefix
    
    // Basic format validation - should be base32-like encoding
    if (!addressPart.match(/^[a-z0-9]{61}$/)) {
      return this.createErrorResult(address, 'Invalid Kaspa address format');
    }

    return this.createSuccessResult(address, 'bech32m', 'mainnet');
  }
}

/**
 * Ergo address validator
 */
export class ErgoAddressValidator extends BaseAddressValidator {
  readonly supportedAsset = SupportedAsset.ERG;

  protected async performValidation(address: string): Promise<AddressValidationResult> {
    // Ergo addresses start with '9' for mainnet
    if (!address.startsWith('9')) {
      return this.createErrorResult(address, 'Ergo mainnet address must start with "9"');
    }

    // Basic format validation
    if (!address.match(/^9[1-9A-HJ-NP-Za-km-z]{50,}$/)) {
      return this.createErrorResult(address, 'Invalid Ergo address format');
    }

    return this.createSuccessResult(address, 'P2PK', 'mainnet');
  }
}

/**
 * Litecoin address validator
 */
export class LitecoinAddressValidator extends BaseAddressValidator {
  readonly supportedAsset = SupportedAsset.LTC;

  protected async performValidation(address: string): Promise<AddressValidationResult> {
    let addressType = 'unknown';
    let network = 'mainnet';

    // Legacy addresses (P2PKH)
    if (address.match(/^[LM][a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
      addressType = address.startsWith('L') ? 'P2PKH' : 'P2SH';
    }
    // Bech32 addresses (native SegWit)
    else if (address.match(/^ltc1[a-z0-9]{39,59}$/)) {
      addressType = 'bech32';
    }
    else {
      return this.createErrorResult(address, 'Invalid Litecoin address format');
    }

    return this.createSuccessResult(address, addressType, network);
  }
}

/**
 * Dogecoin address validator
 */
export class DogecoinAddressValidator extends BaseAddressValidator {
  readonly supportedAsset = SupportedAsset.DOGE;

  protected async performValidation(address: string): Promise<AddressValidationResult> {
    // Dogecoin addresses start with 'D' (P2PKH) or 'A' (P2SH) for mainnet
    if (!address.match(/^[DA][1-9A-HJ-NP-Za-km-z]{25,34}$/)) {
      return this.createErrorResult(address, 'Invalid Dogecoin address format');
    }

    const addressType = address.startsWith('D') ? 'P2PKH' : 'P2SH';
    return this.createSuccessResult(address, addressType, 'mainnet');
  }
}

/**
 * Bitcoin address validator
 */
export class BitcoinAddressValidator extends BaseAddressValidator {
  readonly supportedAsset = SupportedAsset.BTC;

  protected async performValidation(address: string): Promise<AddressValidationResult> {
    let addressType = 'unknown';
    let network = 'mainnet';

    // Legacy addresses (P2PKH)
    if (address.match(/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
      addressType = 'P2PKH';
    }
    // P2SH addresses
    else if (address.match(/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
      addressType = 'P2SH';
    }
    // Bech32 addresses (native SegWit)
    else if (address.match(/^bc1[a-z0-9]{39,59}$/)) {
      addressType = 'bech32';
    }
    else {
      return this.createErrorResult(address, 'Invalid Bitcoin address format');
    }

    return this.createSuccessResult(address, addressType, network);
  }
}

/**
 * Ravencoin address validator
 */
export class RavencoinAddressValidator extends BaseAddressValidator {
  readonly supportedAsset = SupportedAsset.RVN;

  protected async performValidation(address: string): Promise<AddressValidationResult> {
    // Ravencoin addresses start with 'R' for mainnet
    if (!address.match(/^R[1-9A-HJ-NP-Za-km-z]{25,34}$/)) {
      return this.createErrorResult(address, 'Invalid Ravencoin address format');
    }

    return this.createSuccessResult(address, 'P2PKH', 'mainnet');
  }
}