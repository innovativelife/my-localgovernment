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
