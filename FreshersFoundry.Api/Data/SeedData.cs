using System;
using System.Threading.Tasks;
using FreshersFoundry.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace FreshersFoundry.Api.Data;

public static class SeedData
{
    /// <summary>
    /// Placeholder seeding method. Current project seeds are handled
    /// via migrations or the MvpSeedCatalog; keep method available
    /// so Program.cs can call it safely.
    /// </summary>
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Intentionally minimal: ensure database is created and return.
        // Ensure database created
        await context.Database.EnsureCreatedAsync();

        // Remove legacy/sample seeded content tables if present.
        // This runs once at startup — it's intentionally broad because the
        // project used seed data during development and you requested removal.
        try
        {
            var jobsDeleted = await context.Database.ExecuteSqlRawAsync("DELETE FROM [Jobs]");
            var blogsDeleted = await context.Database.ExecuteSqlRawAsync("DELETE FROM [Blogs]");
            var questionsDeleted = await context.Database.ExecuteSqlRawAsync("DELETE FROM [InterviewQuestions]");
            var experiencesDeleted = await context.Database.ExecuteSqlRawAsync("DELETE FROM [InterviewExperiences]");
            Console.WriteLine($"Seed cleanup: Jobs={jobsDeleted}, Blogs={blogsDeleted}, Questions={questionsDeleted}, Experiences={experiencesDeleted}");
        }
        catch (Exception ex)
        {
            // Non-fatal: if tables don't exist or SQL fails, just log and continue.
            Console.WriteLine($"Seed cleanup skipped/failed: {ex.Message}");
        }

        // Add a default admin user for local development if none exists
        if (!context.Users.Any(u => u.Email == "admin@local"))
        {
            var hasher = new PasswordHasher<User>();
            var passwordHash = hasher.HashPassword(new User(), "Password123!");
            var id = Guid.NewGuid();
            var createdAt = DateTime.UtcNow;
            // Use raw SQL insert to include CreatorStatus column which exists in DB schema
            await context.Database.ExecuteSqlRawAsync(
                "INSERT INTO [Users] (Id, CreatedAt, Email, FullName, PasswordHash, Role, CreatorStatus) VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6})",
                id, createdAt, "admin@local", "Administrator", passwordHash, (int)UserRole.Admin, 0);
        }
    }
}
