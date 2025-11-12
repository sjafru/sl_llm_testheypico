# Data Model: Local LLM with Google Maps Integration

**Feature**: 001-llm-maps-integration
**Date**: 2025-11-12
**Phase**: 1 - Data Model Design

## Overview

This document defines the data entities, their attributes, relationships, validation rules, and state transitions for the LLM Maps Integration feature. All entities are runtime-only (stateless per FR-015) with no persistence.

---

## Entity Definitions

### 1. UserQuery

Represents a natural language question or request submitted by the user.

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string (UUID) | Yes | Unique identifier for the query | UUID v4 format |
| text | string | Yes | The raw user input query | 1-500 characters, non-empty |
| timestamp | Date | Yes | When query was submitted | ISO 8601 timestamp |
| hasLocationContext | boolean | Yes | Whether query includes geographic context | Derived from query analysis |
| queryType | QueryType | Yes | Categorized query intent | Enum: place_search, directions, general |
| placeTypes | string[] | No | Extracted place categories | Array of valid place types |
| locationHint | string | No | Extracted location context | City, neighborhood, "nearby", etc. |

**TypeScript Interface**:
```typescript
enum QueryType {
  PLACE_SEARCH = 'place_search',
  DIRECTIONS = 'directions',
  GENERAL = 'general'
}

interface UserQuery {
  id: string;
  text: string;
  timestamp: Date;
  hasLocationContext: boolean;
  queryType: QueryType;
  placeTypes?: string[];
  locationHint?: string;
}
```

**Validation Rules**:
- text must be non-empty and <= 500 characters
- queryType must be one of enum values
- placeTypes array max length: 5
- Ambiguous queries (hasLocationContext=false for place_search) trigger clarification prompt (FR-012)

**State Lifecycle**: Created → Analyzed → Sent to LLM → Discarded (stateless)

---

### 2. LocationSuggestion

Represents a place recommended by the LLM, optionally enriched with real-time data.

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string | Yes | Unique identifier | UUID v4 or Google Place ID |
| name | string | Yes | Place name | 1-200 characters |
| address | string | Yes | Full address | 1-500 characters |
| coordinates | Coordinates | Yes | Geographic location | Valid lat/lng |
| placeType | string | Yes | Category of place | Valid place type (restaurant, park, etc.) |
| description | string | No | Brief description from LLM | 0-500 characters |
| enrichedData | PlacesEnrichedData | No | Real-time data from Google Places | Object or null |
| source | DataSource | Yes | Origin of data | Enum: llm, llm_enriched |

**Nested Type: Coordinates**:
```typescript
interface Coordinates {
  lat: number;  // -90 to 90
  lng: number;  // -180 to 180
}
```

**Nested Type: PlacesEnrichedData**:
```typescript
interface PlacesEnrichedData {
  placeId: string;           // Google Place ID
  rating?: number;           // 1.0-5.0
  userRatingsTotal?: number; // Non-negative integer
  priceLevel?: number;       // 0-4
  openingHours?: string;     // Formatted hours string
  phoneNumber?: string;      // Formatted phone
  website?: string;          // Valid URL
  photos?: PlacePhoto[];     // Array of photo references
  businessStatus?: string;   // OPERATIONAL, CLOSED_TEMPORARILY, etc.
  lastUpdated: Date;         // When enrichment occurred
}

interface PlacePhoto {
  reference: string;
  width: number;
  height: number;
}
```

**TypeScript Interface**:
```typescript
enum DataSource {
  LLM = 'llm',
  LLM_ENRICHED = 'llm_enriched'
}

interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  placeType: string;
  description?: string;
  enrichedData?: PlacesEnrichedData;
  source: DataSource;
}
```

**Validation Rules**:
- name must be non-empty and <= 200 characters
- coordinates.lat between -90 and 90
- coordinates.lng between -180 and 180
- enrichedData.rating between 1.0 and 5.0 if present
- enrichedData.website must be valid URL if present
- Maximum 10 LocationSuggestions per query (FR-002)

**Relationships**:
- Generated from UserQuery (one-to-many: one query → multiple suggestions)
- Associated with MapMarker (one-to-one) for display

**State Lifecycle**: Created from LLM → Enrichment (optional) → Displayed → Selected (optional) → Discarded

---

### 3. ChatMessage

Represents a single message in the chat interface.

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string (UUID) | Yes | Unique message identifier | UUID v4 |
| role | MessageRole | Yes | Who sent the message | Enum: user, assistant, system |
| content | string | Yes | Message text content | 1-5000 characters |
| timestamp | Date | Yes | When message was created | ISO 8601 timestamp |
| locations | LocationSuggestion[] | No | Attached location data | Max 10 items |
| messageType | MessageType | Yes | Type of message | Enum: text, location_results, error, clarification |
| metadata | MessageMetadata | No | Additional message data | Object or undefined |

**Nested Type: MessageMetadata**:
```typescript
interface MessageMetadata {
  queryId?: string;           // Reference to UserQuery
  error?: {
    code: string;
    message: string;
  };
  processingTime?: number;    // Milliseconds
}
```

**TypeScript Interface**:
```typescript
enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

enum MessageType {
  TEXT = 'text',
  LOCATION_RESULTS = 'location_results',
  ERROR = 'error',
  CLARIFICATION = 'clarification'
}

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  locations?: LocationSuggestion[];
  messageType: MessageType;
  metadata?: MessageMetadata;
}
```

**Validation Rules**:
- content must be non-empty and <= 5000 characters
- locations array max length: 10 (per FR-002)
- role must be valid enum value
- If messageType is location_results, locations must be non-empty

**Relationships**:
- Contains LocationSuggestion[] for location result messages
- References UserQuery via metadata.queryId

**State Lifecycle**: Created → Added to Chat → Displayed → Discarded on session end

---

### 4. MapViewport

Represents the current state of the map view.

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| center | Coordinates | Yes | Map center point | Valid lat/lng |
| zoom | number | Yes | Zoom level | 1-20 (Google Maps range) |
| bounds | MapBounds | No | Visible map boundaries | Valid coordinates |
| markers | MapMarker[] | Yes | Displayed markers | Max 10 items |

**Nested Type: MapBounds**:
```typescript
interface MapBounds {
  north: number;  // -90 to 90
  south: number;  // -90 to 90
  east: number;   // -180 to 180
  west: number;   // -180 to 180
}
```

**Nested Type: MapMarker**:
```typescript
interface MapMarker {
  id: string;                  // Matches LocationSuggestion.id
  position: Coordinates;
  label?: string;              // Single letter or number
  icon?: string;               // Icon URL or type
  infoWindowContent?: string;  // HTML content for info window
  isSelected: boolean;
}
```

**TypeScript Interface**:
```typescript
interface MapViewport {
  center: Coordinates;
  zoom: number;
  bounds?: MapBounds;
  markers: MapMarker[];
}
```

**Validation Rules**:
- zoom must be between 1 and 20
- bounds coordinates must form valid rectangle (north > south, etc.)
- markers array max length: 10 (matches max locations per query)

**Relationships**:
- MapMarker.id references LocationSuggestion.id (one-to-one)
- Updated when new LocationSuggestion[] received

**State Lifecycle**: Initialized → Updated on location results → Updated on user interaction → Reset on new query

---

### 5. DirectionsRequest

Represents a request for routing directions.

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string (UUID) | Yes | Unique request identifier | UUID v4 |
| origin | Coordinates \| string | Yes | Starting point | Valid coordinates or address |
| destination | Coordinates | Yes | End point | Valid coordinates |
| travelMode | TravelMode | Yes | Mode of transportation | Enum: driving, walking, bicycling, transit |
| timestamp | Date | Yes | When request was made | ISO 8601 timestamp |

**TypeScript Interface**:
```typescript
enum TravelMode {
  DRIVING = 'driving',
  WALKING = 'walking',
  BICYCLING = 'bicycling',
  TRANSIT = 'transit'
}

interface DirectionsRequest {
  id: string;
  origin: Coordinates | string;
  destination: Coordinates;
  travelMode: TravelMode;
  timestamp: Date;
}
```

**Validation Rules**:
- origin must be valid coordinates or non-empty string address
- destination must be valid coordinates
- travelMode must be valid enum value

**Relationships**:
- destination references LocationSuggestion.coordinates
- Generates DirectionsResponse

**State Lifecycle**: Created → Sent to Directions API → Response received → Displayed → Discarded

---

### 6. DirectionsResponse

Represents routing information from Google Directions API.

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | string (UUID) | Yes | Unique response identifier | UUID v4 |
| requestId | string | Yes | References DirectionsRequest | UUID v4 |
| routes | Route[] | Yes | Available routes | Non-empty array |
| status | string | Yes | API response status | Google Directions status |

**Nested Type: Route**:
```typescript
interface Route {
  summary: string;              // Route name/description
  legs: RouteLeg[];
  overviewPolyline: string;     // Encoded polyline for map
  bounds: MapBounds;
  copyrights: string;
  warnings: string[];
}

interface RouteLeg {
  distance: { value: number; text: string };
  duration: { value: number; text: string };
  startAddress: string;
  endAddress: string;
  steps: RouteStep[];
}

interface RouteStep {
  instruction: string;           // HTML instructions
  distance: { value: number; text: string };
  duration: { value: number; text: string };
  startLocation: Coordinates;
  endLocation: Coordinates;
}
```

**TypeScript Interface**:
```typescript
interface DirectionsResponse {
  id: string;
  requestId: string;
  routes: Route[];
  status: string;
}
```

**Validation Rules**:
- routes must be non-empty array if status is OK
- requestId must reference valid DirectionsRequest
- status must be valid Google Directions status

**Relationships**:
- Generated from DirectionsRequest (one-to-one)
- Displayed in MapViewport as polyline overlay

**State Lifecycle**: Received from API → Parsed → Displayed on map → Discarded

---

## Entity Relationships Diagram

```
UserQuery (1) ──┐
                ├─> generates ──> LocationSuggestion (0-10) ──┐
                │                                             │
                ↓                                             │
         ChatMessage (N) ─> contains ────────────────────────┘
                                                              │
                                                              ↓
                                                        MapMarker (1:1)
                                                              │
                                                              ↓
                                                        MapViewport (1)

LocationSuggestion (1) ──> DirectionsRequest (0-1) ──> DirectionsResponse (0-1)
```

---

## Validation Schema (Zod)

```typescript
import { z } from 'zod';

// Coordinates
const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// UserQuery
const UserQuerySchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(500),
  timestamp: z.date(),
  hasLocationContext: z.boolean(),
  queryType: z.enum(['place_search', 'directions', 'general']),
  placeTypes: z.array(z.string()).max(5).optional(),
  locationHint: z.string().optional(),
});

// LocationSuggestion
const LocationSuggestionSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  coordinates: CoordinatesSchema,
  placeType: z.string(),
  description: z.string().max(500).optional(),
  enrichedData: z.object({
    placeId: z.string(),
    rating: z.number().min(1).max(5).optional(),
    userRatingsTotal: z.number().int().nonnegative().optional(),
    priceLevel: z.number().int().min(0).max(4).optional(),
    openingHours: z.string().optional(),
    phoneNumber: z.string().optional(),
    website: z.string().url().optional(),
    photos: z.array(z.object({
      reference: z.string(),
      width: z.number(),
      height: z.number(),
    })).optional(),
    businessStatus: z.string().optional(),
    lastUpdated: z.date(),
  }).optional(),
  source: z.enum(['llm', 'llm_enriched']),
});

// ChatMessage
const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(5000),
  timestamp: z.date(),
  locations: z.array(LocationSuggestionSchema).max(10).optional(),
  messageType: z.enum(['text', 'location_results', 'error', 'clarification']),
  metadata: z.object({
    queryId: z.string().uuid().optional(),
    error: z.object({
      code: z.string(),
      message: z.string(),
    }).optional(),
    processingTime: z.number().optional(),
  }).optional(),
});

// DirectionsRequest
const DirectionsRequestSchema = z.object({
  id: z.string().uuid(),
  origin: z.union([CoordinatesSchema, z.string().min(1)]),
  destination: CoordinatesSchema,
  travelMode: z.enum(['driving', 'walking', 'bicycling', 'transit']),
  timestamp: z.date(),
});
```

---

## State Management Strategy

### React Context Structure

```typescript
// ChatContext - manages chat messages
interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// MapContext - manages map state
interface MapContextType {
  viewport: MapViewport;
  updateViewport: (viewport: Partial<MapViewport>) => void;
  locations: LocationSuggestion[];
  setLocations: (locations: LocationSuggestion[]) => void;
  selectedLocation: LocationSuggestion | null;
  selectLocation: (location: LocationSuggestion | null) => void;
  directionsResponse: DirectionsResponse | null;
  setDirectionsResponse: (response: DirectionsResponse | null) => void;
}
```

### Stateless Architecture (FR-015)

- All entity data exists only in React state (memory)
- No localStorage, sessionStorage, or database persistence
- Page refresh clears all data
- Each user session is independent
- Context providers initialize with empty/default state

---

## Error States

### Location Suggestion Errors
- No results found: Return empty array with system message
- Invalid coordinates: Skip location, log warning
- Enrichment failure: Return LLM data only, mark enrichedData as null

### Query Errors
- Ambiguous location: Set hasLocationContext=false, trigger clarification
- Empty query: Validate before sending to LLM
- LLM timeout: Set error message in ChatMessage

### Map Errors
- Invalid coordinates: Default to center of results or [0, 0]
- Map load failure: Show location list without map
- Directions failure: Show error message, disable directions UI

---

## Performance Considerations

### Data Size Limits
- Max 10 LocationSuggestions per query (FR-002)
- Max 100 ChatMessages in memory (older messages can be truncated)
- Photos limited to 5 per location for performance
- Polylines compressed using Google's encoding

### Caching Strategy
- No persistent caching (stateless requirement)
- Session-only memoization for API responses
- React component memoization for expensive renders
- Map marker clustering if needed (future enhancement)

---

## Next Steps

1. Implement TypeScript interfaces and Zod schemas in `types/` directory
2. Create API contracts based on these entities
3. Build services that operate on these entities
4. Write unit tests for validation logic
