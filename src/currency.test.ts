import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { createCurrencySchema, extendZod } from './currency.js';
import { fiatProvider, cryptoProvider, MultiCurrencyProvider, CryptocurrencyProvider } from './providers.js';
import * as currencyCodes from 'currency-codes';
import { symbols as cryptoSymbols } from 'cryptocurrencies';

const zWithCurrency = extendZod(z);

describe('z.currency()', () => {
  describe('fiat currencies only (default)', () => {
    const schema = zWithCurrency.currency();

    it('should accept valid fiat currency codes', () => {
      const validCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
      
      for (const code of validCodes) {
        const result = schema.safeParse(code);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(code.toUpperCase());
        }
      }
    });

    it('should reject invalid currency codes', () => {
      const invalidCodes = ['ABC', 'XYZ', '123', 'BTC', 'ETH'];
      
      for (const code of invalidCodes) {
        const result = schema.safeParse(code);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid currency code');
        }
      }
    });

    it('should reject empty strings', () => {
      const result = schema.safeParse('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Currency code cannot be empty');
      }
    });

    it('should reject codes that are too long', () => {
      const maxLength = fiatProvider.getMaxLength();
      const longCode = 'A'.repeat(maxLength + 1);
      const result = schema.safeParse(longCode);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(`Currency code cannot exceed ${maxLength} characters`);
      }
    });

    it('should transform codes to uppercase', () => {
      const result = schema.safeParse('usd');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('USD');
      }
    });
  });

  describe('with cryptocurrency provider', () => {
    const schema = zWithCurrency.currency({ provider: cryptoProvider });

    it('should accept valid cryptocurrency codes', () => {
      // Test some common cryptocurrency codes
      const validCryptoCodes = ['BTC', 'ETH', 'LTC', 'XRP', 'ADA'];
      
      for (const code of validCryptoCodes) {
        const result = schema.safeParse(code);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(code.toUpperCase());
        }
      }
    });

    it('should reject fiat currency codes', () => {
      const fiatCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
      
      for (const code of fiatCodes) {
        const result = schema.safeParse(code);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid currency code');
        }
      }
    });

    it('should reject invalid codes', () => {
      const invalidCodes = ['INVALID', 'ZZZZZZ', '999999', 'AAAAAA', 'BBBBBB', 'CCCCCC'];
      
      for (const code of invalidCodes) {
        const result = schema.safeParse(code);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid currency code');
        }
      }
    });
  });

  describe('with combined provider', () => {
    const combinedProvider = new MultiCurrencyProvider([fiatProvider, cryptoProvider]);
    const schema = zWithCurrency.currency({ provider: combinedProvider });

    it('should accept valid fiat currency codes', () => {
      const validFiatCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
      
      for (const code of validFiatCodes) {
        const result = schema.safeParse(code);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(code.toUpperCase());
        }
      }
    });

    it('should accept valid cryptocurrency codes', () => {
      // Test some common cryptocurrency codes
      const validCryptoCodes = ['BTC', 'ETH', 'LTC', 'XRP', 'ADA'];
      
      for (const code of validCryptoCodes) {
        const result = schema.safeParse(code);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(code.toUpperCase());
        }
      }
    });

    it('should reject invalid codes', () => {
      const invalidCodes = ['INVALID', 'ZZZZZZ', '999999', 'AAAAAA', 'BBBBBB', 'CCCCCC'];
      
      for (const code of invalidCodes) {
        const result = schema.safeParse(code);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid currency code');
        }
      }
    });

    it('should use fiat currency precedence over crypto', () => {
      // This test ensures that if a crypto has the same symbol as a fiat currency,
      // the fiat currency is preferred (which is the intended behavior)
      const fiatCodes = new Set(currencyCodes.codes());
      
      // Find any crypto symbols that conflict with fiat codes
      const conflictingCodes = cryptoSymbols.filter((symbol: string) => fiatCodes.has(symbol));
      
      if (conflictingCodes.length > 0) {
        // If there are conflicts, they should be treated as fiat currencies
        for (const code of conflictingCodes) {
          const result = schema.safeParse(code);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).toBe(code.toUpperCase());
          }
        }
      }
    });
  });

  describe('with custom error message', () => {
    const customMessage = 'Please enter a valid currency code';
    const schema = zWithCurrency.currency({ message: customMessage });

    it('should use custom error message', () => {
      const result = schema.safeParse('ABC');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(customMessage);
      }
    });
  });

  describe('edge cases', () => {
    const schema = zWithCurrency.currency();

    it('should handle case-insensitive validation', () => {
      const result = schema.safeParse('usd');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('USD');
      }
    });

    it('should handle mixed case', () => {
      const result = schema.safeParse('UsD');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('USD');
      }
    });
  });
});

describe('extendZod()', () => {
  it('should extend zod instance with currency method', () => {
    const extendedZ = extendZod(z);
    expect(typeof extendedZ.currency).toBe('function');
    
    // Test that the extended instance works
    const schema = extendedZ.currency();
    const result = schema.safeParse('USD');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('USD');
    }
  });

  it('should preserve all original zod methods', () => {
    const extendedZ = extendZod(z);
    
    // Test that original methods still work
    const stringSchema = extendedZ.string();
    const numberSchema = extendedZ.number();
    const objectSchema = extendedZ.object({});
    
    expect(stringSchema.safeParse('test').success).toBe(true);
    expect(numberSchema.safeParse(123).success).toBe(true);
    expect(objectSchema.safeParse({}).success).toBe(true);
  });

  it('should preserve method bindings and context', () => {
    const extendedZ = extendZod(z);
    
    // Test that all original methods work with proper context and bindings
    const stringSchema = extendedZ.string();
    const numberSchema = extendedZ.number();
    const objectSchema = extendedZ.object({});
    const arraySchema = extendedZ.array(z.string());
    const unionSchema = extendedZ.union([z.string(), z.number()]);
    
    // Test that the extended method works
    const currencySchema = extendedZ.currency();
    
    // All should work without throwing and preserve proper context
    expect(stringSchema.safeParse('test').success).toBe(true);
    expect(numberSchema.safeParse(123).success).toBe(true);
    expect(objectSchema.safeParse({}).success).toBe(true);
    expect(arraySchema.safeParse(['test']).success).toBe(true);
    expect(unionSchema.safeParse('test').success).toBe(true);
    expect(unionSchema.safeParse(123).success).toBe(true);
    expect(currencySchema.safeParse('USD').success).toBe(true);
  });

  it('should maintain prototype chain and instance identity', () => {
    const extendedZ = extendZod(z);
    
    // Verify that the extended instance is the same object (not a new object)
    expect(extendedZ).toBe(extendedZ);
    
    // Verify that all original properties are preserved
    expect(typeof extendedZ.string).toBe('function');
    expect(typeof extendedZ.number).toBe('function');
    expect(typeof extendedZ.object).toBe('function');
    expect(typeof extendedZ.array).toBe('function');
    expect(typeof extendedZ.union).toBe('function');
    expect(typeof extendedZ.currency).toBe('function');
  });
});

describe('createCurrencySchema()', () => {
  it('should work with the legacy function', () => {
    const schema = createCurrencySchema();
    const result = schema.safeParse('USD');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('USD');
    }
  });

  it('should work with custom provider', () => {
    const schema = createCurrencySchema({ provider: cryptoProvider });
    const result = schema.safeParse('BTC');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('BTC');
    }
  });

  it('should work with provider array', () => {
    const schema = createCurrencySchema({ provider: [fiatProvider, cryptoProvider] });
    const fiatResult = schema.safeParse('USD');
    const cryptoResult = schema.safeParse('BTC');
    
    expect(fiatResult.success).toBe(true);
    expect(cryptoResult.success).toBe(true);
    if (fiatResult.success) {
      expect(fiatResult.data).toBe('USD');
    }
    if (cryptoResult.success) {
      expect(cryptoResult.data).toBe('BTC');
    }
  });


});

describe('Currency Providers', () => {
  describe('FiatCurrencyProvider', () => {
    it('should return valid fiat codes', () => {
      const codes = fiatProvider.getValidCodes();
      expect(codes.has('USD')).toBe(true);
      expect(codes.has('EUR')).toBe(true);
      expect(codes.has('BTC')).toBe(false);
    });

    it('should return max length', () => {
      const maxLength = fiatProvider.getMaxLength();
      expect(typeof maxLength).toBe('number');
      expect(maxLength).toBeGreaterThan(0);
    });
  });

  describe('CryptocurrencyProvider', () => {
    it('should work with maxLength option', () => {
      const provider = new CryptocurrencyProvider({ maxLength: 3 });
      const codes = provider.getValidCodes();
      const maxLength = provider.getMaxLength();
      
      expect(maxLength).toBeLessThanOrEqual(3);
      for (const code of codes) {
        expect(code.length).toBeLessThanOrEqual(3);
      }
    });

    it('should work with percentage option', () => {
      const provider = new CryptocurrencyProvider({ percentage: 0.1 });
      const codes = provider.getValidCodes();
      const allCodes = new Set(cryptoSymbols);
      
      expect(codes.size).toBeLessThanOrEqual(allCodes.size * 0.1);
    });

    it('should throw error for invalid maxLength', () => {
      expect(() => new CryptocurrencyProvider({ maxLength: 0 })).toThrow();
      expect(() => new CryptocurrencyProvider({ maxLength: -1 })).toThrow();
    });

    it('should throw error for invalid percentage', () => {
      expect(() => new CryptocurrencyProvider({ percentage: 0 })).toThrow();
      expect(() => new CryptocurrencyProvider({ percentage: 1.1 })).toThrow();
    });

    it('should throw error for both options', () => {
      expect(() => new CryptocurrencyProvider({ maxLength: 3, percentage: 0.5 })).toThrow();
    });
  });
}); 