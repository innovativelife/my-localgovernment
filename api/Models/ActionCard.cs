namespace GuidepostApi.Models;

public record ActionCard(
    string Type,
    string Tag,
    string Source,
    List<ActionCardField> Fields,
    List<string> Attachments,
    string SubmitLabel
);
