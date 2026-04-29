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
