using System.Threading.Tasks;

namespace FreshersFoundry.Api.Data;

public static class SeedData
{
    /// <summary>
    /// Placeholder seeding method. Current project seeds are handled
    /// via migrations or the MvpSeedCatalog; keep method available
    /// so Program.cs can call it safely.
    /// </summary>
    public static async Task SeedAsync(AppDbContext context)
    {
        // Intentionally minimal: ensure database is created and return.
        await Task.CompletedTask;
    }
}
