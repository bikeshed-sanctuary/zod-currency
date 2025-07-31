# Tools

This directory contains utility scripts for analyzing and testing the zod-currency library.

## Scripts

### max-currency-length.js

A test script to determine the maximum length of currency identifiers by analyzing both fiat currencies and cryptocurrencies.

#### Usage

```bash
# Run the analysis
node tools/max-currency-length.js

# Run with JSON output
node tools/max-currency-length.js --json
```

#### What it does

- Analyzes all fiat currency codes from the `currency-codes` package
- Analyzes all cryptocurrency symbols from the `cryptocurrencies` package
- Finds the longest currency codes in each category
- Provides length distribution statistics
- Identifies conflicts between fiat and crypto codes
- Makes recommendations about schema limits

#### Sample Output

The script provides detailed analysis including:
- Longest fiat currency code and examples
- Longest cryptocurrency code and examples
- Overall longest currency code
- Length distribution with percentages
- Recommendations for schema limits
- List of conflicts between fiat and crypto codes

#### Key Findings

Based on the analysis:
- **Fiat currencies**: Maximum length is 3 characters (e.g., AED, AFN, ALL)
- **Cryptocurrencies**: Maximum length is 15 characters (e.g., GOLOSBLOCKCHAIN, SATOSHINAKAMOTO)
- **Overall**: Maximum length is 15 characters
- **Current schema limit**: 10 characters (too restrictive for cryptocurrencies)
- **Recommendation**: Update schema to allow at least 15 characters

#### Conflicts

The script also identifies currency codes that exist in both fiat and cryptocurrency lists, which helps understand how the precedence system works in the library. 