// api/Data/SeedData.cs
using GuidepostApi.Models;

namespace GuidepostApi.Data;

public static class SeedData
{
    public static void Initialize(InMemoryStore store)
    {
        store.Councils.AddRange(new[]
        {
            new Council("river-city", "River City Council", "QLD", "AU"),
            new Council("greendale", "Greendale City Council", "VIC", "AU"),
            new Council("westminster", "Westminster Council", "London", "UK")
        });

        store.Services.AddRange(new[]
        {
            new ServiceDefinition("works-request", "river-city", "Works Request", "infrastructure"),
            new ServiceDefinition("waste-services", "river-city", "Waste Services", "waste"),
            new ServiceDefinition("noise-complaint", "river-city", "Noise Complaint", "compliance"),
            new ServiceDefinition("animal-registration", "river-city", "Animal Registration", "animals")
        });
    }
}
