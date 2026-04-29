// api/Data/InMemoryStore.cs
using GuidepostApi.Models;
using System.Collections.Concurrent;

namespace GuidepostApi.Data;

public class InMemoryStore
{
    public List<Council> Councils { get; } = new();
    public List<ServiceDefinition> Services { get; } = new();
    public ConcurrentDictionary<string, Report> Reports { get; } = new();
}
