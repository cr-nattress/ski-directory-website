# Story 34.4: Build Response Parser and Validator

## Priority: High

## Phase: Core

## Context

Create a robust parser and validator for OpenAI responses to ensure data quality before storing in the database. Use Zod for schema validation.

## Requirements

1. Define Zod schemas for response validation
2. Validate all required fields
3. Normalize data formats (phone, URL, coordinates)
4. Filter invalid shops
5. Log validation errors for debugging

## Implementation

### src/enricher/response-parser.ts

```typescript
import { z } from 'zod';
import { OpenAIShopResponse, OpenAIShop } from '../services/openai';
import { SkiShop, ShopType, ShopService } from '../types';
import { generateSlug } from '../utils/slug';
import { logger } from '../utils/logger';

// Valid shop types and services
const VALID_SHOP_TYPES: ShopType[] = ['rental', 'retail', 'repair', 'demo'];
const VALID_SERVICES: ShopService[] = [
  'ski_rental',
  'snowboard_rental',
  'boot_fitting',
  'tuning',
  'waxing',
  'repairs',
  'lessons',
];

// Zod schema for individual shop
const ShopSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  address: z.string().min(1),
  city: z.string().min(1).max(100),
  state: z.string().length(2).toUpperCase(),
  postal_code: z.string().min(5).max(10),
  latitude: z.number().min(24).max(72), // North America bounds
  longitude: z.number().min(-170).max(-50), // North America bounds
  website_url: z.string().url().nullable().or(z.literal(null)),
  phone: z.string().nullable(),
  shop_type: z.array(z.string()),
  services: z.array(z.string()),
  estimated_distance_miles: z.number().min(0),
});

// Zod schema for full response
const ResponseSchema = z.object({
  resort_name: z.string(),
  search_location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  search_radius_miles: z.number(),
  shops_found: z.number(),
  ski_shops: z.array(ShopSchema),
  note: z.string().optional(),
});

export interface ParseResult {
  validShops: SkiShop[];
  invalidCount: number;
  errors: string[];
}

export function parseOpenAIResponse(
  response: OpenAIShopResponse,
  maxRadius: number
): ParseResult {
  const errors: string[] = [];
  const validShops: SkiShop[] = [];

  // Validate overall response structure
  const responseValidation = ResponseSchema.safeParse(response);
  if (!responseValidation.success) {
    logger.error('Invalid response structure', {
      errors: responseValidation.error.errors,
    });
    return {
      validShops: [],
      invalidCount: response.ski_shops?.length || 0,
      errors: ['Invalid response structure'],
    };
  }

  // Process each shop
  for (const shop of response.ski_shops) {
    const shopResult = validateAndTransformShop(shop, maxRadius);

    if (shopResult.isValid && shopResult.shop) {
      validShops.push(shopResult.shop);
    } else {
      errors.push(`Invalid shop "${shop.name}": ${shopResult.error}`);
    }
  }

  return {
    validShops,
    invalidCount: response.ski_shops.length - validShops.length,
    errors,
  };
}

interface ShopValidationResult {
  isValid: boolean;
  shop?: SkiShop;
  error?: string;
}

function validateAndTransformShop(
  shop: OpenAIShop,
  maxRadius: number
): ShopValidationResult {
  // Basic validation
  const validation = ShopSchema.safeParse(shop);
  if (!validation.success) {
    return {
      isValid: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  // Distance check
  if (shop.estimated_distance_miles > maxRadius) {
    return {
      isValid: false,
      error: `Distance ${shop.estimated_distance_miles} exceeds radius ${maxRadius}`,
    };
  }

  // Filter and validate shop types
  const validTypes = shop.shop_type.filter((t): t is ShopType =>
    VALID_SHOP_TYPES.includes(t as ShopType)
  );

  if (validTypes.length === 0) {
    return {
      isValid: false,
      error: 'No valid shop types',
    };
  }

  // Filter and validate services
  const validServices = shop.services.filter((s): s is ShopService =>
    VALID_SERVICES.includes(s as ShopService)
  );

  // Transform to SkiShop
  const skiShop: SkiShop = {
    name: shop.name.trim(),
    slug: generateSlug(shop.name, shop.city, shop.state),
    description: shop.description?.trim() || null,
    address_line1: shop.address.trim(),
    city: shop.city.trim(),
    state: shop.state.toUpperCase(),
    postal_code: normalizePostalCode(shop.postal_code),
    country: 'US',
    latitude: shop.latitude,
    longitude: shop.longitude,
    phone: normalizePhone(shop.phone),
    website_url: normalizeUrl(shop.website_url),
    shop_type: validTypes,
    services: validServices,
    source: 'openai',
    verified: false,
    is_active: true,
  };

  return { isValid: true, shop: skiShop };
}

function normalizePostalCode(postal: string): string {
  // Extract 5-digit ZIP
  const match = postal.match(/(\d{5})/);
  return match ? match[1] : postal;
}

function normalizePhone(phone: string | null): string | null {
  if (!phone) return null;

  // Remove non-digits
  const digits = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX if 10 digits
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Return original if can't normalize
  return phone;
}

function normalizeUrl(url: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    // Ensure https
    parsed.protocol = 'https:';
    return parsed.toString();
  } catch {
    // Try adding https if missing
    try {
      const withProtocol = url.startsWith('http') ? url : `https://${url}`;
      return new URL(withProtocol).toString();
    } catch {
      return null;
    }
  }
}
```

### src/utils/slug.ts

```typescript
import slugify from 'slugify';

export function generateSlug(name: string, city: string, state: string): string {
  const combined = `${name} ${city} ${state}`;
  return slugify(combined, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}
```

## Acceptance Criteria

- [ ] Zod schemas validate response structure
- [ ] Invalid shops filtered with error messages
- [ ] Coordinates validated for North America bounds
- [ ] Shop types and services filtered to valid values
- [ ] Phone numbers normalized to consistent format
- [ ] URLs normalized with https protocol
- [ ] Postal codes normalized to 5-digit ZIP
- [ ] Slugs generated consistently

## Testing

1. Test with valid response
2. Test with missing required fields
3. Test with out-of-bounds coordinates
4. Test with invalid shop types
5. Test phone normalization edge cases
6. Test URL normalization edge cases

## Effort: Medium (2-3 hours)
