#!/usr/bin/env node

/**
 * Test script to determine the optimal length limit for currency identifiers
 * This script analyzes cryptocurrency lengths to find the smallest limit that
 * supports 99% of cryptocurrencies while excluding obviously unreasonable identifiers.
 */

import * as currencyCodes from 'currency-codes';
import { symbols as cryptoSymbols } from 'cryptocurrencies';

function analyzeCurrencyLengths() {
  console.log('🔍 Analyzing currency identifier lengths...\n');

  // Get all fiat currency codes
  const fiatCodes = currencyCodes.codes();
  const fiatCodeSet = new Set(fiatCodes);

  // Get all cryptocurrency symbols
  const cryptoCodeSet = new Set(cryptoSymbols);

  // Find the longest fiat currency code
  const longestFiat = fiatCodes.reduce((longest, current) => 
    current.length > longest.length ? current : longest, '');

  // Analyze crypto length distribution
  const cryptoLengthDistribution = {};
  const cryptoByLength = {};
  
  cryptoSymbols.forEach(code => {
    const length = code.length;
    cryptoLengthDistribution[length] = (cryptoLengthDistribution[length] || 0) + 1;
    if (!cryptoByLength[length]) {
      cryptoByLength[length] = [];
    }
    cryptoByLength[length].push(code);
  });

  // Calculate cumulative percentages for different thresholds
  const totalCrypto = cryptoSymbols.length;
  const thresholds = {};
  
  Object.keys(cryptoLengthDistribution)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(length => {
      const count = cryptoLengthDistribution[length];
      const cumulativeCount = Object.keys(cryptoLengthDistribution)
        .filter(l => parseInt(l) <= parseInt(length))
        .reduce((sum, l) => sum + cryptoLengthDistribution[l], 0);
      const percentage = ((cumulativeCount / totalCrypto) * 100).toFixed(2);
      
      thresholds[length] = {
        count,
        cumulativeCount,
        percentage: parseFloat(percentage)
      };
    });

  // Display results
  console.log('📊 Currency Length Analysis Results:');
  console.log('=====================================\n');

  console.log(`🏦 Fiat Currencies:`);
  console.log(`   Total count: ${fiatCodes.length}`);
  console.log(`   Longest code: "${longestFiat}" (${longestFiat.length} characters)`);
  console.log(`   Examples of longest fiat codes:`);
  fiatCodes
    .filter(code => code.length === longestFiat.length)
    .slice(0, 5)
    .forEach(code => console.log(`     - ${code}`));

  console.log(`\n₿ Cryptocurrencies:`);
  console.log(`   Total count: ${totalCrypto}`);
  console.log(`   Longest code: "${cryptoSymbols.reduce((longest, current) => 
    current.length > longest.length ? current : longest, '')}" (${Math.max(...cryptoSymbols.map(c => c.length))} characters)`);

  console.log(`\n📈 Length Distribution & Thresholds:`);
  console.log(`   Length | Count | Cumulative | Percentage | Examples`);
  console.log(`   -------|-------|------------|------------|----------`);
  
  Object.keys(thresholds)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(length => {
      const { count, cumulativeCount, percentage } = thresholds[length];
      const examples = cryptoByLength[length].slice(0, 3).join(', ');
      const marker = percentage >= 99 ? ' 🎯' : percentage >= 95 ? ' ⚠️' : '';
      console.log(`   ${length.padStart(6)} | ${count.toString().padStart(5)} | ${cumulativeCount.toString().padStart(10)} | ${percentage.toString().padStart(9)}%${marker} | ${examples}`);
    });

  // Find optimal thresholds
  const thresholds99 = Object.entries(thresholds).find(([length, data]) => data.percentage >= 99);
  const thresholds95 = Object.entries(thresholds).find(([length, data]) => data.percentage >= 95);
  const thresholds90 = Object.entries(thresholds).find(([length, data]) => data.percentage >= 90);

  console.log(`\n💡 Recommendations:`);
  console.log(`   - Current schema limit: 10 characters`);
  console.log(`   - 90% coverage: ${thresholds90 ? thresholds90[0] + ' characters' : 'N/A'}`);
  console.log(`   - 95% coverage: ${thresholds95 ? thresholds95[0] + ' characters' : 'N/A'}`);
  console.log(`   - 99% coverage: ${thresholds99 ? thresholds99[0] + ' characters' : 'N/A'}`);

  if (thresholds99) {
    const optimalLength = parseInt(thresholds99[0]);
    if (optimalLength <= 10) {
      console.log(`   ✅ Current schema limit (10) is sufficient for 99% coverage!`);
    } else {
      console.log(`   📝 Consider updating max length to ${optimalLength} for 99% coverage`);
      console.log(`   📊 This would add ${thresholds99[1].count} more supported cryptocurrencies`);
    }
  }

  // Show examples of excluded cryptocurrencies at different thresholds
  console.log(`\n🚫 Examples of excluded cryptocurrencies at different thresholds:`);
  [5, 6, 7, 8, 9, 10].forEach(threshold => {
    const excluded = cryptoSymbols.filter(code => code.length > threshold);
    if (excluded.length > 0) {
      console.log(`   ${threshold}+ characters (${excluded.length} excluded): ${excluded.slice(0, 5).join(', ')}${excluded.length > 5 ? '...' : ''}`);
    }
  });

  // Check for conflicts between fiat and crypto
  const conflicts = cryptoSymbols.filter(symbol => fiatCodeSet.has(symbol));
  if (conflicts.length > 0) {
    console.log(`\n⚠️  Conflicts found between fiat and crypto codes:`);
    conflicts.forEach(code => console.log(`   - ${code}`));
  }

  return {
    longestFiat,
    fiatCount: fiatCodes.length,
    cryptoCount: totalCrypto,
    thresholds,
    cryptoLengthDistribution,
    conflicts
  };
}

// Run the analysis
try {
  const results = analyzeCurrencyLengths();
  
  // Export results for potential programmatic use
  if (process.argv.includes('--json')) {
    console.log('\n📄 JSON Output:');
    console.log(JSON.stringify(results, null, 2));
  }
} catch (error) {
  console.error('❌ Error analyzing currency lengths:', error.message);
  process.exit(1);
}