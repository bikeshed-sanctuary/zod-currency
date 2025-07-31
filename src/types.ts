import { z } from 'zod';

/**
 * Interface for currency providers that can supply currency codes for validation.
 * This allows users to create custom currency providers for their specific needs.
 */
export interface CurrencyProvider {
  /**
   * Get all valid currency codes for this provider.
   * @returns A set of valid currency codes (uppercase)
   */
  getValidCodes(): Set<string>;
  
  /**
   * Get the maximum length of currency codes for this provider.
   * This is used to set the `.max()` constraint on the Zod schema.
   * @returns The maximum length of currency codes
   */
  getMaxLength(): number;
  
  /**
   * Get a human-readable name for this provider.
   * @returns The provider name
   */
  getName(): string;
}

/**
 * Configuration options for creating currency schemas.
 */
export interface CurrencySchemaOptions {
  /**
   * The currency provider(s) to use for validation.
   * Can be a single provider or an array of providers.
   * Defaults to the fiat currency provider.
   */
  provider?: CurrencyProvider | CurrencyProvider[];
  
  /**
   * Custom error message for invalid currency codes.
   */
  message?: string;
}

export type CurrencySchema = z.ZodString; 