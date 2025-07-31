import { z } from 'zod';
import { extendZod, fiatProvider, cryptoProvider, MultiCurrencyProvider, CryptocurrencyProvider } from '../dist/index.js';

const zWithCurrency = extendZod(z);

// Example 1: Fiat currencies only (default)
const fiatSchema = zWithCurrency.currency();

console.log('=== Fiat Currencies Only ===');
console.log('USD:', fiatSchema.safeParse('USD').success); // true
console.log('EUR:', fiatSchema.safeParse('EUR').success); // true
console.log('BTC:', fiatSchema.safeParse('BTC').success); // false (crypto not allowed)
console.log('INVALID:', fiatSchema.safeParse('INVALID').success); // false

// Example 2: With cryptocurrency support
const combinedProvider = new MultiCurrencyProvider([fiatProvider, cryptoProvider]);
const cryptoSchema = zWithCurrency.currency({ provider: combinedProvider });

console.log('\n=== With Cryptocurrencies ===');
console.log('USD:', cryptoSchema.safeParse('USD').success); // true (fiat)
console.log('BTC:', cryptoSchema.safeParse('BTC').success); // true (crypto)
console.log('ETH:', cryptoSchema.safeParse('ETH').success); // true (crypto)
console.log('INVALID:', cryptoSchema.safeParse('INVALID').success); // false

// Example 3: Cryptocurrency only provider
const cryptoOnlySchema = zWithCurrency.currency({ provider: cryptoProvider });

console.log('\n=== Cryptocurrency Only ===');
console.log('USD:', cryptoOnlySchema.safeParse('USD').success); // false (fiat not allowed)
console.log('BTC:', cryptoOnlySchema.safeParse('BTC').success); // true (crypto)
console.log('ETH:', cryptoOnlySchema.safeParse('ETH').success); // true (crypto)

// Example 4: Custom cryptocurrency provider with max length
const customCryptoProvider = new CryptocurrencyProvider({ maxLength: 3 });
const shortCryptoSchema = zWithCurrency.currency({ provider: customCryptoProvider });

console.log('\n=== Custom Crypto Provider (max 3 chars) ===');
console.log('BTC:', shortCryptoSchema.safeParse('BTC').success); // true
console.log('ETH:', shortCryptoSchema.safeParse('ETH').success); // false (too long)
console.log('LTC:', shortCryptoSchema.safeParse('LTC').success); // true

// Example 5: Custom cryptocurrency provider with percentage
const percentageCryptoProvider = new CryptocurrencyProvider({ percentage: 0.1 });
const limitedCryptoSchema = zWithCurrency.currency({ provider: percentageCryptoProvider });

console.log('\n=== Limited Crypto Provider (10%) ===');
console.log('BTC:', limitedCryptoSchema.safeParse('BTC').success); // true (likely in top 10%)
console.log('ETH:', limitedCryptoSchema.safeParse('ETH').success); // true (likely in top 10%)

// Example 6: Case insensitive validation
const schema = zWithCurrency.currency();

console.log('\n=== Case Insensitive ===');
console.log('usd:', schema.safeParse('usd').data); // 'USD'
console.log('UsD:', schema.safeParse('UsD').data); // 'USD'
console.log('USD:', schema.safeParse('USD').data); // 'USD'

// Example 7: Custom error message
const customSchema = zWithCurrency.currency({ 
  provider: combinedProvider,
  message: 'Please enter a valid currency code' 
});

console.log('\n=== Custom Error Message ===');
const result = customSchema.safeParse('INVALID');
if (!result.success) {
  console.log('Error:', result.error.issues[0].message);
}

// Example 8: Integration with Zod schemas
const userSchema = zWithCurrency.object({
  name: z.string(),
  preferredCurrency: zWithCurrency.currency({ provider: combinedProvider }),
  billingCurrency: zWithCurrency.currency(), // Fiat only
});

console.log('\n=== Integration Example ===');
const user = userSchema.parse({
  name: 'John Doe',
  preferredCurrency: 'BTC',
  billingCurrency: 'USD',
});

console.log('User:', user);

// Example 9: Getting provider information
console.log('\n=== Provider Information ===');
console.log('Fiat provider max length:', fiatProvider.getMaxLength());
console.log('Crypto provider max length:', cryptoProvider.getMaxLength());
console.log('Combined provider max length:', combinedProvider.getMaxLength());
console.log('Fiat provider name:', fiatProvider.getName());
console.log('Crypto provider name:', cryptoProvider.getName());
console.log('Combined provider name:', combinedProvider.getName());

// Example 10: Custom provider implementation
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

const customProvider = new CustomCurrencyProvider();
const customProviderSchema = zWithCurrency.currency({ provider: customProvider });

console.log('\n=== Custom Provider ===');
console.log('Valid codes:', Array.from(customProvider.getValidCodes()));
console.log('Max length:', customProvider.getMaxLength());
console.log('USD:', customProviderSchema.safeParse('USD').success); // true
console.log('CUST:', customProviderSchema.safeParse('CUST').success); // true
console.log('BTC:', customProviderSchema.safeParse('BTC').success); // false 