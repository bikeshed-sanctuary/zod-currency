import { z } from 'zod';
import { extendZod, fiatProvider, cryptoProvider, MultiCurrencyProvider, CryptocurrencyProvider } from '../dist/index.js';

const zWithCurrency = extendZod(z);

// Example 1: Creating a custom currency provider
class CustomCurrencyProvider {
  getValidCodes() {
    return new Set(['USD', 'EUR', 'CUST']);
  }
  
  getMaxLength() {
    return 5;
  }
  
  getName() {
    return 'Custom Currency Provider';
  }
}

// Example 2: Creating a regional currency provider
class RegionalCurrencyProvider {
  getValidCodes() {
    return new Set(['USD', 'CAD', 'MXN']); // North American currencies
  }
  
  getMaxLength() {
    return 3;
  }
  
  getName() {
    return 'Regional Currency Provider';
  }
}

// Example 3: Creating a stablecoin provider
class StablecoinProvider {
  getValidCodes() {
    return new Set(['USDT', 'USDC', 'DAI', 'BUSD']);
  }
  
  getMaxLength() {
    return 4;
  }
  
  getName() {
    return 'Stablecoin Provider';
  }
}

console.log('=== Custom Provider Examples ===');

// Using a single custom provider
const customProvider = new CustomCurrencyProvider();
const customSchema = zWithCurrency.currency({ provider: customProvider });

console.log('Custom Provider:');
console.log('USD:', customSchema.safeParse('USD').success); // true
console.log('CUST:', customSchema.safeParse('CUST').success); // true
console.log('BTC:', customSchema.safeParse('BTC').success); // false

// Using MultiCurrencyProvider to combine multiple providers
const multiProvider = new MultiCurrencyProvider([
  fiatProvider,           // Fiat currencies (takes precedence)
  customProvider,         // Custom currencies
  new StablecoinProvider() // Stablecoins
]);

const multiSchema = zWithCurrency.currency({ provider: multiProvider });

console.log('\nMulti Provider (Fiat + Custom + Stablecoins):');
console.log('USD:', multiSchema.safeParse('USD').success); // true (from fiat)
console.log('CUST:', multiSchema.safeParse('CUST').success); // true (from custom)
console.log('USDT:', multiSchema.safeParse('USDT').success); // true (from stablecoin)
console.log('BTC:', multiSchema.safeParse('BTC').success); // false (not in any provider)

// Creating a regional + crypto combination
const regionalCryptoProvider = new MultiCurrencyProvider([
  new RegionalCurrencyProvider(), // Regional currencies (takes precedence)
  cryptoProvider                  // Cryptocurrencies
]);

const regionalCryptoSchema = zWithCurrency.currency({ provider: regionalCryptoProvider });

console.log('\nRegional + Crypto Provider:');
console.log('USD:', regionalCryptoSchema.safeParse('USD').success); // true (from regional)
console.log('CAD:', regionalCryptoSchema.safeParse('CAD').success); // true (from regional)
console.log('BTC:', regionalCryptoSchema.safeParse('BTC').success); // true (from crypto)
console.log('EUR:', regionalCryptoSchema.safeParse('EUR').success); // false (not in either provider)

// Creating a stablecoin + limited crypto combination
const stablecoinLimitedCryptoProvider = new MultiCurrencyProvider([
  new StablecoinProvider(), // Stablecoins (takes precedence)
  new CryptocurrencyProvider({ maxLength: 3 }) // Short crypto codes only
]);

const stablecoinCryptoSchema = zWithCurrency.currency({ provider: stablecoinLimitedCryptoProvider });

console.log('\nStablecoin + Limited Crypto Provider:');
console.log('USDT:', stablecoinCryptoSchema.safeParse('USDT').success); // true (from stablecoin)
console.log('BTC:', stablecoinCryptoSchema.safeParse('BTC').success); // true (from crypto, 3 chars)
console.log('ETH:', stablecoinCryptoSchema.safeParse('ETH').success); // false (from crypto, 4 chars)
console.log('EUR:', stablecoinCryptoSchema.safeParse('EUR').success); // false (not in either provider)

// Example 4: Creating a provider that reads from an API or database
class DynamicCurrencyProvider {
  constructor(currencies) {
    this.currencies = currencies;
  }
  
  getValidCodes() {
    return new Set(this.currencies);
  }
  
  getMaxLength() {
    return Math.max(...this.currencies.map(c => c.length));
  }
  
  getName() {
    return 'Dynamic Currency Provider';
  }
}

// Simulating currencies from an API
const apiCurrencies = ['API1', 'API2', 'API3'];
const dynamicProvider = new DynamicCurrencyProvider(apiCurrencies);
const dynamicSchema = zWithCurrency.currency({ provider: dynamicProvider });

console.log('\nDynamic Provider (from API):');
console.log('API1:', dynamicSchema.safeParse('API1').success); // true
console.log('API2:', dynamicSchema.safeParse('API2').success); // true
console.log('USD:', dynamicSchema.safeParse('USD').success); // false

// Example 5: Creating a provider with validation rules
class ValidatedCurrencyProvider {
  constructor(currencies, validationRules) {
    this.currencies = currencies;
    this.validationRules = validationRules;
  }
  
  getValidCodes() {
    // Apply validation rules to filter currencies
    return new Set(
      this.currencies.filter(currency => {
        // Example: only include currencies that start with a letter
        return this.validationRules.startsWithLetter ? /^[A-Z]/.test(currency) : true;
      })
    );
  }
  
  getMaxLength() {
    const validCodes = Array.from(this.getValidCodes());
    return validCodes.length > 0 ? Math.max(...validCodes.map(c => c.length)) : 0;
  }
  
  getName() {
    return 'Validated Currency Provider';
  }
}

const currencies = ['USD', 'EUR', '1BTC', 'ETH', '2LTC'];
const validationRules = { startsWithLetter: true };
const validatedProvider = new ValidatedCurrencyProvider(currencies, validationRules);
const validatedSchema = zWithCurrency.currency({ provider: validatedProvider });

console.log('\nValidated Provider (only letters):');
console.log('USD:', validatedSchema.safeParse('USD').success); // true
console.log('EUR:', validatedSchema.safeParse('EUR').success); // true
console.log('1BTC:', validatedSchema.safeParse('1BTC').success); // false (starts with number)
console.log('ETH:', validatedSchema.safeParse('ETH').success); // true

console.log('\nProvider Information:');
console.log('Multi provider name:', multiProvider.getName());
console.log('Multi provider max length:', multiProvider.getMaxLength());
console.log('Multi provider valid codes count:', multiProvider.getValidCodes().size); 