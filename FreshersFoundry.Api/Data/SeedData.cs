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
        await SeedStarterJobsAsync(context, admin);

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

    private static async Task SeedStarterJobsAsync(AppDbContext context, User admin)
    {
        var existingTitles = await context.Jobs
            .Select(job => job.Title.ToLowerInvariant())
            .ToListAsync();

        var starterJobs = new[]
        {
            new Job
            {
                Title = "SDE-1 Backend Engineer",
                CompanyName = "Swiggy",
                Location = "Bengaluru, Karnataka",
                JobType = JobType.FullTime,
                ExperienceLevel = "0-2 years",
                SalaryRange = "₹8,00,000 - ₹14,00,000 / yr",
                SkillTags = "C#, ASP.NET Core, Angular, SQL",
                Description = "Build scalable backend services and work closely with product and platform teams.",
                ApplyLink = "https://careers.swiggy.com/jobs/sde-1-backend-engineer",
                PostedById = admin.Id,
                PostedByRole = admin.Role,
                Status = ContentStatus.Approved,
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new Job
            {
                Title = "Backend Engineering Intern",
                CompanyName = "Razorpay",
                Location = "Remote",
                JobType = JobType.Internship,
                ExperienceLevel = "Students / Freshers",
                SalaryRange = "₹40,000 - ₹60,000 / month",
                SkillTags = "Java, Spring Boot, MySQL",
                Description = "Contribute to APIs, integrations, and internal tooling during a summer internship.",
                ApplyLink = "https://razorpay.com/careers/backend-engineering-intern",
                PostedById = admin.Id,
                PostedByRole = admin.Role,
                Status = ContentStatus.Approved,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new Job
            {
                Title = "UI Developer",
                CompanyName = "Zomato",
                Location = "Gurugram, Haryana",
                JobType = JobType.Contract,
                ExperienceLevel = "1-3 years",
                SalaryRange = "₹6,00,000 - ₹10,00,000 / yr",
                SkillTags = "Angular, TypeScript, CSS",
                Description = "Design polished frontends, ship reusable components, and improve user experience.",
                ApplyLink = "https://careers.zomato.com/ui-developer",
                PostedById = admin.Id,
                PostedByRole = admin.Role,
                Status = ContentStatus.Approved,
                CreatedAt = DateTime.UtcNow
            }
        };

        foreach (var job in starterJobs)
        {
            var title = job.Title.ToLowerInvariant();
            if (!existingTitles.Contains(title))
            {
                context.Jobs.Add(job);
                existingTitles.Add(title);
            }
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
