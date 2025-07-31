import { z } from 'zod';
import { CurrencyProvider, CurrencySchemaOptions } from './types.js';
import { fiatProvider, cryptoProvider, MultiCurrencyProvider } from './providers.js';
import createExtendZod from 'zod-extend';

/**
 * Creates a Zod schema for validating currency codes using a currency provider.
 * 
 * @param options - Configuration options for the currency validation
 * @returns A Zod string schema that validates currency codes
 * 
 * @example
 * ```typescript
 * import { z } from 'zod-currency';
 * 
 * // Fiat currencies only (default)
 * const fiatSchema = z.currency();
 * 
 * // With single provider
 * const cryptoSchema = z.currency({ provider: cryptoProvider });
 * 
 * // With multiple providers (array)
 * const multiSchema = z.currency({ provider: [fiatProvider, cryptoProvider] });
 * 
 * // With custom error message
 * const customSchema = z.currency({ 
 *   provider: cryptoProvider,
 *   message: 'Please enter a valid currency code'
 * });
 * ```
 */
export function createCurrencySchema(options: CurrencySchemaOptions = {}) {
  const { provider, message } = options;
  
  // Determine the final provider to use
  let finalProvider: CurrencyProvider;
  
  if (provider !== undefined) {
    // Handle provider option (can be single provider or array)
    if (Array.isArray(provider)) {
      finalProvider = new MultiCurrencyProvider(provider);
    } else {
      finalProvider = provider;
    }
  } else {
    // Default to fiat provider
    finalProvider = fiatProvider;
  }
  
  const validCodes = finalProvider.getValidCodes();
  const maxLength = finalProvider.getMaxLength();
  
  const defaultMessage = `Invalid currency code. Must be a valid currency code from ${finalProvider.getName()}.`;
  
  return z.string()
    .min(1, 'Currency code cannot be empty')
    .max(maxLength, `Currency code cannot exceed ${maxLength} characters`)
    .refine(
      (code) => {
        const upperCode = code.toUpperCase();
        return validCodes.has(upperCode);
      },
      {
        message: message || defaultMessage,
      }
    )
    .transform((code) => code.toUpperCase());
}

/**
 * Zod extension to add currency validation to the z object.
 * This follows the conventional pattern used by other Zod extensions.
 * Creates a new object with the same prototype to preserve method bindings.
 */
export const extendZod = createExtendZod({
  currency: (options: CurrencySchemaOptions = {}) => createCurrencySchema(options),
});
