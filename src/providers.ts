import * as currencyCodes from 'currency-codes';
import { symbols as cryptoSymbols } from 'cryptocurrencies';
import { CurrencyProvider } from './types.js';

/**
 * Fiat currency provider that includes all ISO 4217 currency codes.
 */
export class FiatCurrencyProvider implements CurrencyProvider {
  private validCodes: Set<string>;
  private maxLength: number;

  constructor() {
    this.validCodes = new Set(currencyCodes.codes());
    this.maxLength = Math.max(...Array.from(this.validCodes).map(code => code.length));
  }

  getValidCodes(): Set<string> {
    return new Set(this.validCodes);
  }

  getMaxLength(): number {
    return this.maxLength;
  }

  getName(): string {
    return 'Fiat Currency Provider';
  }
}

/**
 * Cryptocurrency provider that includes cryptocurrency symbols.
 * Can be configured with either a maximum length or a percentage of cryptocurrencies.
 */
export class CryptocurrencyProvider implements CurrencyProvider {
  private validCodes: Set<string>;
  private maxLength: number;

  constructor(options: { maxLength?: number; percentage?: number } = {}) {
    const { maxLength, percentage } = options;
    
    if (maxLength !== undefined && (maxLength <= 0 || !Number.isInteger(maxLength))) {
      throw new Error('maxLength must be a positive integer');
    }
    
    if (percentage !== undefined && (percentage <= 0 || percentage > 1)) {
      throw new Error('percentage must be a number between 0 and 1');
    }
    
    if (maxLength !== undefined && percentage !== undefined) {
      throw new Error('Cannot specify both maxLength and percentage');
    }

    // Get all cryptocurrency symbols
    let selectedCodes = new Set(cryptoSymbols);
    
    // Filter by max length if specified
    if (maxLength !== undefined) {
      selectedCodes = new Set(
        Array.from(selectedCodes).filter(code => code.length <= maxLength)
      );
    }
    
    // Filter by percentage if specified
    if (percentage !== undefined) {
      const codesArray = Array.from(selectedCodes);
      const count = Math.floor(codesArray.length * percentage);
      selectedCodes = new Set(codesArray.slice(0, count));
    }

    this.validCodes = selectedCodes;
    this.maxLength = Math.max(...Array.from(this.validCodes).map(code => code.length));
  }

  getValidCodes(): Set<string> {
    return new Set(this.validCodes);
  }

  getMaxLength(): number {
    return this.maxLength;
  }

  getName(): string {
    return 'Cryptocurrency Provider';
  }
}

/**
 * Multi-currency provider that combines multiple currency providers.
 * The first provider in the list takes precedence over subsequent providers.
 */
export class MultiCurrencyProvider implements CurrencyProvider {
  private validCodes: Set<string>;
  private maxLength: number;
  private providers: CurrencyProvider[];

  constructor(providers: CurrencyProvider[]) {
    if (providers.length === 0) {
      throw new Error('At least one provider must be specified');
    }
    
    this.providers = providers;
    
    // Combine codes from all providers, with earlier providers taking precedence
    this.validCodes = new Set();
    for (const provider of providers) {
      const providerCodes = provider.getValidCodes();
      for (const code of providerCodes) {
        if (!this.validCodes.has(code)) {
          this.validCodes.add(code);
        }
      }
    }
    
    this.maxLength = Math.max(...Array.from(this.validCodes).map(code => code.length));
  }

  getValidCodes(): Set<string> {
    return new Set(this.validCodes);
  }

  getMaxLength(): number {
    return this.maxLength;
  }

  getName(): string {
    const providerNames = this.providers.map(p => p.getName());
    return `Multi Currency Provider (${providerNames.join(', ')})`;
  }
}

// Default providers
export const fiatProvider = new FiatCurrencyProvider();
export const cryptoProvider = new CryptocurrencyProvider(); 