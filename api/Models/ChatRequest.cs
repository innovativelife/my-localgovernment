namespace GuidepostApi.Models;

public record ChatRequest(string CouncilId, string Message, string? SessionId);
