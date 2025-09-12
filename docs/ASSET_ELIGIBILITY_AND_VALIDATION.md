# Asset Eligibility and Validation

This document explains the asset eligibility scoring system and address validation approach used in the charity payout architecture.

## Asset Eligibility Scoring

The eligibility scoring system evaluates cryptocurrency assets across multiple criteria to determine their suitability for charity payouts.

### Scoring Criteria

1. **Liquidity Score (35% weight)**
   - Measures availability on major exchanges
   - Considers trading volume and market depth
   - Range: 0-100 (higher is better)

2. **Adoption Score (30% weight)**
   - Charity acceptance rate and ecosystem support
   - Number of charities actively accepting the asset
   - Range: 0-100 (higher is better)

3. **Network Stability Score (25% weight)**
   - Network uptime and reliability
   - Frequency of successful transactions
   - Historical network performance
   - Range: 0-100 (higher is better)

4. **Privacy Score (10% weight)**
   - Transaction privacy and fungibility
   - Relevant for charities in restrictive jurisdictions
   - Range: 0-100 (higher is better)

### Total Score Calculation

```
Total Score = (Liquidity × 0.35) + (Adoption × 0.30) + (Stability × 0.25) + (Privacy × 0.10)
```

Assets must achieve a minimum total score of 60 to be eligible for charity payouts.

### Current Asset Scores

| Asset | Liquidity | Adoption | Stability | Privacy | Total | Eligible |
|-------|-----------|----------|-----------|---------|-------|----------|
| BTC   | 100       | 90       | 95        | 30      | 81.25 | ✅       |
| LTC   | 85        | 70       | 90        | 35      | 74.25 | ✅       |
| DOGE  | 80        | 65       | 85        | 25      | 69.75 | ✅       |
| XMR   | 75        | 50       | 88        | 95      | 69.75 | ✅       |
| KAS   | 60        | 30       | 85        | 40      | 55.25 | ❌       |
| ERG   | 55        | 25       | 80        | 60      | 51.50 | ❌       |
| RVN   | 50        | 35       | 75        | 45      | 53.00 | ❌       |

*Note: Scores are updated regularly based on market conditions and ecosystem developments.*

## Address Validation

The validation system ensures that charity addresses are correctly formatted and valid for their respective blockchain networks.

### Validation Levels

1. **Format Validation**
   - Checks address format and prefix requirements
   - Validates character sets and length constraints
   - Basic checksum validation where applicable

2. **Network Validation**
   - Ensures address belongs to mainnet (not testnet)
   - Validates network-specific encoding schemes

3. **Enhanced Validation** (Future)
   - Full checksum validation using cryptocurrency libraries
   - RPC-based validation for supported networks
   - Address reachability checks

### Supported Address Formats

#### Bitcoin (BTC)
- **P2PKH**: `1[a-km-zA-HJ-NP-Z1-9]{25,34}` (Legacy)
- **P2SH**: `3[a-km-zA-HJ-NP-Z1-9]{25,34}` (Script Hash)
- **Bech32**: `bc1[a-z0-9]{39,59}` (Native SegWit)

#### Litecoin (LTC)
- **P2PKH**: `L[a-km-zA-HJ-NP-Z1-9]{25,34}` (Legacy)
- **P2SH**: `M[a-km-zA-HJ-NP-Z1-9]{25,34}` (Script Hash)
- **Bech32**: `ltc1[a-z0-9]{39,59}` (Native SegWit)

#### Dogecoin (DOGE)
- **P2PKH**: `D[1-9A-HJ-NP-Za-km-z]{25,34}` (Legacy)
- **P2SH**: `A[1-9A-HJ-NP-Za-km-z]{25,34}` (Script Hash)

#### Monero (XMR)
- **Standard**: `4[0-9A-Za-z]{94}` (95 characters total)
- **Subaddress**: `8[0-9A-Za-z]{94}` (95 characters total)

#### Kaspa (KAS)
- **Bech32m**: `kaspa:[a-z0-9]{61}` (Bech32m encoding)

#### Ergo (ERG)
- **P2PK**: `9[1-9A-HJ-NP-Za-km-z]{50,}` (Base58Check)

#### Ravencoin (RVN)
- **P2PKH**: `R[1-9A-HJ-NP-Za-km-z]{25,34}` (Legacy)

### Validation Implementation

The current implementation uses regex-based pattern matching for basic format validation. This provides:

- ✅ Fast validation suitable for real-time use
- ✅ No external dependencies or network calls
- ✅ Consistent validation across all supported assets
- ⚠️ Limited to format checking (no full checksum validation)

### Production Considerations

For production deployments, consider upgrading to full validation libraries:

1. **Bitcoin/Litecoin/Dogecoin**: Use Base58Check libraries for checksum validation
2. **Monero**: Integrate with Monero RPC `validate_address` method
3. **Kaspa**: Use Kaspa address validation libraries
4. **Ergo**: Integrate with Ergo SDK for full validation

### Error Handling

Invalid addresses are handled gracefully:

- Clear error messages indicating the validation failure reason
- Rejection of payouts to invalid addresses
- Logging of validation failures for monitoring
- Support for address correction workflows

### Security Considerations

- Always validate addresses before initiating payouts
- Implement rate limiting for validation requests
- Monitor for patterns indicating address generation attacks
- Maintain whitelist capabilities for high-value transactions
- Regular auditing of validation rules and implementations

## Configuration

Scoring weights and validation rules can be adjusted via configuration:

```typescript
const config: EligibilityConfig = {
  weights: {
    liquidity: 0.35,
    adoption: 0.30,
    networkStability: 0.25,
    privacy: 0.10
  },
  minimumScore: 60,
  requireAllCriteria: false
};
```

## Monitoring and Alerting

The system provides monitoring capabilities for:

- Asset eligibility score changes
- Address validation failure rates
- Network connectivity issues
- Performance metrics

Regular monitoring ensures the system remains secure and efficient as the cryptocurrency landscape evolves.