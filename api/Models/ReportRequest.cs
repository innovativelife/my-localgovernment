namespace GuidepostApi.Models;

public record ReportRequest(
    string CouncilId,
    string SessionId,
    string ScenarioType,
    List<ActionCardField> Fields,
    string? Notes
);
