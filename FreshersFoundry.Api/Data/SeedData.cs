using FreshersFoundry.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FreshersFoundry.Api.Data;

public static class SeedData
{
    public static async Task SeedAsync(AppDbContext context)
    {
        var admin = await context.Users.FirstOrDefaultAsync(user => user.Email == "admin@freshersfoundry.local");
        if (admin is null)
        {
            var passwordHasher = new PasswordHasher<User>();

            admin = new User
            {
                FullName = "FreshersFoundry Admin",
                Email = "admin@freshersfoundry.local",
                Role = UserRole.Admin
            };

            admin.PasswordHash = passwordHasher.HashPassword(admin, "Admin@12345");
            context.Users.Add(admin);
            await context.SaveChangesAsync();
        }

        await PurgeNoiseAndDuplicateRecords(context);

        await context.SaveChangesAsync();
    }

    private static async Task PurgeNoiseAndDuplicateRecords(AppDbContext context)
    {
        var existingQuestions = await context.InterviewQuestions.ToListAsync();
        var questionsToRemove = existingQuestions
            .Where(question => question.CreatedById == Guid.Empty || IsNoise(question.Category) || IsNoise(question.SubTopic) || IsNoise(question.Question) || IsNoise(question.Answer) || IsNoise(question.CodeSnippet))
            .ToList();

        var existingJobs = await context.Jobs.ToListAsync();
        var jobsToRemove = existingJobs
            .Where(job => job.PostedById == Guid.Empty || IsNoise(job.Title) || IsNoise(job.CompanyName) || IsNoise(job.Location) || IsNoise(job.ExperienceLevel) || IsNoise(job.SalaryRange) || IsNoise(job.SkillTags) || IsNoise(job.Description) || IsNoise(job.ApplyLink))
            .ToList();

        var existingBlogs = await context.Blogs.ToListAsync();
        var blogsToRemove = existingBlogs
            .Where(blog => blog.AuthorId == Guid.Empty || IsNoise(blog.Title) || IsNoise(blog.Content) || IsNoise(blog.CoverImageUrl) || IsNoise(blog.Tags))
            .ToList();

        var existingExperiences = await context.InterviewExperiences.ToListAsync();
        var experiencesToRemove = existingExperiences
            .Where(experience => experience.SubmittedById == Guid.Empty || IsNoise(experience.CompanyName) || IsNoise(experience.RoleAppliedFor) || IsNoise(experience.InterviewRounds) || IsNoise(experience.Content))
            .ToList();

        if (questionsToRemove.Count > 0)
        {
            context.InterviewQuestions.RemoveRange(questionsToRemove);
        }

        if (jobsToRemove.Count > 0)
        {
            context.Jobs.RemoveRange(jobsToRemove);
        }

        if (blogsToRemove.Count > 0)
        {
            context.Blogs.RemoveRange(blogsToRemove);
        }

        if (experiencesToRemove.Count > 0)
        {
            context.InterviewExperiences.RemoveRange(experiencesToRemove);
        }
    }

    private static bool IsNoise(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var normalized = value.Trim().ToLowerInvariant();
        return normalized.Contains("smoke") ||
               normalized.Contains("dummy") ||
               normalized.Contains("placeholder") ||
               normalized.Contains("test entry") ||
               normalized.Contains("smoke test") ||
               normalized.StartsWith("test ") ||
               normalized.EndsWith(" test");
    }
}
