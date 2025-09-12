import { 
  IAddressValidatorRegistry, 
  IAddressValidator, 
  AddressValidationResult 
} from '../../domain/validation';
import { SupportedAsset } from '../../domain/assets';

/**
 * Registry implementation for managing address validators
 */
export class AddressValidatorRegistry implements IAddressValidatorRegistry {
  private readonly validators = new Map<SupportedAsset, IAddressValidator>();

  registerValidator(validator: IAddressValidator): void {
    this.validators.set(validator.supportedAsset, validator);
  }

  getValidator(asset: SupportedAsset): IAddressValidator | null {
    return this.validators.get(asset) || null;
  }

  async validateAddress(asset: SupportedAsset, address: string): Promise<AddressValidationResult> {
    const validator = this.getValidator(asset);
    
    if (!validator) {
      return {
        isValid: false,
        asset,
        address,
        errorMessage: `No validator available for asset: ${asset}`
      };
    }
    
    return await validator.validateAddress(address);
  }

  getSupportedAssets(): SupportedAsset[] {
    return Array.from(this.validators.keys());
  }

  isAssetSupported(asset: SupportedAsset): boolean {
    return this.validators.has(asset);
  }
}