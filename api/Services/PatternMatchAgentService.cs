using GuidepostApi.Models;
using System.Collections.Concurrent;

namespace GuidepostApi.Services;

public class PatternMatchAgentService : IAgentService
{
    private static readonly List<string> ConfirmChips = new() { "Yes", "Not right now" };

    private static readonly List<string> DefaultChips = new()
    {
        "Report an issue", "My local rep", "Development applications", "Bin collection", "Council website"
    };

    private record ActionDef(
        string[] Keywords,
        string[] ConfirmMessages,
        string[] ExecuteMessages
    );

    private static readonly Dictionary<string, ActionDef> Actions = new()
    {
        { "report", new ActionDef(
            Keywords: new[] { "report", "pothole", "issue" },
            ConfirmMessages: new[]
            {
                "I can help you report that. Shall I open the report form?",
                "No problem, I'll get that lodged for you. Ready to proceed?",
                "Sure, I can help report that issue. Want me to go ahead?"
            },
            ExecuteMessages: new[]
            {
                "Ok - That has been submitted to the council.  Is there anything else I can help with?",
                "Sent to council.  What's next?"
            }
        )},
        { "rep", new ActionDef(
            Keywords: new[] { "rep", "councillor", "representative", "elected" },
            ConfirmMessages: new[]
            {
                "I can pull up your local representative's details. Shall I?",
                "Sure, I can show you your councillor's contact info. Want me to proceed?",
                "I've got your local rep's details. Would you like to see them?"
            },
            ExecuteMessages: new[]
            {
                "A good local rep can be such a big help!"
            }
        )},
        { "development", new ActionDef(
            Keywords: new[] { "development", "planning", "da ", "building" },
            ConfirmMessages: new[]
            {
                "Shall I search council's web site for development info?",
                "Want me to show you the council's web content on development?"
            },
            ExecuteMessages: new[]
            {
                "Hope you got what you needed!"
            }
        )},
        { "bin", new ActionDef(
            Keywords: new[] { "bin", "rubbish", "waste", "recycling", "garbage", "collection" },
            ConfirmMessages: new[]
            {
                "Shall I search for bin info on the council's web site?"
            },
            ExecuteMessages: new[]
            {
                "Did you get what you needed?  If not, you may want to contact your Local Rep."
            }
        )},
        { "website", new ActionDef(
            Keywords: new[] { "website", "site", "web" },
            ConfirmMessages: new[]
            {
                "I can open the council website for you. Shall I?",
                "Sure, I'll pull up the council site. Want me to go ahead?",
                "I can show you the council website. Ready?"
            },
            ExecuteMessages: new[]
            {
                "Did you get what you needed?  If not, you may want to contact your Local Rep."
            }
        )}
    };

    // Track pending action per session so "Yes" knows what to execute
    private static readonly ConcurrentDictionary<string, string> PendingActions = new();

    private static readonly Random Rng = new();

    public Task<ChatResponse> ProcessMessageAsync(ChatRequest request)
    {
        var msg = request.Message.ToLowerInvariant().Trim();
        var sessionId = request.SessionId ?? "";

        // Check if user is confirming a pending action
        if (msg == "yes" && PendingActions.TryRemove(sessionId, out var pendingAction))
        {
            var actionDef = Actions[pendingAction];
            var execMsg = actionDef.ExecuteMessages[Rng.Next(actionDef.ExecuteMessages.Length)];
            return Task.FromResult(new ChatResponse(
                execMsg, null, DefaultChips, Action: null, ExecuteAction: pendingAction));
        }

        // Check if user is declining
        if (msg == "not right now" && PendingActions.TryRemove(sessionId, out _))
        {
            return Task.FromResult(new ChatResponse(
                "No worries! Let me know if you need anything else.", null, DefaultChips));
        }

        // Check for action keywords
        foreach (var (actionName, actionDef) in Actions)
        {
            if (actionDef.Keywords.Any(k => msg.Contains(k)))
            {
                PendingActions[sessionId] = actionName;
                var confirmMsg = actionDef.ConfirmMessages[Rng.Next(actionDef.ConfirmMessages.Length)];
                return Task.FromResult(new ChatResponse(
                    confirmMsg, null, ConfirmChips, Action: actionName));
            }
        }

        // Fallback
        return Task.FromResult(new ChatResponse(
            "I'm not sure how to help with that yet. Here are some things I can do:",
            null, DefaultChips));
    }
}
