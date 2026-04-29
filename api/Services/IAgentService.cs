using GuidepostApi.Models;

namespace GuidepostApi.Services;

public interface IAgentService
{
    Task<ChatResponse> ProcessMessageAsync(ChatRequest request);
}
