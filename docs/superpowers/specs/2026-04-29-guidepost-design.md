# Guidepost — Design Spec

**Date:** 2026-04-29
**Scope:** Demo/prototype — nail the UX, extensible backend structure
**Status:** Approved

## Overview

Guidepost is a citizen-facing app for interacting with local government services through natural language. A user types a request (e.g., "There's a pothole on Boundary St"), and a pattern-matching agent resolves it to a structured action card with pre-filled council data, ready to submit.

Two screens: **Landing** (hero + typing animation + CTA) and **Engaged** (chat thread + action cards + quick chips).

## Architecture

```
Browser (React SPA)  <-- JSON -->  .NET 8 Minimal API  -->  In-Memory Data
     :3000                              :5000
```

Both run in Docker containers via `docker compose up`.

### Frontend — React SPA

- **Stack:** Vite + React + TypeScript
- **Styling:** CSS (faithful to mock — dark theme, Fraunces/Geist/JetBrains Mono fonts, lime-green accent `#dcff54` on `#0e0e10`)
- **No phone frame** — the app IS the screen content from the mock
- **Pages/Views:**
  - **Landing:** Hero with typing animation cycling through example queries, "Start asking" CTA, tagline, brand bar
  - **Chat:** Message thread (user messages + agent responses), action cards rendered inline, quick chip suggestions, input bar

### Backend — C# .NET 8 Minimal API

- **Pattern-matching engine:** Keyword-based classifier maps user messages to scenario templates
- **In-memory data store:** Seeded councils, services, pattern rules, response templates, submitted reports
- **Service interface:** `IAgentService` with a `ProcessMessage` method — the pattern matcher implements this, but an LLM provider could replace it later

### API Endpoints

| Endpoint | Method | Purpose | Response Shape |
|---|---|---|---|
| `/api/chat` | POST | Send user message, get agent response | `{ message, actionCard?, quickChips[] }` |
| `/api/councils` | GET | List available councils | `{ councils[] }` |
| `/api/councils/{id}/services` | GET | Services a council offers | `{ services[] }` |
| `/api/reports` | POST | Submit a completed action card | `{ reportId, status }` |
| `/api/reports/{id}` | GET | Track report status | `{ reportId, status, timeline[] }` |

### Chat Request/Response

**Request:**
```json
{
  "councilId": "river-city",
  "message": "There's a pothole on Boundary St",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "message": "Got it. I'll lodge this with River City Council — average response is 2–3 days.",
  "actionCard": {
    "type": "report",
    "tag": "Report ready",
    "source": "RCC · Works request",
    "fields": [
      { "key": "Location", "value": "Boundary St, West End", "verified": true },
      { "key": "Type", "value": "Pothole / road defect", "verified": true },
      { "key": "Council ref", "value": "Pre-filled", "verified": true }
    ],
    "attachments": ["photo", "note"],
    "submitLabel": "Submit to River City Council"
  },
  "quickChips": ["Track this report", "Other issues nearby", "Bin day"]
}
```

## Demo Scenarios

### 1. Pothole / Road Defect (Report)
- **Triggers:** pothole, road, crack, footpath, pavement, sidewalk
- **Action card type:** Report submission
- **Fields:** Location, Type, Council ref
- **Attachments:** Photo, Note
- **Quick chips:** Track this report, Other issues nearby, Bin day

### 2. Bin Collection Day (Lookup)
- **Triggers:** bin, rubbish, recycling, waste, garbage, collection
- **Action card type:** Info lookup
- **Fields:** Address, Next collection date, Bin types (general/recycling/green)
- **Attachments:** None
- **Quick chips:** Set reminder, Missed collection, Bulk waste

### 3. Noise Complaint (Complaint)
- **Triggers:** noise, loud, barking, party, music, construction
- **Action card type:** Complaint submission
- **Fields:** Location, Noise type, Time/frequency, Description
- **Attachments:** Note
- **Quick chips:** Track this complaint, Noise regulations, Other issues

### 4. Dog Registration (Registration)
- **Triggers:** dog, pet, register, animal, puppy
- **Action card type:** Registration form
- **Fields:** Owner name, Dog breed, Microchip number, Registration fee
- **Attachments:** None
- **Quick chips:** Registration fees, Off-leash parks, Lost pets

## Visual Design

Faithful recreation of the mock's design system:

- **Background:** `#0e0e10` (near-black)
- **Text:** `#fafaf5` (warm white)
- **Accent:** `#dcff54` (lime green)
- **Muted text:** `#9a9aa3`
- **Card backgrounds:** `#141416`, `#1a1a1e`
- **Card borders:** `#2a2a2e`
- **Heading font:** Fraunces (serif, italic for emphasis)
- **Body font:** Geist (sans-serif)
- **Mono font:** JetBrains Mono (labels, tags)
- **Brand mark:** Signpost SVG icon + "Guidepost." (italic, dot in accent color)

### Landing Page
- Top bar: Brand mark left, "Live · {council}" right
- Label: "Your patch, in plain words"
- Hero: Large typing animation cycling example queries
- Tagline: "Every council in ANZ & the UK. One place to ask. We do the rest."
- CTA: "Start asking" button with arrow
- Meta: "No login · Free · Powered by your council"

### Chat View
- Nav: Back button, brand mark, council name
- Thread: User messages (right-aligned or distinct style), agent messages, action cards inline
- Action card: Tag + source header, optional map placeholder, key-value fields with check marks, attachment buttons, submit button
- Quick chips: Horizontal scrollable row below thread
- Input bar: Text input + send button

## Docker Setup

### Frontend Container
- **Build:** Node 20 → `npm run build` → nginx serves static files
- **Port:** 3000
- **Proxy:** nginx proxies `/api/*` to backend container

### Backend Container
- **Build:** .NET 8 SDK → `dotnet publish` → runtime image
- **Port:** 5000
- **Data:** In-memory, seeded on startup

### docker-compose.yml
- Two services: `frontend`, `api`
- Single `docker compose up` to run both
- Frontend depends on API

## Project Structure

```
my-localgovernment/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Landing.tsx
│   │   │   ├── Chat.tsx
│   │   │   ├── ActionCard.tsx
│   │   │   ├── QuickChips.tsx
│   │   │   ├── TypingHero.tsx
│   │   │   ├── BrandMark.tsx
│   │   │   └── InputBar.tsx
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── nginx.conf
├── api/
│   ├── Program.cs
│   ├── Models/
│   │   ├── ChatRequest.cs
│   │   ├── ChatResponse.cs
│   │   ├── Council.cs
│   │   ├── Report.cs
│   │   └── ActionCard.cs
│   ├── Services/
│   │   ├── IAgentService.cs
│   │   └── PatternMatchAgentService.cs
│   ├── Data/
│   │   └── SeedData.cs
│   ├── GuidepostApi.csproj
│   └── Dockerfile
├── docker-compose.yml
└── docs/
```

## Fallback Behavior

When a user message matches **none** of the four demo scenarios:

- **Agent response:** "I'm not sure how to help with that yet. Here are some things I can help with:"
- **Action card:** `null` (no card rendered)
- **Quick chips:** `["Report a pothole", "Bin collection day", "Noise complaint", "Register a dog"]` — the four scenario entry points

This ensures the user is always guided back to a working path.

## Error Handling

All error responses use a consistent shape:

```json
{ "error": "Human-readable message", "code": "ERROR_CODE" }
```

| Scenario | Status | Code |
|---|---|---|
| Malformed JSON / missing required fields | 400 | `INVALID_REQUEST` |
| Unknown `councilId` | 404 | `COUNCIL_NOT_FOUND` |
| Unknown report ID | 404 | `REPORT_NOT_FOUND` |
| Empty message | 400 | `EMPTY_MESSAGE` |
| Server error | 500 | `INTERNAL_ERROR` |

## Report Submission Contract

**POST /api/reports** request body:

```json
{
  "councilId": "river-city",
  "sessionId": "uuid",
  "scenarioType": "report",
  "fields": [
    { "key": "Location", "value": "Boundary St, West End" },
    { "key": "Type", "value": "Pothole / road defect" }
  ],
  "notes": "Optional user note text"
}
```

Attachments (photo) are **UI stubs only** for this prototype — buttons are rendered but show a "Coming soon" toast on click. No file upload endpoint.

## Session Management

- Sessions are **stateless** for the prototype. Each `POST /api/chat` is independent — no multi-turn context.
- `sessionId` is generated client-side (UUID) and sent with each request. It is used only to link a report submission back to the originating chat for display purposes.
- Quick chips like "Track this report" send a new chat message with that text — the backend matches it as a keyword and returns the most recent report for that session.
- No session expiry or cleanup needed — in-memory data resets on container restart.

## Council Selection

For the demo, the council is **hardcoded to "River City"** (`river-city`). The frontend does not show a council picker. The `GET /api/councils` endpoint exists for future extensibility but is not used in the landing page. The top bar shows "Live · River City" statically.

## Action Card Type Enum

Canonical type values used in `actionCard.type`:

| Type | Scenario |
|---|---|
| `report` | Pothole / Road Defect |
| `lookup` | Bin Collection Day |
| `complaint` | Noise Complaint |
| `registration` | Dog Registration |

The frontend `ActionCard` component branches rendering on these four values.

## IAgentService Interface

```csharp
public interface IAgentService
{
    Task<ChatResponse> ProcessMessageAsync(ChatRequest request);
}
```

`ChatRequest` and `ChatResponse` are the same models used by the API endpoint. Implementations are registered via DI — swap `PatternMatchAgentService` for an LLM-backed implementation by changing one line in `Program.cs`.

## Data Models

### Council
```json
{ "id": "river-city", "name": "River City Council", "region": "QLD", "country": "AU" }
```

### Service
```json
{ "id": "works-request", "councilId": "river-city", "name": "Works Request", "category": "infrastructure" }
```

### Report
```json
{ "id": "uuid", "councilId": "river-city", "sessionId": "uuid", "scenarioType": "report", "fields": [...], "notes": "...", "status": "submitted", "createdAt": "ISO8601", "timeline": [{ "status": "submitted", "at": "ISO8601", "label": "Report submitted" }] }
```

## Typing Animation Strings

The hero cycles through these example queries:
1. "Is my bin day tomorrow?"
2. "There's a pothole on Boundary St"
3. "I need to register my dog"
4. "There's loud construction next door"

## Ports

- **Docker (production):** Frontend on `:3000` (nginx), API on `:5000`
- **Local dev:** Frontend on `:5173` (Vite default), API on `:5000`. Vite proxy forwards `/api/*` to `:5000`.

## UX States

- **Loading:** After sending a message, show a typing indicator (three pulsing dots) in the agent message area
- **Transition:** Landing → Chat is a simple route change (no animation needed for prototype)
- **Action card:** Appears inline in the thread after the agent message, no special animation
- **Back button:** Returns to Landing, clears chat state. No session persistence across navigation.

## Extensibility Points

1. **IAgentService** — Swap pattern matcher for LLM-backed agent
2. **SeedData** — Replace with database/external API for real council data
3. **Action card types** — Add new card types by adding scenario definitions
4. **Council integrations** — POST /api/reports currently stores in-memory; extend to submit to real council APIs
