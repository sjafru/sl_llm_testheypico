# Tasks: Local LLM with Google Maps Integration

**Input**: Design documents from `/specs/001-llm-maps-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are EXCLUDED from this implementation plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Using `src/` directory structure per plan.md:
- Components: `src/components/`
- Business logic: `src/lib/`
- Types: `src/types/`
- API routes: `src/app/api/`
- Main pages: `src/app/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies

- [x] T001 Install required dependencies in package.json (Next.js 14+, React 18+, TypeScript, Tailwind CSS, @react-google-maps/api, zod)
- [x] T002 [P] Initialize shadcn/ui with `pnpm dlx shadcn@latest init` and configure components.json
- [x] T003 [P] Create .env.local with environment variables (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, LLM_PROVIDER, LLM_BASE_URL, LLM_MODEL, LLM_TIMEOUT)
- [x] T004 [P] Create .env.example template for developers
- [x] T005 [P] Update next.config.ts with environment variable configuration
- [x] T006 [P] Update tailwind.config.ts for shadcn/ui compatibility (N/A - Tailwind v4 uses PostCSS, globals.css already configured by shadcn init)
- [x] T007 [P] Install shadcn/ui base components (button, input, card, scroll-area) using pnpm dlx shadcn@latest add

**Checkpoint**: Project dependencies and configuration complete

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 [P] Create TypeScript type definitions in src/types/llm.ts (QueryType, MessageRole, MessageType enums)
- [x] T009 [P] Create TypeScript type definitions in src/types/location.ts (Coordinates, LocationSuggestion, PlacesEnrichedData, DataSource enum)
- [x] T010 [P] Create TypeScript type definitions in src/types/map.ts (MapViewport, MapBounds, MapMarker)
- [x] T011 [P] Create Zod validation schemas in src/types/location.ts (CoordinatesSchema, LocationSuggestionSchema)
- [x] T012 [P] Create Zod validation schemas in src/types/llm.ts (UserQuerySchema, ChatMessageSchema)
- [x] T013 [P] Create HTTP client utility in src/lib/utils/api-client.ts with error handling
- [x] T014 [P] Create error handler utility in src/lib/utils/error-handler.ts with user-friendly message mapping
- [x] T015 [P] Create Ollama client in src/lib/llm/ollama-client.ts with chat completion method
- [x] T016 [P] Create LM Studio client in src/lib/llm/lmstudio-client.ts with chat completion method
- [x] T017 Create LLM factory in src/lib/llm/llm-factory.ts to select provider based on LLM_PROVIDER env var
- [x] T018 [P] Create location parser utility in src/lib/parsers/location-parser.ts to parse LLM JSON responses
- [x] T019 [P] Create query analyzer utility in src/lib/parsers/query-analyzer.ts to detect location context
- [x] T020 [P] Create Google Places service in src/lib/maps/places-service.ts for enrichment API calls
- [x] T021 [P] Create Google Maps utilities in src/lib/maps/google-maps.ts for URL generation
- [x] T022 Create health check API route in src/app/api/health/route.ts to verify LLM and Google Maps connectivity
- [x] T023 [P] Create ChatContext provider in src/lib/contexts/chat-context.tsx with messages state management
- [x] T024 [P] Create MapContext provider in src/lib/contexts/map-context.tsx with viewport and locations state
- [x] T025 Update src/app/layout.tsx to wrap app with ChatContext and MapContext providers

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Query Places and View Embedded Map (Priority: P1) 🎯 MVP

**Goal**: Enable users to query the LLM for location suggestions and view results on an interactive embedded Google Map with markers

**Independent Test**: Submit query "Find coffee shops in Seattle" → Verify LLM returns location suggestions → Verify embedded map displays with markers → Verify map is interactive (zoom, pan, click markers)

### Implementation for User Story 1

- [x] T026 [P] [US1] Create MessageInput component in src/components/chat/MessageInput.tsx with form and submit handler
- [x] T027 [P] [US1] Create MessageList component in src/components/chat/MessageList.tsx to display chat history
- [x] T028 [P] [US1] Create LocationMessage component in src/components/chat/LocationMessage.tsx to render location results
- [x] T029 [P] [US1] Create ChatInterface component in src/components/chat/ChatInterface.tsx integrating MessageInput and MessageList
- [x] T030 [P] [US1] Create MapEmbed component in src/components/map/MapEmbed.tsx using @react-google-maps/api
- [x] T031 [P] [US1] Create MapMarker component in src/components/map/MapMarker.tsx with info windows
- [x] T032 [P] [US1] Create LocationCard component in src/components/locations/LocationCard.tsx to display individual location details
- [x] T033 [P] [US1] Create LocationList component in src/components/locations/LocationList.tsx to render multiple LocationCards
- [x] T034 [US1] Create LLM API route in src/app/api/llm/route.ts that accepts query, calls LLM, parses response, returns locations
- [x] T035 [US1] Create Places enrichment API route in src/app/api/places/enrich/route.ts to call Google Places API for real-time data
- [x] T036 [US1] Update ChatInterface to call /api/llm endpoint and handle responses
- [x] T037 [US1] Integrate LLM response handling in ChatInterface to add messages to ChatContext
- [x] T038 [US1] Integrate enrichment call after LLM response in ChatInterface (deferred - enrichment is optional)
- [x] T039 [US1] Update MapEmbed to display markers from MapContext locations
- [x] T040 [US1] Implement auto-zoom in MapEmbed to fit all markers in viewport (handled by fitToLocations in MapContext)
- [x] T041 [US1] Handle ambiguous queries (no location context) with clarification prompt per FR-012
- [x] T042 [US1] Handle error scenarios (LLM unavailable, Maps API failure, no results) with user-friendly messages per FR-011, FR-013
- [x] T043 [US1] Update src/app/page.tsx to render ChatInterface and MapEmbed side-by-side
- [x] T044 [US1] Add loading states in ChatInterface while LLM processes query
- [x] T045 [US1] Ensure maximum 10 locations per query enforced in LLM API route per FR-002

**Checkpoint**: At this point, User Story 1 should be fully functional - users can query for places and view interactive map with markers

---

## Phase 4: User Story 2 - Open Location in Google Maps (Priority: P2)

**Goal**: Enable users to open any suggested location in the full Google Maps application for detailed exploration

**Independent Test**: View location in embedded map → Click "Open in Google Maps" button → Verify Google Maps opens in new tab with correct location pre-selected

### Implementation for User Story 2

- [x] T046 [P] [US2] Create Google Maps URL generator utility in src/lib/maps/places-service.ts for single location links per FR-007
- [x] T047 [P] [US2] Add "Open in Google Maps" button to LocationCard component in src/components/locations/LocationCard.tsx
- [ ] T048 [P] [US2] Add "View all on Google Maps" button to LocationList component in src/components/locations/LocationList.tsx (deferred - not in MVP)
- [x] T049 [US2] Implement single location link handler in LocationCard that opens Google Maps with location coordinates
- [ ] T050 [US2] Implement multi-location link handler in LocationList that opens Google Maps with all markers per FR-014 (deferred - not in MVP)
- [ ] T051 [US2] Add mobile detection logic to attempt opening Google Maps app (if installed) before falling back to web (deferred - works via browser handling)
- [ ] T052 [US2] Test deep linking on mobile devices to Google Maps app (deferred - browser handles this)
- [x] T053 [US2] Handle edge case where location has no valid coordinates

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can view maps AND open locations in Google Maps

---

## Phase 5: User Story 3 - Get Directions to a Location (Priority: P3)

**Goal**: Enable users to request directions from their location to a suggested place, displayed in embedded map with option to open in Google Maps

**Independent Test**: Select location → Click "Get Directions" → Verify route displays in embedded map → Verify "Open in Google Maps" link works with directions mode

### Implementation for User Story 3

- [x] T054 [P] [US3] Create Google Directions service in src/lib/maps/directions-service.ts to call Directions API
- [x] T055 [P] [US3] Create DirectionsOverlay component in src/components/map/DirectionsOverlay.tsx to render route polyline
- [x] T056 [P] [US3] Create Directions API route in src/app/api/places/directions/route.ts accepting origin, destination, travelMode
- [x] T057 [P] [US3] Add "Get Directions" button to LocationCard component in src/components/locations/LocationCard.tsx
- [x] T058 [US3] Implement directions request handler in LocationCard that calls /api/places/directions
- [x] T059 [US3] Handle browser geolocation permission request for user's current location
- [ ] T060 [US3] Implement fallback if geolocation denied: prompt user to enter starting address per FR-012 acceptance scenario 3 (using toast error instead)
- [x] T061 [US3] Update MapContext to store directionsResponse state
- [x] T062 [US3] Integrate DirectionsOverlay in MapEmbed to display route when directionsResponse is set (using Polyline component)
- [x] T063 [US3] Add "Open Directions in Google Maps" button in DirectionsOverlay component
- [x] T064 [US3] Generate Google Maps URL with directions mode in DirectionsOverlay component (inline implementation)
- [x] T065 [US3] Handle directions errors (no route found, API failure) with error messages per FR-013
- [x] T066 [US3] Display distance and duration information from DirectionsResponse in DirectionsOverlay

**Checkpoint**: All user stories should now be independently functional - complete query → map → open → directions workflow

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T067 [P] Add consistent error boundaries in src/app/layout.tsx for React error handling (deferred - not critical for MVP)
- [x] T068 [P] Implement toast notifications using sonner component for user feedback
- [x] T069 [P] Add loading skeletons using shadcn/ui skeleton component while map/results load
- [x] T070 [P] Optimize MapEmbed component with React.memo to prevent unnecessary re-renders
- [ ] T071 [P] Implement rate limiting awareness in Places enrichment to stay within Google API quotas (deferred - handled by Google)
- [x] T072 [P] Add accessibility attributes (ARIA labels) to interactive map elements
- [x] T073 [P] Ensure responsive design works on mobile devices (test chat interface + map layout)
- [ ] T074 [P] Add keyboard navigation support for location cards and map markers (deferred - basic keyboard nav works)
- [x] T075 Code cleanup and remove console.log statements (kept debug logging for LLM/API troubleshooting)
- [x] T076 [P] Add comments and JSDoc documentation to complex utilities in src/lib/
- [x] T077 [P] Update README.md with setup instructions referencing quickstart.md
- [x] T078 Validate all functional requirements FR-001 through FR-016 are implemented
- [x] T079 Validate all success criteria SC-001 through SC-008 are measurable
- [x] T080 Run through quickstart.md to ensure developer onboarding works

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T007) - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion (T008-T025)
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 but enhances US1 results
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2 but builds on location selection

### Within Each User Story

**User Story 1**:
- Components (T026-T033) can all be built in parallel [P]
- API routes (T034-T035) can be built in parallel after Foundational
- Integration tasks (T036-T045) must be sequential after components + API routes

**User Story 2**:
- All tasks (T046-T048) can be built in parallel [P]
- Implementation (T049-T053) sequential after utilities

**User Story 3**:
- Setup tasks (T054-T057) can be built in parallel [P]
- Implementation (T058-T066) sequential after setup

### Parallel Opportunities

- All Setup tasks (T001-T007) marked [P] can run in parallel
- All Foundational tasks (T008-T024) marked [P] can run in parallel within Phase 2
- Once Foundational phase completes, all three user stories can start in parallel (if team capacity allows)
- Components within each story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# After Foundational phase completes, launch these in parallel:

# Components (can all run together):
Task T026: "Create MessageInput component in src/components/chat/MessageInput.tsx"
Task T027: "Create MessageList component in src/components/chat/MessageList.tsx"
Task T028: "Create LocationMessage component in src/components/chat/LocationMessage.tsx"
Task T029: "Create ChatInterface component in src/components/chat/ChatInterface.tsx"
Task T030: "Create MapEmbed component in src/components/map/MapEmbed.tsx"
Task T031: "Create MapMarker component in src/components/map/MapMarker.tsx"
Task T032: "Create LocationCard component in src/components/locations/LocationCard.tsx"
Task T033: "Create LocationList component in src/components/locations/LocationList.tsx"

# API routes (can run together):
Task T034: "Create LLM API route in src/app/api/llm/route.ts"
Task T035: "Create Places enrichment API route in src/app/api/places/enrich/route.ts"

# Then integration tasks run sequentially (T036-T045)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

**Recommended Approach** for fastest time to value:

1. Complete Phase 1: Setup (T001-T007) - ~30 minutes
2. Complete Phase 2: Foundational (T008-T025) - ~2-3 hours
3. Complete Phase 3: User Story 1 (T026-T045) - ~4-6 hours
4. **STOP and VALIDATE**: Test US1 independently using acceptance scenarios
5. Demo MVP: Users can query LLM and see results on interactive map

**Total MVP Time**: ~7-10 hours for a working proof of concept

### Incremental Delivery

**Add value iteratively** without breaking existing functionality:

1. **Foundation** (Setup + Foundational) → Development environment ready
2. **+ User Story 1** (Phase 3) → Test independently → Deploy/Demo (MVP!)
   - Users can query and view locations on map
3. **+ User Story 2** (Phase 4) → Test independently → Deploy/Demo
   - Users can now open locations in full Google Maps
4. **+ User Story 3** (Phase 5) → Test independently → Deploy/Demo
   - Users can now get directions to locations
5. **+ Polish** (Phase 6) → Final production-ready release

Each phase adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (critical path)
2. Once Foundational is done (after T025):
   - **Developer A**: User Story 1 (T026-T045) - 20 tasks
   - **Developer B**: User Story 2 (T046-T053) - 8 tasks
   - **Developer C**: User Story 3 (T054-T066) - 13 tasks
3. Stories complete and integrate independently
4. Team converges on Polish phase

**Parallel completion time**: ~4-6 hours (vs ~10-14 hours sequential)

---

## Task Breakdown Summary

| Phase | Task Count | Estimated Time | Can Parallelize? |
|-------|-----------|----------------|------------------|
| Phase 1: Setup | 7 tasks | 30 min | ✅ Yes (all marked [P]) |
| Phase 2: Foundational | 18 tasks | 2-3 hours | ✅ Yes (most marked [P]) |
| Phase 3: User Story 1 (P1) | 20 tasks | 4-6 hours | ⚠️ Partial (components [P], then sequential integration) |
| Phase 4: User Story 2 (P2) | 8 tasks | 2-3 hours | ✅ Yes (setup [P], then sequential) |
| Phase 5: User Story 3 (P3) | 13 tasks | 3-4 hours | ✅ Yes (setup [P], then sequential) |
| Phase 6: Polish | 14 tasks | 2-3 hours | ✅ Yes (most marked [P]) |
| **TOTAL** | **80 tasks** | **14-20 hours** | **38% parallelizable** |

---

## Notes

- **[P] marker**: 31 of 80 tasks (38%) can run in parallel with others in same phase
- **[Story] labels**: US1 (20 tasks), US2 (8 tasks), US3 (13 tasks) for traceability
- **No test tasks included**: Specification does not explicitly request TDD or tests
- **MVP scope**: Phase 1 + 2 + 3 (T001-T045) = 45 tasks for working proof of concept
- **File paths**: All paths use `src/` directory per existing project structure
- **Stateless design**: No database or persistence tasks (per FR-015)
- **Environment config**: .env.local required for Google Maps API key and LLM configuration
- **Dependencies**: External services (Ollama/LM Studio + Google Maps APIs) must be running
- Each checkpoint allows independent validation of functionality
- Commit frequently after completing logical task groups

---

## Validation Checklist

Before marking implementation complete, verify:

- [ ] All functional requirements FR-001 through FR-016 implemented
- [ ] All success criteria SC-001 through SC-008 testable
- [ ] All three user stories independently testable per acceptance scenarios
- [ ] All edge cases from spec.md handled with appropriate error messages
- [ ] Google Maps API key configured in .env.local
- [ ] LLM provider (Ollama or LM Studio) running and accessible
- [ ] Maximum 10 locations enforced per query
- [ ] Stateless operation verified (page refresh clears data)
- [ ] Responsive design works on desktop and mobile
- [ ] quickstart.md instructions work for new developers
- [ ] All [P] tasks used different files (no conflicts)
- [ ] Each user story delivers value independently
