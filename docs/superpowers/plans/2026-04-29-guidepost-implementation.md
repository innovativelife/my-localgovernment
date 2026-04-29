# Guidepost Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React + C# demo app for citizen-to-council interaction, deployed in local Docker containers.

**Architecture:** React SPA (Vite + TypeScript) talks to a .NET 8 Minimal API over JSON. Pattern-matching agent classifies user messages into 4 demo scenarios and returns structured action cards. Both run as Docker containers via `docker compose up`.

**Tech Stack:** React 18, Vite, TypeScript, .NET 8, C# Minimal API, Docker, nginx

**Spec:** `docs/superpowers/specs/2026-04-29-guidepost-design.md`

---

## Chunk 1: C# Backend API

### Task 1: Project scaffold and data models

**Files:**
- Create: `api/GuidepostApi.csproj`
- Create: `api/Models/Council.cs`
- Create: `api/Models/ServiceDefinition.cs`
- Create: `api/Models/ActionCardField.cs`
- Create: `api/Models/ActionCard.cs`
- Create: `api/Models/ChatRequest.cs`
- Create: `api/Models/ChatResponse.cs`
- Create: `api/Models/ReportRequest.cs`
- Create: `api/Models/Report.cs`
- Create: `api/Models/TimelineEntry.cs`
- Create: `api/Models/ErrorResponse.cs`

- [ ] **Step 1: Create the .NET 8 project file**

```xml
<!-- api/GuidepostApi.csproj -->
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>
```

- [ ] **Step 2: Create all model classes**

```csharp
// api/Models/Council.cs
namespace GuidepostApi.Models;

public record Council(string Id, string Name, string Region, string Country);
```

```csharp
// api/Models/ServiceDefinition.cs
namespace GuidepostApi.Models;

public record ServiceDefinition(string Id, string CouncilId, string Name, string Category);
```

```csharp
// api/Models/ActionCardField.cs
namespace GuidepostApi.Models;

public record ActionCardField(string Key, string Value, bool Verified = false);
```

```csharp
// api/Models/ActionCard.cs
namespace GuidepostApi.Models;

public record ActionCard(
    string Type,
    string Tag,
    string Source,
    List<ActionCardField> Fields,
    List<string> Attachments,
    string SubmitLabel
);
```

```csharp
// api/Models/ChatRequest.cs
namespace GuidepostApi.Models;

public record ChatRequest(string CouncilId, string Message, string? SessionId);
```

```csharp
// api/Models/ChatResponse.cs
namespace GuidepostApi.Models;

public record ChatResponse(string Message, ActionCard? ActionCard, List<string> QuickChips);
```

```csharp
// api/Models/ReportRequest.cs
namespace GuidepostApi.Models;

public record ReportRequest(
    string CouncilId,
    string SessionId,
    string ScenarioType,
    List<ActionCardField> Fields,
    string? Notes
);
```

```csharp
// api/Models/TimelineEntry.cs
namespace GuidepostApi.Models;

public record TimelineEntry(string Status, DateTime At, string Label);
```

```csharp
// api/Models/Report.cs
namespace GuidepostApi.Models;

public record Report(
    string Id,
    string CouncilId,
    string SessionId,
    string ScenarioType,
    List<ActionCardField> Fields,
    string? Notes,
    string Status,
    DateTime CreatedAt,
    List<TimelineEntry> Timeline
);
```

```csharp
// api/Models/ErrorResponse.cs
namespace GuidepostApi.Models;

public record ErrorResponse(string Error, string Code);
```

- [ ] **Step 3: Verify it compiles**

Run: `cd api && dotnet build`
Expected: Build succeeded.

- [ ] **Step 4: Commit**

```bash
git add api/GuidepostApi.csproj api/Models/
git commit -m "feat(api): scaffold .NET 8 project with data models"
```

---

### Task 2: Seed data and in-memory store

**Files:**
- Create: `api/Data/SeedData.cs`
- Create: `api/Data/InMemoryStore.cs`

- [ ] **Step 1: Create the in-memory store**

```csharp
// api/Data/InMemoryStore.cs
using GuidepostApi.Models;
using System.Collections.Concurrent;

namespace GuidepostApi.Data;

public class InMemoryStore
{
    public List<Council> Councils { get; } = new();
    public List<ServiceDefinition> Services { get; } = new();
    public ConcurrentDictionary<string, Report> Reports { get; } = new();
}
```

- [ ] **Step 2: Create seed data**

```csharp
// api/Data/SeedData.cs
using GuidepostApi.Models;

namespace GuidepostApi.Data;

public static class SeedData
{
    public static void Initialize(InMemoryStore store)
    {
        store.Councils.AddRange(new[]
        {
            new Council("river-city", "River City Council", "QLD", "AU"),
            new Council("greendale", "Greendale City Council", "VIC", "AU"),
            new Council("westminster", "Westminster Council", "London", "UK")
        });

        store.Services.AddRange(new[]
        {
            new ServiceDefinition("works-request", "river-city", "Works Request", "infrastructure"),
            new ServiceDefinition("waste-services", "river-city", "Waste Services", "waste"),
            new ServiceDefinition("noise-complaint", "river-city", "Noise Complaint", "compliance"),
            new ServiceDefinition("animal-registration", "river-city", "Animal Registration", "animals")
        });
    }
}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd api && dotnet build`
Expected: Build succeeded.

- [ ] **Step 4: Commit**

```bash
git add api/Data/
git commit -m "feat(api): add seed data and in-memory store"
```

---

### Task 3: Agent service interface and pattern matcher

**Files:**
- Create: `api/Services/IAgentService.cs`
- Create: `api/Services/PatternMatchAgentService.cs`
- Create: `api/Tests/PatternMatchAgentServiceTests.cs`
- Create: `api/Tests/Tests.csproj`

- [ ] **Step 1: Create the test project**

```xml
<!-- api/Tests/Tests.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <IsPackable>false</IsPackable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
    <PackageReference Include="xunit" Version="2.6.6" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.5.6" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="../GuidepostApi.csproj" />
  </ItemGroup>
</Project>
```

- [ ] **Step 2: Write failing tests for pattern matching**

```csharp
// api/Tests/PatternMatchAgentServiceTests.cs
using GuidepostApi.Data;
using GuidepostApi.Models;
using GuidepostApi.Services;

namespace GuidepostApi.Tests;

public class PatternMatchAgentServiceTests
{
    private readonly PatternMatchAgentService _service;

    public PatternMatchAgentServiceTests()
    {
        var store = new InMemoryStore();
        SeedData.Initialize(store);
        _service = new PatternMatchAgentService(store);
    }

    [Fact]
    public async Task Pothole_message_returns_report_action_card()
    {
        var request = new ChatRequest("river-city", "There's a pothole on Boundary St", null);
        var response = await _service.ProcessMessageAsync(request);

        Assert.NotNull(response.ActionCard);
        Assert.Equal("report", response.ActionCard!.Type);
        Assert.Equal("Report ready", response.ActionCard.Tag);
        Assert.Contains(response.ActionCard.Fields, f => f.Key == "Location");
        Assert.Contains(response.ActionCard.Fields, f => f.Key == "Type");
    }

    [Fact]
    public async Task Bin_message_returns_lookup_action_card()
    {
        var request = new ChatRequest("river-city", "When is my bin day?", null);
        var response = await _service.ProcessMessageAsync(request);

        Assert.NotNull(response.ActionCard);
        Assert.Equal("lookup", response.ActionCard!.Type);
    }

    [Fact]
    public async Task Noise_message_returns_complaint_action_card()
    {
        var request = new ChatRequest("river-city", "My neighbour is having a loud party", null);
        var response = await _service.ProcessMessageAsync(request);

        Assert.NotNull(response.ActionCard);
        Assert.Equal("complaint", response.ActionCard!.Type);
    }

    [Fact]
    public async Task Dog_message_returns_registration_action_card()
    {
        var request = new ChatRequest("river-city", "I need to register my dog", null);
        var response = await _service.ProcessMessageAsync(request);

        Assert.NotNull(response.ActionCard);
        Assert.Equal("registration", response.ActionCard!.Type);
    }

    [Fact]
    public async Task Unknown_message_returns_fallback_with_no_card()
    {
        var request = new ChatRequest("river-city", "What is the meaning of life?", null);
        var response = await _service.ProcessMessageAsync(request);

        Assert.Null(response.ActionCard);
        Assert.Contains("I'm not sure", response.Message);
        Assert.Equal(4, response.QuickChips.Count);
    }

    [Fact]
    public async Task Message_matching_is_case_insensitive()
    {
        var request = new ChatRequest("river-city", "THERE IS A POTHOLE", null);
        var response = await _service.ProcessMessageAsync(request);

        Assert.NotNull(response.ActionCard);
        Assert.Equal("report", response.ActionCard!.Type);
    }
}
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd api/Tests && dotnet test`
Expected: Compilation error — `PatternMatchAgentService` and `IAgentService` don't exist yet.

- [ ] **Step 4: Create the interface**

```csharp
// api/Services/IAgentService.cs
using GuidepostApi.Models;

namespace GuidepostApi.Services;

public interface IAgentService
{
    Task<ChatResponse> ProcessMessageAsync(ChatRequest request);
}
```

- [ ] **Step 5: Implement the pattern matcher**

```csharp
// api/Services/PatternMatchAgentService.cs
using GuidepostApi.Data;
using GuidepostApi.Models;

namespace GuidepostApi.Services;

public class PatternMatchAgentService : IAgentService
{
    private readonly InMemoryStore _store;

    private static readonly List<string> FallbackChips = new()
    {
        "Report a pothole", "Bin collection day", "Noise complaint", "Register a dog"
    };

    private record ScenarioRule(
        string[] Keywords,
        string Type,
        string AgentMessage,
        string Tag,
        string Source,
        List<ActionCardField> Fields,
        List<string> Attachments,
        string SubmitLabel,
        List<string> QuickChips
    );

    private readonly List<ScenarioRule> _rules;

    public PatternMatchAgentService(InMemoryStore store)
    {
        _store = store;
        _rules = BuildRules();
    }

    public Task<ChatResponse> ProcessMessageAsync(ChatRequest request)
    {
        var msg = request.Message.ToLowerInvariant();
        var council = _store.Councils.FirstOrDefault(c => c.Id == request.CouncilId);
        var councilName = council?.Name ?? "your council";

        foreach (var rule in _rules)
        {
            if (rule.Keywords.Any(k => msg.Contains(k)))
            {
                var agentMessage = rule.AgentMessage.Replace("{council}", councilName);
                var submitLabel = rule.SubmitLabel.Replace("{council}", councilName);
                var source = rule.Source.Replace("{councilShort}", GetShortName(councilName));

                var card = new ActionCard(
                    rule.Type,
                    rule.Tag,
                    source,
                    rule.Fields,
                    rule.Attachments,
                    submitLabel
                );

                return Task.FromResult(new ChatResponse(agentMessage, card, rule.QuickChips));
            }
        }

        var fallbackMessage = "I'm not sure how to help with that yet. Here are some things I can help with:";
        return Task.FromResult(new ChatResponse(fallbackMessage, null, FallbackChips));
    }

    private static string GetShortName(string councilName)
    {
        var words = councilName.Split(' ');
        return string.Join("", words.Select(w => w[0]));
    }

    private static List<ScenarioRule> BuildRules() => new()
    {
        new ScenarioRule(
            Keywords: new[] { "pothole", "road", "crack", "footpath", "pavement", "sidewalk" },
            Type: "report",
            AgentMessage: "Got it. I'll lodge this with {council} \u2014 average response is 2\u20133 days.",
            Tag: "Report ready",
            Source: "{councilShort} \u00b7 Works request",
            Fields: new List<ActionCardField>
            {
                new("Location", "Boundary St, West End", true),
                new("Type", "Pothole / road defect", true),
                new("Council ref", "Pre-filled", true)
            },
            Attachments: new List<string> { "photo", "note" },
            SubmitLabel: "Submit to {council}",
            QuickChips: new List<string> { "Track this report", "Other issues nearby", "Bin day" }
        ),
        new ScenarioRule(
            Keywords: new[] { "bin", "rubbish", "recycling", "waste", "garbage", "collection" },
            Type: "lookup",
            AgentMessage: "Here's your bin schedule for {council}.",
            Tag: "Bin schedule",
            Source: "{councilShort} \u00b7 Waste services",
            Fields: new List<ActionCardField>
            {
                new("Address", "Boundary St, West End", true),
                new("Next collection date", "Thursday, 1 May 2026", true),
                new("Bin types", "General / Recycling / Green", true)
            },
            Attachments: new List<string>(),
            SubmitLabel: "",
            QuickChips: new List<string> { "Set reminder", "Missed collection", "Bulk waste" }
        ),
        new ScenarioRule(
            Keywords: new[] { "noise", "loud", "barking", "party", "music", "construction" },
            Type: "complaint",
            AgentMessage: "I can help you lodge a noise complaint with {council}.",
            Tag: "Complaint ready",
            Source: "{councilShort} \u00b7 Noise complaint",
            Fields: new List<ActionCardField>
            {
                new("Location", "Boundary St, West End", true),
                new("Noise type", "Residential noise", true),
                new("Time/frequency", "Ongoing", false),
                new("Description", "", false)
            },
            Attachments: new List<string> { "note" },
            SubmitLabel: "Submit to {council}",
            QuickChips: new List<string> { "Track this complaint", "Noise regulations", "Other issues" }
        ),
        new ScenarioRule(
            Keywords: new[] { "dog", "pet", "register", "animal", "puppy" },
            Type: "registration",
            AgentMessage: "I'll help you register your pet with {council}.",
            Tag: "Registration form",
            Source: "{councilShort} \u00b7 Animal registration",
            Fields: new List<ActionCardField>
            {
                new("Owner name", "", false),
                new("Dog breed", "", false),
                new("Microchip number", "", false),
                new("Registration fee", "$40.00 / year", true)
            },
            Attachments: new List<string>(),
            SubmitLabel: "Submit to {council}",
            QuickChips: new List<string> { "Registration fees", "Off-leash parks", "Lost pets" }
        )
    };
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd api/Tests && dotnet test`
Expected: All 6 tests pass.

- [ ] **Step 7: Commit**

```bash
git add api/Services/ api/Tests/
git commit -m "feat(api): add pattern-matching agent service with tests"
```

---

### Task 4: API endpoints in Program.cs

**Files:**
- Create: `api/Program.cs`

- [ ] **Step 1: Implement all endpoints**

```csharp
// api/Program.cs
using GuidepostApi.Data;
using GuidepostApi.Models;
using GuidepostApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var store = new InMemoryStore();
SeedData.Initialize(store);
builder.Services.AddSingleton(store);
builder.Services.AddSingleton<IAgentService, PatternMatchAgentService>();

// Ensure consistent port for local dev (Docker sets ASPNETCORE_URLS via env)
if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("ASPNETCORE_URLS")))
    builder.WebHost.UseUrls("http://localhost:5000");

var app = builder.Build();
app.UseCors();

// Global error handler for INTERNAL_ERROR
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(
            new ErrorResponse("An unexpected error occurred", "INTERNAL_ERROR"));
    });
});

// POST /api/chat
app.MapPost("/api/chat", async (ChatRequest request, IAgentService agent, InMemoryStore db) =>
{
    if (string.IsNullOrWhiteSpace(request.CouncilId))
        return Results.BadRequest(new ErrorResponse("CouncilId is required", "INVALID_REQUEST"));

    if (string.IsNullOrWhiteSpace(request.Message))
        return Results.BadRequest(new ErrorResponse("Message cannot be empty", "EMPTY_MESSAGE"));

    if (!db.Councils.Any(c => c.Id == request.CouncilId))
        return Results.NotFound(new ErrorResponse($"Council '{request.CouncilId}' not found", "COUNCIL_NOT_FOUND"));

    var response = await agent.ProcessMessageAsync(request);
    return Results.Ok(response);
});

// GET /api/councils
app.MapGet("/api/councils", (InMemoryStore db) =>
    Results.Ok(new { councils = db.Councils }));

// GET /api/councils/{id}/services
app.MapGet("/api/councils/{id}/services", (string id, InMemoryStore db) =>
{
    if (!db.Councils.Any(c => c.Id == id))
        return Results.NotFound(new ErrorResponse($"Council '{id}' not found", "COUNCIL_NOT_FOUND"));

    var services = db.Services.Where(s => s.CouncilId == id).ToList();
    return Results.Ok(new { services });
});

// POST /api/reports
app.MapPost("/api/reports", (ReportRequest request, InMemoryStore db) =>
{
    if (string.IsNullOrWhiteSpace(request.CouncilId) || string.IsNullOrWhiteSpace(request.SessionId))
        return Results.BadRequest(new ErrorResponse("CouncilId and SessionId are required", "INVALID_REQUEST"));

    if (!db.Councils.Any(c => c.Id == request.CouncilId))
        return Results.NotFound(new ErrorResponse($"Council '{request.CouncilId}' not found", "COUNCIL_NOT_FOUND"));

    var now = DateTime.UtcNow;
    var report = new Report(
        Id: Guid.NewGuid().ToString(),
        CouncilId: request.CouncilId,
        SessionId: request.SessionId,
        ScenarioType: request.ScenarioType,
        Fields: request.Fields,
        Notes: request.Notes,
        Status: "submitted",
        CreatedAt: now,
        Timeline: new List<TimelineEntry>
        {
            new("submitted", now, "Report submitted")
        }
    );

    db.Reports[report.Id] = report;
    return Results.Created($"/api/reports/{report.Id}", new { reportId = report.Id, status = report.Status });
});

// GET /api/reports/{id}
app.MapGet("/api/reports/{id}", (string id, InMemoryStore db) =>
{
    if (!db.Reports.TryGetValue(id, out var report))
        return Results.NotFound(new ErrorResponse($"Report '{id}' not found", "REPORT_NOT_FOUND"));

    return Results.Ok(new { reportId = report.Id, status = report.Status, timeline = report.Timeline });
});

app.Run();
```

- [ ] **Step 2: Verify it compiles and runs**

Run: `cd api && dotnet build`
Expected: Build succeeded.

Run: `cd api && dotnet run &` then `curl http://localhost:5000/api/councils` then kill the process.
Expected: JSON with 3 councils returned.

- [ ] **Step 3: Commit**

```bash
git add api/Program.cs
git commit -m "feat(api): add all API endpoints with error handling"
```

---

## Chunk 2: React Frontend

### Task 5: Scaffold Vite + React project with types and API client

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/api/client.ts`

- [ ] **Step 1: Create project scaffold**

Run: `cd /Users/gregsmith/experiments/my-localgovernment && npm create vite@latest frontend -- --template react-ts` and accept defaults.

- [ ] **Step 2: Install dependencies and clean up scaffold boilerplate**

Run: `cd frontend && npm install`

Then remove Vite scaffold files that will conflict with our design system:
```bash
rm frontend/src/index.css frontend/src/assets/react.svg frontend/public/vite.svg frontend/src/App.css
```

Update `frontend/index.html` — change the `<title>` to `Guidepost` and remove the Vite favicon:
```html
<!-- Replace the <title> and remove <link rel="icon" ...> in the <head> -->
<title>Guidepost</title>
```

- [ ] **Step 3: Add Vite proxy config**

```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

- [ ] **Step 4: Create shared TypeScript types**

```typescript
// frontend/src/types/index.ts
export interface ActionCardField {
  key: string;
  value: string;
  verified: boolean;
}

export interface ActionCard {
  type: 'report' | 'lookup' | 'complaint' | 'registration';
  tag: string;
  source: string;
  fields: ActionCardField[];
  attachments: string[];
  submitLabel: string;
}

export interface ChatResponse {
  message: string;
  actionCard: ActionCard | null;
  quickChips: string[];
}

export interface ChatRequest {
  councilId: string;
  message: string;
  sessionId?: string;
}

export interface ReportRequest {
  councilId: string;
  sessionId: string;
  scenarioType: string;
  fields: ActionCardField[];
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  actionCard?: ActionCard | null;
  quickChips?: string[];
}
```

- [ ] **Step 5: Create API client**

```typescript
// frontend/src/api/client.ts
import { ChatRequest, ChatResponse, ReportRequest } from '../types';

const BASE = '/api';

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
  return res.json();
}

export async function submitReport(request: ReportRequest): Promise<{ reportId: string; status: string }> {
  const res = await fetch(`${BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
  return res.json();
}
```

- [ ] **Step 6: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): scaffold Vite + React + TypeScript with API client"
```

---

### Task 6: Design system CSS and BrandMark component

**Files:**
- Create: `frontend/src/App.css`
- Create: `frontend/src/components/BrandMark.tsx`

- [ ] **Step 1: Create the design system CSS**

Replace the default `App.css` with the full Guidepost design system. This is the single CSS file for the entire app. Key tokens:
- Background: `#0e0e10`
- Text: `#fafaf5`
- Accent: `#dcff54`
- Muted: `#9a9aa3`
- Card bg: `#141416` / `#1a1a1e`
- Card border: `#2a2a2e`
- Fonts: Fraunces (serif headings), Geist (body), JetBrains Mono (mono)

```css
/* frontend/src/App.css */
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,800&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; }
html, body, #root { margin: 0; padding: 0; height: 100%; }

body {
  font-family: 'Geist', system-ui, sans-serif;
  background: #0e0e10;
  color: #fafaf5;
  -webkit-font-smoothing: antialiased;
}

/* -- Brand Mark -- */
.brand-mark {
  font-family: 'Fraunces', serif;
  font-weight: 500;
  font-style: italic;
  font-size: 18px;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #fafaf5;
}
.brand-mark .dot { color: #dcff54; }
.post-icon { width: 14px; height: 18px; color: #dcff54; }

/* -- Landing -- */
.landing {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 0 24px;
}
.landing .topbar {
  width: 100%;
  max-width: 480px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}
.landing .live {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: #9a9aa3;
  text-transform: uppercase;
}
.landing .label {
  font-size: 13px;
  color: #9a9aa3;
  margin-top: 40px;
  margin-bottom: 12px;
}
.landing .hero {
  width: 100%;
  max-width: 480px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.landing .quote {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-size: clamp(28px, 6vw, 44px);
  letter-spacing: -0.02em;
  text-align: center;
  line-height: 1.2;
}
.landing .cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #dcff54;
  margin-left: 2px;
  animation: blink 1s step-end infinite;
  vertical-align: text-bottom;
}
.landing .tagline {
  font-size: 15px;
  color: #9a9aa3;
  text-align: center;
  line-height: 1.5;
  margin-top: 32px;
  max-width: 380px;
}
.landing .tagline strong { color: #fafaf5; }
.landing .cta-wrap { margin-top: 32px; }
.landing .cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #dcff54;
  color: #0e0e10;
  border: none;
  border-radius: 100px;
  padding: 14px 28px;
  font-family: 'Geist', sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.landing .cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(220,255,84,0.3);
}
.landing .cta .arrow-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.15);
  border-radius: 50%;
}
.landing .meta {
  font-size: 12px;
  color: #9a9aa3;
  margin-top: 16px;
}

/* -- Chat View -- */
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 480px;
  margin: 0 auto;
}
.chat-view .nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #1a1a1e;
}
.chat-view .back {
  background: none;
  border: none;
  color: #fafaf5;
  cursor: pointer;
  padding: 4px;
  display: flex;
}
.chat-view .loc {
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #9a9aa3;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.chat-view .thread {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.msg-user {
  align-self: flex-end;
  background: #1a1a1e;
  border-radius: 18px 18px 4px 18px;
  padding: 12px 16px;
  max-width: 85%;
  font-size: 14px;
  line-height: 1.5;
}
.msg-agent {
  align-self: flex-start;
  color: #9a9aa3;
  font-size: 14px;
  line-height: 1.5;
  max-width: 85%;
  padding: 4px 0;
}
.msg-agent em { color: #fafaf5; font-style: normal; font-weight: 500; }

/* -- Typing indicator -- */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}
.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #9a9aa3;
  animation: pulse 1.4s ease-in-out infinite;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

/* -- Action Card -- */
.action-card {
  background: #141416;
  border: 1px solid #2a2a2e;
  border-radius: 16px;
  overflow: hidden;
  max-width: 100%;
}
.ac-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
}
.ac-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #dcff54;
  color: #0e0e10;
  padding: 3px 10px;
  border-radius: 4px;
}
.ac-source {
  font-size: 12px;
  color: #9a9aa3;
}
.ac-map {
  height: 100px;
  background: #1a1a1e;
  position: relative;
  margin: 0 16px;
  border-radius: 8px;
}
.ac-pin {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  background: #dcff54;
  border-radius: 50% 50% 50% 0;
  transform: translate(-50%, -100%) rotate(-45deg);
}
.ac-fields { padding: 12px 16px; }
.ac-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #1a1a1e;
  font-size: 13px;
}
.ac-field:last-child { border-bottom: none; }
.ac-field .k { color: #9a9aa3; }
.ac-field .v { color: #fafaf5; }
.ac-field .check { color: #dcff54; margin-left: 6px; }
.ac-attach {
  display: flex;
  gap: 8px;
  padding: 8px 16px 12px;
}
.ac-attach button {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #1a1a1e;
  border: 1px solid #2a2a2e;
  color: #9a9aa3;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  font-family: 'Geist', sans-serif;
}
.ac-attach button:hover { background: #2a2a2e; color: #fafaf5; }
.ac-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 32px);
  margin: 4px 16px 16px;
  padding: 12px;
  background: #dcff54;
  color: #0e0e10;
  border: none;
  border-radius: 10px;
  font-family: 'Geist', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s;
}
.ac-submit:hover { transform: translateY(-1px); }

/* -- Quick Chips -- */
.quick-chips {
  display: flex;
  gap: 8px;
  padding: 8px 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.quick-chips::-webkit-scrollbar { display: none; }
.quick-chips span {
  flex-shrink: 0;
  font-size: 12px;
  color: #9a9aa3;
  background: #1a1a1e;
  border: 1px solid #2a2a2e;
  border-radius: 100px;
  padding: 8px 14px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.quick-chips span:hover { background: #2a2a2e; color: #fafaf5; }

/* -- Input Bar -- */
.input-bar {
  display: flex;
  gap: 8px;
  padding: 12px 0 24px;
  border-top: 1px solid #1a1a1e;
}
.input-bar input {
  flex: 1;
  background: #141416;
  border: 1px solid #2a2a2e;
  border-radius: 12px;
  padding: 12px 16px;
  color: #fafaf5;
  font-family: 'Geist', sans-serif;
  font-size: 14px;
  outline: none;
}
.input-bar input::placeholder { color: #9a9aa3; }
.input-bar input:focus { border-color: #dcff54; }
.input-bar .send {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: #dcff54;
  color: #0e0e10;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  flex-shrink: 0;
}

/* -- Toast -- */
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a1e;
  border: 1px solid #2a2a2e;
  color: #fafaf5;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  z-index: 100;
  animation: fadeUp 0.3s ease;
}

/* -- Animations -- */
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.75); }
}
@keyframes fadeUp {
  0% { opacity: 0; transform: translate(-50%, 10px); }
  100% { opacity: 1; transform: translate(-50%, 0); }
}
```

- [ ] **Step 2: Create BrandMark component**

```tsx
// frontend/src/components/BrandMark.tsx
export default function BrandMark() {
  return (
    <div className="brand-mark">
      <svg className="post-icon" viewBox="0 0 14 18" fill="none">
        <path d="M7 2v15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 4h5l1.5 1.5L12 7H7" fill="currentColor" />
        <path d="M7 8.5H2L0.5 10L2 11.5H7" fill="currentColor" />
      </svg>
      Guidepost<span className="dot">.</span>
    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.css frontend/src/components/BrandMark.tsx
git commit -m "feat(frontend): add design system CSS and BrandMark component"
```

---

### Task 7: Landing page with typing animation

**Files:**
- Create: `frontend/src/components/TypingHero.tsx`
- Create: `frontend/src/components/Landing.tsx`

- [ ] **Step 1: Create TypingHero component**

The hero cycles through 4 strings with a typewriter effect — typing each character, pausing, then deleting and moving to the next.

```tsx
// frontend/src/components/TypingHero.tsx
import { useState, useEffect } from 'react';

const phrases = [
  "Is my bin day tomorrow?",
  "There's a pothole on Boundary St",
  "I need to register my dog",
  "There's loud construction next door",
];

export default function TypingHero() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIndex];
    const speed = deleting ? 30 : 60;

    if (!deleting && charIndex === phrase.length) {
      const timeout = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(timeout);
    }
    if (deleting && charIndex === 0) {
      setDeleting(false);
      setPhraseIndex((phraseIndex + 1) % phrases.length);
      return;
    }

    const timeout = setTimeout(() => {
      setCharIndex(charIndex + (deleting ? -1 : 1));
    }, speed);
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, phraseIndex]);

  return (
    <div className="hero">
      <div className="quote">
        {phrases[phraseIndex].slice(0, charIndex)}
        <span className="cursor" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Landing component**

```tsx
// frontend/src/components/Landing.tsx
import BrandMark from './BrandMark';
import TypingHero from './TypingHero';

interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="landing">
      <div className="topbar">
        <BrandMark />
        <div className="live">Live · River City</div>
      </div>
      <div className="label">Your patch, in plain words</div>
      <TypingHero />
      <p className="tagline">
        Every council in <strong>ANZ &amp; the UK</strong>. One place to ask. We do the rest.
      </p>
      <div className="cta-wrap">
        <button className="cta" onClick={onStart}>
          <span>Start asking</span>
          <span className="arrow-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
      <div className="meta">No login · Free · Powered by your council</div>
    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/TypingHero.tsx frontend/src/components/Landing.tsx
git commit -m "feat(frontend): add Landing page with typing hero animation"
```

---

### Task 8: Chat view — InputBar, QuickChips, ActionCard

**Files:**
- Create: `frontend/src/components/InputBar.tsx`
- Create: `frontend/src/components/QuickChips.tsx`
- Create: `frontend/src/components/ActionCard.tsx`

- [ ] **Step 1: Create InputBar**

```tsx
// frontend/src/components/InputBar.tsx
import { useState } from 'react';

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <div className="input-bar">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder="Anything else?"
        disabled={disabled}
      />
      <button className="send" onClick={handleSubmit} disabled={disabled}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create QuickChips**

```tsx
// frontend/src/components/QuickChips.tsx
interface QuickChipsProps {
  chips: string[];
  onSelect: (chip: string) => void;
}

export default function QuickChips({ chips, onSelect }: QuickChipsProps) {
  if (!chips.length) return null;
  return (
    <div className="quick-chips">
      {chips.map(chip => (
        <span key={chip} onClick={() => onSelect(chip)}>{chip}</span>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create ActionCard**

```tsx
// frontend/src/components/ActionCard.tsx
import { useState } from 'react';
import { ActionCard as ActionCardType } from '../types';
import { submitReport } from '../api/client';

interface ActionCardProps {
  card: ActionCardType;
  councilId: string;
  sessionId: string;
}

export default function ActionCard({ card, councilId, sessionId }: ActionCardProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleAttachment = () => showToast('Coming soon');

  const handleSubmit = async () => {
    try {
      await submitReport({
        councilId,
        sessionId,
        scenarioType: card.type,
        fields: card.fields,
      });
      setSubmitted(true);
      showToast('Submitted successfully');
    } catch {
      showToast('Submission failed');
    }
  };

  return (
    <>
      <div className="action-card">
        <div className="ac-header">
          <span className="ac-tag">{card.tag}</span>
          <span className="ac-source">{card.source}</span>
        </div>

        {card.type === 'report' && (
          <div className="ac-map"><div className="ac-pin" /></div>
        )}

        <div className="ac-fields">
          {card.fields.map(f => (
            <div className="ac-field" key={f.key}>
              <span className="k">{f.key}</span>
              <span className="v">
                {f.value || '—'}
                {f.verified && <span className="check">✓</span>}
              </span>
            </div>
          ))}
        </div>

        {card.attachments.length > 0 && (
          <div className="ac-attach">
            {card.attachments.includes('photo') && (
              <button onClick={handleAttachment}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Add photo
              </button>
            )}
            {card.attachments.includes('note') && (
              <button onClick={handleAttachment}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Add note
              </button>
            )}
          </div>
        )}

        {card.submitLabel && (
          <button className="ac-submit" onClick={handleSubmit} disabled={submitted}>
            {submitted ? 'Submitted ✓' : card.submitLabel}
            {!submitted && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            )}
          </button>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
```

- [ ] **Step 4: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/InputBar.tsx frontend/src/components/QuickChips.tsx frontend/src/components/ActionCard.tsx
git commit -m "feat(frontend): add InputBar, QuickChips, and ActionCard components"
```

---

### Task 9: Chat view and App routing

**Files:**
- Create: `frontend/src/components/Chat.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Create Chat component**

```tsx
// frontend/src/components/Chat.tsx
import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessage } from '../api/client';
import BrandMark from './BrandMark';
import InputBar from './InputBar';
import QuickChips from './QuickChips';
import ActionCardComponent from './ActionCard';

interface ChatProps {
  onBack: () => void;
}

const COUNCIL_ID = 'river-city';

export default function Chat({ onBack }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [chips, setChips] = useState<string[]>([]);
  const [sessionId] = useState(() => crypto.randomUUID());
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadRef.current?.scrollTo(0, threadRef.current.scrollHeight);
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    const userMsg: ChatMessage = { id: crypto.randomUUID(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setChips([]);
    setLoading(true);

    try {
      const response = await sendMessage({ councilId: COUNCIL_ID, message: text, sessionId });
      const agentMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'agent',
        text: response.message,
        actionCard: response.actionCard,
        quickChips: response.quickChips,
      };
      setMessages(prev => [...prev, agentMsg]);
      setChips(response.quickChips);
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'agent',
        text: 'Something went wrong. Please try again.',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-view">
      <div className="nav">
        <button className="back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <BrandMark />
        <div className="loc">River City</div>
      </div>

      <div className="thread" ref={threadRef}>
        {messages.map(msg => (
          <div key={msg.id}>
            {msg.sender === 'user' ? (
              <div className="msg-user">{msg.text}</div>
            ) : (
              <>
                {/* PROTOTYPE ONLY: agent messages are server-controlled, not user-controlled */}
                <div className="msg-agent" dangerouslySetInnerHTML={{
                  __html: msg.text.replace(/\*(.*?)\*/g, '<em>$1</em>')
                }} />
                {msg.actionCard && (
                  <ActionCardComponent
                    card={msg.actionCard}
                    councilId={COUNCIL_ID}
                    sessionId={sessionId}
                  />
                )}
              </>
            )}
          </div>
        ))}
        {loading && (
          <div className="typing-indicator">
            <span /><span /><span />
          </div>
        )}
      </div>

      <QuickChips chips={chips} onSelect={handleSend} />
      <InputBar onSend={handleSend} disabled={loading} />
    </div>
  );
}
```

- [ ] **Step 2: Wire up App.tsx with view routing**

```tsx
// frontend/src/App.tsx
import { useState } from 'react';
import './App.css';
import Landing from './components/Landing';
import Chat from './components/Chat';

type View = 'landing' | 'chat';

export default function App() {
  const [view, setView] = useState<View>('landing');

  if (view === 'chat') {
    return <Chat onBack={() => setView('landing')} />;
  }
  return <Landing onStart={() => setView('chat')} />;
}
```

- [ ] **Step 3: Clean up main.tsx**

```tsx
// frontend/src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 4: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Chat.tsx frontend/src/App.tsx frontend/src/main.tsx
git commit -m "feat(frontend): add Chat view and App routing"
```

---

## Chunk 3: Docker Deployment

### Task 10: Backend Dockerfile

**Files:**
- Create: `api/Dockerfile`

- [ ] **Step 1: Create multi-stage Dockerfile**

```dockerfile
# api/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY GuidepostApi.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "GuidepostApi.dll"]
```

- [ ] **Step 2: Verify it builds**

Run: `docker build -t guidepost-api ./api`
Expected: Successfully built.

- [ ] **Step 3: Commit**

```bash
git add api/Dockerfile
git commit -m "feat(api): add Dockerfile for backend"
```

---

### Task 11: Frontend Dockerfile and nginx config

**Files:**
- Create: `frontend/nginx.conf`
- Create: `frontend/Dockerfile`

- [ ] **Step 1: Create nginx config**

```nginx
# frontend/nginx.conf
server {
    listen 3000;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://api:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

- [ ] **Step 2: Create multi-stage Dockerfile**

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
```

- [ ] **Step 3: Verify it builds**

Run: `docker build -t guidepost-frontend ./frontend`
Expected: Successfully built.

- [ ] **Step 4: Commit**

```bash
git add frontend/Dockerfile frontend/nginx.conf
git commit -m "feat(frontend): add Dockerfile and nginx config"
```

---

### Task 12: Docker Compose and end-to-end verification

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: Create docker-compose.yml**

```yaml
# docker-compose.yml
services:
  api:
    build: ./api
    ports:
      - "5000:5000"

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - api
```

- [ ] **Step 2: Build and run both containers**

Run: `docker compose up --build -d`
Expected: Both containers start successfully.

- [ ] **Step 3: Verify API is reachable**

Run: `curl http://localhost:5000/api/councils`
Expected: JSON with 3 councils.

Run: `curl -X POST http://localhost:5000/api/chat -H 'Content-Type: application/json' -d '{"councilId":"river-city","message":"pothole on my street","sessionId":"test"}'`
Expected: JSON with agent message and report action card.

- [ ] **Step 4: Verify frontend is reachable**

Run: `curl -s http://localhost:3000 | head -5`
Expected: HTML with `<div id="root">`.

Run: `curl -s http://localhost:3000/api/councils`
Expected: JSON with 3 councils (proxied through nginx).

Run: `curl -X POST http://localhost:3000/api/chat -H 'Content-Type: application/json' -d '{"councilId":"river-city","message":"pothole","sessionId":"test"}'`
Expected: JSON with agent message and report action card (POST proxied through nginx).

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml
git commit -m "feat: add docker-compose for full-stack deployment"
```

- [ ] **Step 6: Stop containers**

Run: `docker compose down`
