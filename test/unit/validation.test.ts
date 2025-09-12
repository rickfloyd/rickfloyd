import {
  MoneroAddressValidator,
  KaspaAddressValidator,
  ErgoAddressValidator,
  LitecoinAddressValidator,
  DogecoinAddressValidator,
  BitcoinAddressValidator,
  RavencoinAddressValidator,
  AddressValidatorRegistry
} from '../../src/infrastructure/validation/AddressValidators';
import { AddressValidatorRegistry as Registry } from '../../src/infrastructure/validation/AddressValidatorRegistry';
import { SupportedAsset } from '../../src/domain/assets/SupportedAsset';

describe('Address Validation', () => {
  describe('MoneroAddressValidator', () => {
    let validator: MoneroAddressValidator;

    beforeEach(() => {
      validator = new MoneroAddressValidator();
    });

    it('should validate correct Monero standard address', async () => {
      const validAddress = '4' + 'A'.repeat(94); // Mock valid format
      const result = await validator.validateAddress(validAddress);
      
      expect(result.isValid).toBe(true);
      expect(result.asset).toBe(SupportedAsset.XMR);
      expect(result.addressType).toBe('standard');
    });

    it('should validate correct Monero subaddress', async () => {
      const validAddress = '8' + 'A'.repeat(94); // Mock valid format
      const result = await validator.validateAddress(validAddress);
      
      expect(result.isValid).toBe(true);
      expect(result.addressType).toBe('subaddress/integrated');
    });

    it('should reject invalid Monero address format', async () => {
      const invalidAddress = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'; // Bitcoin address
      const result = await validator.validateAddress(invalidAddress);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Invalid Monero address format');
    });

    it('should reject address with incorrect length', async () => {
      const shortAddress = '4' + 'A'.repeat(50);
      const result = await validator.validateAddress(shortAddress);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Invalid Monero address format');
    });
  });

  describe('BitcoinAddressValidator', () => {
    let validator: BitcoinAddressValidator;

    beforeEach(() => {
      validator = new BitcoinAddressValidator();
    });

    it('should validate P2PKH address', async () => {
      const validAddress = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';
      const result = await validator.validateAddress(validAddress);
      
      expect(result.isValid).toBe(true);
      expect(result.addressType).toBe('P2PKH');
    });

    it('should validate P2SH address', async () => {
      const validAddress = '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy';
      const result = await validator.validateAddress(validAddress);
      
      expect(result.isValid).toBe(true);
      expect(result.addressType).toBe('P2SH');
    });

    it('should validate bech32 address', async () => {
      const validAddress = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
      const result = await validator.validateAddress(validAddress);
      
      expect(result.isValid).toBe(true);
      expect(result.addressType).toBe('bech32');
    });

    it('should reject invalid format', async () => {
      const invalidAddress = 'invalid_address';
      const result = await validator.validateAddress(invalidAddress);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Invalid Bitcoin address format');
    });
  });

  describe('AddressValidatorRegistry', () => {
    let registry: Registry;

    beforeEach(() => {
      registry = new Registry();
      registry.registerValidator(new BitcoinAddressValidator());
      registry.registerValidator(new MoneroAddressValidator());
    });

    it('should register validators correctly', () => {
      expect(registry.isAssetSupported(SupportedAsset.BTC)).toBe(true);
      expect(registry.isAssetSupported(SupportedAsset.XMR)).toBe(true);
      expect(registry.isAssetSupported(SupportedAsset.LTC)).toBe(false);
    });

    it('should return correct validator for asset', () => {
      const btcValidator = registry.getValidator(SupportedAsset.BTC);
      expect(btcValidator).toBeInstanceOf(BitcoinAddressValidator);
    });

    it('should validate address using correct validator', async () => {
      const result = await registry.validateAddress(
        SupportedAsset.BTC, 
        '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'
      );
      
      expect(result.isValid).toBe(true);
      expect(result.asset).toBe(SupportedAsset.BTC);
    });

    it('should handle unsupported asset', async () => {
      const result = await registry.validateAddress(
        SupportedAsset.LTC, 
        'LTC_address'
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('No validator available');
    });
  });

  // TODO: Add tests for other validators
  describe.skip('KaspaAddressValidator', () => {
    // Test implementation placeholder
  });

  describe.skip('ErgoAddressValidator', () => {
    // Test implementation placeholder
  });

  describe.skip('LitecoinAddressValidator', () => {
    // Test implementation placeholder
  });

  describe.skip('DogecoinAddressValidator', () => {
    // Test implementation placeholder
  });

  describe.skip('RavencoinAddressValidator', () => {
    // Test implementation placeholder
  });
});