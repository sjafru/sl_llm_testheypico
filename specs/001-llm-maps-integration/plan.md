# Implementation Plan: Local LLM with Google Maps Integration

**Branch**: `001-llm-maps-integration` | **Date**: 2025-11-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-llm-maps-integration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a web application that runs a local Large Language Model (via LM Studio or Ollama) to provide natural language location search capabilities. Users can query for places (restaurants, parks, shops, etc.) and receive visual results on an embedded Google Map with up to 10 location suggestions. The system uses a hybrid approach: LLM suggests places from its training data, then enriches results with real-time data from Google Places API. The frontend is built with Next.js and shadcn UI components, providing an interactive chat-like interface with embedded maps and directions.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend/backend), Node.js 18+ (runtime)
**Primary Dependencies**:
- Frontend: Next.js 14+ (App Router), React 18+, shadcn/ui, Tailwind CSS, @react-google-maps/api
- Backend: Next.js API Routes, Ollama client SDK or LM Studio API client
- LLM: Ollama or LM Studio (local inference)
- External APIs: Google Maps JavaScript API, Google Places API

**Storage**: Stateless (no persistence per FR-015) - session-only state in React context/state
**Testing**: Vitest (unit), Playwright (E2E), React Testing Library (component)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge) on desktop and mobile
**Project Type**: Web (full-stack Next.js application)
**Performance Goals**:
- LLM response within 3 seconds (SC-008)
- Full query-to-map workflow within 5 seconds (SC-001)
- Support 10 concurrent users (single-user focus with local LLM)

**Constraints**:
- Local LLM inference (Ollama/LM Studio must be running locally)
- Google Maps API quota limits (per free/paid tier)
- Maximum 10 location results per query (per clarifications)
- Stateless operation (no query history)

**Scale/Scope**:
- Single-user application (local LLM deployment)
- ~5-8 React components (chat interface, map component, location cards)
- ~3-4 API routes (LLM proxy, Places enrichment, directions)
- 1-2 external service integrations (Google Maps/Places)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASS (Constitution template is empty - no principles defined yet)

**Notes**: The project constitution at `.specify/memory/constitution.md` contains only placeholder content. Once project principles are established, this section should be re-evaluated to ensure compliance with:
- Architectural patterns
- Testing requirements
- Code organization standards
- Quality gates

**Recommendation**: Establish project constitution before implementing additional features to ensure consistency.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Next.js App Router Structure (with src/ directory)
src/
├── app/                        # Next.js App Router (EXISTING)
│   ├── api/                    # API routes (TO BE ADDED)
│   │   ├── llm/
│   │   │   └── route.ts       # LLM proxy (Ollama/LM Studio)
│   │   ├── places/
│   │   │   ├── enrich/
│   │   │   │   └── route.ts   # Google Places enrichment
│   │   │   └── directions/
│   │   │       └── route.ts   # Google Directions API
│   │   └── health/
│   │       └── route.ts       # Health check endpoint
│   ├── page.tsx                # Main chat interface page (EXISTING - to be updated)
│   ├── layout.tsx              # Root layout with providers (EXISTING - to be updated)
│   └── globals.css             # Global styles (EXISTING)
│
├── components/                 # React components (TO BE ADDED)
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ... (other shadcn components)
│   ├── chat/
│   │   ├── ChatInterface.tsx  # Main chat container
│   │   ├── MessageList.tsx    # Display chat messages
│   │   ├── MessageInput.tsx   # User input field
│   │   └── LocationMessage.tsx # Message with location results
│   ├── map/
│   │   ├── MapEmbed.tsx       # Google Maps component
│   │   ├── MapMarker.tsx      # Custom marker component
│   │   └── DirectionsOverlay.tsx # Directions display
│   └── locations/
│       ├── LocationCard.tsx   # Individual location display
│       └── LocationList.tsx   # List of location results
│
├── lib/                        # Business logic and utilities (TO BE ADDED)
│   ├── llm/
│   │   ├── ollama-client.ts   # Ollama API client
│   │   ├── lmstudio-client.ts # LM Studio API client
│   │   └── llm-factory.ts     # Factory to select LLM provider
│   ├── maps/
│   │   ├── google-maps.ts     # Google Maps API utilities
│   │   ├── places-service.ts  # Google Places API client
│   │   └── directions-service.ts # Directions API client
│   ├── parsers/
│   │   ├── location-parser.ts # Parse LLM location responses
│   │   └── query-analyzer.ts  # Analyze user queries
│   └── utils/
│       ├── api-client.ts      # HTTP client utilities
│       └── error-handler.ts   # Error handling utilities
│
├── types/                      # TypeScript type definitions (TO BE ADDED)
│   ├── llm.ts                  # LLM-related types
│   ├── location.ts             # Location entity types
│   └── map.ts                  # Map-related types
│
└── __tests__/                  # Tests (TO BE ADDED, or use tests/ in root)
    ├── unit/
    │   ├── lib/               # Unit tests for lib/
    │   └── components/        # Component tests
    ├── integration/
    │   ├── api/               # API route tests
    │   └── llm/               # LLM integration tests
    └── e2e/
        └── user-flows.spec.ts # End-to-end Playwright tests

# Root level files (EXISTING)
public/                         # Static assets (EXISTING)
.env.local                      # Environment variables (TO BE CREATED)
next.config.ts                  # Next.js configuration (EXISTING)
tsconfig.json                   # TypeScript config (EXISTING)
tailwind.config.ts              # Tailwind configuration (MAY NEED UPDATES)
components.json                 # shadcn/ui configuration (TO BE CREATED)
package.json                    # Dependencies (EXISTING - to be updated)
```

**Structure Decision**: Using Next.js 14+ App Router with `src/` directory structure. The project already has:
- ✅ `src/app/` - Next.js App Router pages and layouts
- ✅ Next.js configuration and dependencies
- ✅ TypeScript setup

**To be added**:
- 📁 `src/components/` - Feature components (chat, map, locations)
- 📁 `src/lib/` - Business logic and API clients
- 📁 `src/types/` - TypeScript interfaces and types
- 📁 `src/app/api/` - API routes for LLM and Google services
- 🔧 shadcn/ui components and configuration
- 🔧 Environment configuration for API keys

**Benefits of this structure**:
- Keeps all source code organized under `src/`
- API routes co-located with frontend code in `src/app/api/`
- Server and client components for optimal performance
- Built-in TypeScript support
- Clear separation: components/, lib/, types/
- Scalable testing structure

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitution violations (constitution not yet defined)
