namespace GuidepostApi.Models;

public record ChatResponse(
    string Message,
    ActionCard? ActionCard,
    List<string> QuickChips,
    string? Action = null,
    string? ExecuteAction = null);
