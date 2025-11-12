# Research: Local LLM with Google Maps Integration

**Feature**: 001-llm-maps-integration
**Date**: 2025-11-12
**Phase**: 0 - Technology Research & Decision Making

## Overview

This document captures the research and technology decisions for building a web application that combines a local Large Language Model with Google Maps integration for location-based natural language queries.

## Technology Decisions

### 1. Local LLM Provider

**Decision**: Support both Ollama and LM Studio with runtime configuration

**Rationale**:
- **Ollama**: Open-source, excellent model management, REST API, cross-platform, active community
- **LM Studio**: User-friendly GUI, good for non-technical users, similar REST API interface
- Both provide compatible REST APIs for chat completions
- Supporting both gives users flexibility without significant code duplication (factory pattern)

**Alternatives Considered**:
- **LocalAI**: More complex setup, smaller community
- **llama.cpp directly**: Requires more low-level integration, no model management
- **Cloud LLM APIs (OpenAI, Anthropic)**: Rejected due to requirement for local deployment

**Implementation Notes**:
- Use environment variable `LLM_PROVIDER` to select between ollama/lmstudio
- Default to Ollama (port 11434), fallback to LM Studio (port 1234)
- Abstract behind common interface for easy switching
- Both support OpenAI-compatible chat completion format

---

### 2. Frontend Framework & UI Library

**Decision**: Next.js 14+ (App Router) + shadcn/ui + Tailwind CSS

**Rationale**:
- **Next.js 14 App Router**:
  - Modern React framework with server/client components
  - Built-in API routes for backend logic
  - Excellent TypeScript support
  - SEO-friendly (though less critical for single-user app)
  - Streaming support for LLM responses
- **shadcn/ui**:
  - High-quality, accessible components
  - Built on Radix UI primitives
  - Fully customizable (copy-paste model)
  - Excellent TypeScript support
  - No runtime dependency overhead
- **Tailwind CSS**:
  - Utility-first approach matches shadcn/ui
  - Excellent for rapid prototyping
  - Small production bundle size
  - Good responsive design support

**Alternatives Considered**:
- **Vite + React**: Faster dev server but no built-in API routes (would need separate backend)
- **Material-UI / Ant Design**: Heavier bundles, less customizable
- **CSS Modules / Styled Components**: More boilerplate, less consistent

---

### 3. Google Maps Integration

**Decision**: @react-google-maps/api library + Google Maps JavaScript API

**Rationale**:
- **@react-google-maps/api**:
  - Official Google-maintained React wrapper
  - Type-safe with TypeScript
  - Lazy loading support for performance
  - Comprehensive feature coverage (markers, directions, info windows)
  - Active maintenance and community support
- **Google Maps JavaScript API**:
  - Most feature-complete mapping solution
  - Excellent documentation
  - Free tier suitable for single-user/development (28,000 map loads/month)
  - Native integration with Google Places and Directions APIs

**Alternatives Considered**:
- **Mapbox**: More modern API but additional learning curve, different pricing
- **Leaflet + OpenStreetMap**: Free, open-source but less feature-rich for places/directions
- **Google Maps Embed API**: Simpler but less interactive, limited customization

**API Requirements**:
- Google Maps JavaScript API (for map display)
- Google Places API (for real-time place enrichment)
- Google Directions API (for routing)
- Requires API key with all three services enabled

---

### 4. Location Data Enrichment Strategy

**Decision**: Hybrid LLM + Google Places API

**Rationale**:
- LLM generates initial location suggestions from training data
- Google Places API enriches with real-time data:
  - Current operating hours
  - Latest ratings and review counts
  - Phone numbers, websites
  - Photos
  - Business status (open/closed, temporarily closed, etc.)
- Provides best of both: LLM's contextual understanding + fresh data

**Implementation Approach**:
1. User submits query to LLM
2. LLM responds with structured location data (name, address, coordinates)
3. Backend makes parallel Google Places API calls for each location
4. Merge LLM response with Places data
5. Return enriched results to frontend

**Rate Limiting**:
- Max 10 locations per query (per spec)
- Batch Places API calls with Promise.all()
- Implement caching for repeat queries (session-only per stateless requirement)

---

### 5. LLM Prompt Engineering

**Decision**: Structured output format with JSON schema

**Rationale**:
- Need reliable, parseable location data from LLM
- Use system prompt to enforce JSON output format
- Include validation in prompt for location data completeness
- Fallback parsing for non-JSON responses

**Prompt Structure**:
```
System: You are a location search assistant. Return results as JSON array with:
[{name, address, lat, lng, type, description}]
Limit to 10 results. If location context missing, ask user to clarify.

User: {query}
```

**Best Practices**:
- Few-shot examples in system prompt
- Explicit JSON schema in prompt
- Validation of required fields (name, coordinates)
- Graceful degradation if parsing fails

---

### 6. State Management

**Decision**: React Context API + useState (no external state library)

**Rationale**:
- Stateless application (no persistence requirement)
- Simple state needs:
  - Current chat messages
  - Active location results
  - Map viewport state
  - Loading states
- React Context sufficient for global state (chat history)
- Component-level useState for local state
- No need for Redux/Zustand complexity

**State Structure**:
```typescript
// ChatContext
{
  messages: Message[],
  addMessage: (msg) => void,
  isLoading: boolean
}

// MapContext
{
  locations: Location[],
  selectedLocation: Location | null,
  viewport: { center, zoom }
}
```

---

### 7. Type Safety & Validation

**Decision**: TypeScript + Zod for runtime validation

**Rationale**:
- **TypeScript**: Compile-time type safety throughout application
- **Zod**: Runtime validation for:
  - API request/response payloads
  - LLM output parsing
  - Environment variables
  - Google Places API responses

**Key Type Definitions**:
```typescript
// Location entity
interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  placeType: string;
  description?: string;
  enrichedData?: PlacesEnrichedData;
}

// Places enriched data
interface PlacesEnrichedData {
  rating?: number;
  hours?: string;
  phone?: string;
  website?: string;
  photos?: string[];
  businessStatus?: string;
}
```

---

### 8. Error Handling & Resilience

**Decision**: Layered error handling with user-friendly messages

**Error Categories**:
1. **LLM Errors**:
   - Connection failed (Ollama/LM Studio not running)
   - Timeout (> 3 seconds)
   - Invalid response format
   - **Handling**: Show error message, suggest checking LLM service

2. **Google Maps API Errors**:
   - API key invalid/missing
   - Quota exceeded
   - Network error
   - **Handling**: Show fallback message, basic location list without map

3. **Places API Errors**:
   - Rate limit exceeded
   - Location not found
   - **Handling**: Show LLM data only, indicate enrichment unavailable

4. **User Input Errors**:
   - Ambiguous location (no geographic context)
   - **Handling**: Prompt for clarification per FR-012

**Implementation**:
- try/catch blocks in all API routes
- Error boundary components in React
- Toast notifications for transient errors
- Detailed error logging (console) for debugging

---

### 9. Testing Strategy

**Decision**: Multi-layer testing approach

**Test Layers**:

1. **Unit Tests (Vitest + React Testing Library)**:
   - lib/ utilities (LLM clients, parsers, API clients)
   - Individual React components
   - Type/schema validators
   - Coverage target: 80%+

2. **Integration Tests (Vitest)**:
   - API routes with mocked external services
   - LLM client with mock responses
   - Places enrichment flow
   - Error handling paths

3. **E2E Tests (Playwright)**:
   - Critical user flows (P1, P2 user stories)
   - Query → Map display → Location selection
   - Directions request flow
   - Error scenarios (LLM offline, Maps API failure)
   - Coverage: All acceptance scenarios from spec

**Mocking Strategy**:
- Mock Ollama/LM Studio responses in tests
- Mock Google Maps/Places APIs
- Use MSW (Mock Service Worker) for API mocking
- Test fixtures for common responses

---

### 10. Development & Deployment

**Decision**: Local development with environment-based configuration

**Development Setup**:
- Next.js dev server (port 3000)
- Ollama/LM Studio running locally
- Environment variables in `.env.local`:
  - `GOOGLE_MAPS_API_KEY`
  - `LLM_PROVIDER` (ollama/lmstudio)
  - `LLM_BASE_URL` (default: http://localhost:11434 or http://localhost:1234)
  - `LLM_MODEL` (e.g., llama2, mistral)

**Deployment Considerations**:
- Single-user application (local deployment primary use case)
- Could containerize with Docker for easier setup
- LLM must run on same machine or accessible network
- Google Maps API key must be configured

**Build Process**:
- TypeScript compilation with strict mode
- Next.js production build
- Environment validation on startup
- Health check endpoint for LLM connectivity

---

## Open Questions & Risks

### Risks

1. **LLM Response Quality**:
   - Risk: LLM may not always return valid location data
   - Mitigation: Strong prompt engineering, validation, fallback parsing

2. **Google Maps API Costs**:
   - Risk: Exceeding free tier with heavy use
   - Mitigation: Single-user focus, request caching, monitoring

3. **LLM Performance**:
   - Risk: Local LLM may be slow on lower-end hardware
   - Mitigation: Loading states, streaming responses, model size recommendations

4. **Browser Compatibility**:
   - Risk: Older browsers may not support all features
   - Mitigation: Target modern browsers, test on Chrome/Firefox/Safari/Edge

### Future Enhancements (Out of Scope for MVP)

- Query history with opt-in (future phase per clarifications)
- Multi-language support (currently English-only assumption)
- Offline mode with cached data
- Custom map styles/themes
- Voice input for queries
- Saved favorite locations (requires persistence)

---

## Dependencies & Prerequisites

### External Services
- Google Maps JavaScript API
- Google Places API
- Google Directions API
- Ollama (v0.1.0+) or LM Studio (v0.2.0+)

### Development Tools
- Node.js 18+ and npm/pnpm/yarn
- TypeScript 5.x
- Git

### Recommended LLM Models
- Ollama: llama2:7b, mistral:7b, or similar 7B parameter models
- LM Studio: Any chat-capable model (Llama 2, Mistral, etc.)
- Minimum: 8GB RAM, 4 CPU cores for reasonable performance

---

## Next Steps

Phase 1 tasks:
1. Generate data-model.md (entity schemas)
2. Define API contracts (OpenAPI specs for routes)
3. Create quickstart.md (setup instructions)
4. Update agent context with technology stack
