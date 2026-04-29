using GuidepostApi.Data;
using GuidepostApi.Models;
using GuidepostApi.Services;
using Xunit;

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
