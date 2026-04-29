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
            AgentMessage: "Got it. I'll lodge this with {council} — average response is 2–3 days.",
            Tag: "Report ready",
            Source: "{councilShort} · Works request",
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
            Source: "{councilShort} · Waste services",
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
            Source: "{councilShort} · Noise complaint",
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
            Source: "{councilShort} · Animal registration",
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
