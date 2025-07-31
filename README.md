# zod-currency

A [zod-extend](https://github.com/bikeshed-sanctuary/zod-extend) package that adds `z.currency()` for validating currency codes.

```bash
npm install zod-currency
```

```typescript
import { z } from 'zod';
import { extendZod } from 'zod-currency';

const zWithCurrency = extendZod(z);

// Fiat currencies only (default)
const fiatSchema = zWithCurrency.currency();
fiatSchema.parse('USD'); // ✅ "USD"

// Fiat + Cryptocurrencies
import { fiatProvider, cryptoProvider } from 'zod-currency';
const mixedSchema = zWithCurrency.currency({ 
  provider: [fiatProvider, cryptoProvider] 
});
mixedSchema.parse('BTC'); // ✅ "BTC"
mixedSchema.parse('USD'); // ✅ "USD"
```

## Features

- **Fiat Currencies**: ISO 4217 standard (USD, EUR, GBP, etc.)
- **Cryptocurrencies**: BTC, ETH, and 4000+ more
- **Case Insensitive**: `'usd'` → `'USD'`
- **Custom Providers**: Create your own currency validators
- **Provider Filtering**: Limit by length, percentage, or custom rules

## Usage Examples

### Cryptocurrency Only
```typescript
import { cryptoProvider } from 'zod-currency';
const cryptoSchema = zWithCurrency.currency({ provider: cryptoProvider });
cryptoSchema.parse('BTC'); // ✅ "BTC"
cryptoSchema.parse('USD'); // ❌ Error
```

### Custom Provider
```typescript
import { CurrencyProvider } from 'zod-currency';

class CustomProvider implements CurrencyProvider {
  getValidCodes() { return new Set(['USD', 'EUR', 'CUSTOM']); }
  getMaxLength() { return 6; }
  getName() { return 'Custom Provider'; }
}

const customSchema = zWithCurrency.currency({ provider: new CustomProvider() });
```

### Filtered Cryptocurrencies
```typescript
import { CryptocurrencyProvider } from 'zod-currency';

// Top 10% of cryptocurrencies
const topCrypto = new CryptocurrencyProvider({ percentage: 0.1 });

// Short codes only (≤3 chars)
const shortCrypto = new CryptocurrencyProvider({ maxLength: 3 });

const schema = zWithCurrency.currency({ provider: topCrypto });
```

### Direct Function Usage
```typescript
import { createCurrencySchema } from 'zod-currency';

const schema = z.object({
  currency: createCurrencySchema({ provider: [fiatProvider, cryptoProvider] }),
  amount: z.number()
});
```

## API

### `extendZod(z)`
Extends Zod with `currency()` method.

### `zWithCurrency.currency(options?)`
Creates currency validation schema.

**Options:**
- `provider`: CurrencyProvider or array of providers (default: fiatProvider)
- `message`: Custom error message

### Built-in Providers
- `fiatProvider`: ISO 4217 fiat currencies
- `cryptoProvider`: Cryptocurrency symbols
- `CryptocurrencyProvider`: Filtered cryptocurrencies
- `MultiCurrencyProvider`: Combine multiple providers

## License

MIT 
