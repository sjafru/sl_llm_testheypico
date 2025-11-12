# API Contracts

This directory contains the API contract specifications for the LLM Maps Integration feature.

## Files

### api-spec.yaml
OpenAPI 3.0.3 specification for all HTTP API endpoints.

**Endpoints**:
- `POST /api/llm` - Send query to local LLM
- `POST /api/places/enrich` - Enrich locations with Google Places data
- `POST /api/places/directions` - Get directions between points
- `GET /api/health` - Health check endpoint

## Usage

### Viewing the Specification

You can view the API specification using:

1. **Swagger UI** (online):
   - Visit https://editor.swagger.io
   - Copy/paste the contents of `api-spec.yaml`

2. **Swagger UI** (local):
   ```bash
   npx swagger-ui-serve api-spec.yaml
   ```

3. **Redoc** (local):
   ```bash
   npx @redocly/cli preview-docs api-spec.yaml
   ```

### Generating Client Code

Generate TypeScript client code:
```bash
npx @openapitools/openapi-generator-cli generate \
  -i api-spec.yaml \
  -g typescript-fetch \
  -o ../../../lib/generated/api-client
```

### Validating Requests/Responses

The specification includes JSON Schema definitions that can be used to validate:
- Request payloads
- Response payloads
- Error responses

These schemas align with the Zod schemas in `data-model.md`.

## Contract Testing

Integration tests should verify that API routes conform to this specification:

```typescript
import { validateAgainstSchema } from '@/tests/utils/schema-validator';

test('POST /api/llm returns valid LLMResponse', async () => {
  const response = await fetch('/api/llm', {
    method: 'POST',
    body: JSON.stringify({ query: 'test' })
  });

  const data = await response.json();
  expect(validateAgainstSchema(data, 'LLMResponse')).toBe(true);
});
```

## Error Codes

Standard error codes used across all endpoints:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Malformed request payload |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `LLM_UNAVAILABLE` | 503 | LLM service not reachable |
| `LLM_TIMEOUT` | 504 | LLM response timeout |
| `PLACES_API_ERROR` | 502 | Google Places API error |
| `RATE_LIMIT_EXCEEDED` | 429 | Google API rate limit hit |
| `DIRECTIONS_NOT_FOUND` | 404 | No route found |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Rate Limiting

Google Maps APIs have the following free tier limits:
- **Maps JavaScript API**: 28,000 loads/month
- **Places API**: $200 free credit/month (~140,000 requests)
- **Directions API**: $200 free credit/month (~40,000 requests)

Implement request throttling if approaching limits.

## Versioning

Current version: **1.0.0**

API versioning strategy:
- Breaking changes: Increment major version (2.0.0)
- New endpoints/fields: Increment minor version (1.1.0)
- Bug fixes: Increment patch version (1.0.1)

Version is included in OpenAPI `info.version` field.
