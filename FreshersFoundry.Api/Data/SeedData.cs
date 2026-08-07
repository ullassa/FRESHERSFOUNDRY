using FreshersFoundry.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FreshersFoundry.Api.Data;

public static class SeedData
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync())
        {
            return;
        }

        var passwordHasher = new PasswordHasher<User>();

        var admin = new User
        {
            FullName = "FreshersFoundry Admin",
            Email = "admin@freshersfoundry.local",
            Role = UserRole.Admin
        };

        admin.PasswordHash = passwordHasher.HashPassword(admin, "Admin@12345");

        context.Users.Add(admin);

        var questions = MvpSeedCatalog.InterviewQuestions.Select(question =>
        {
            question.CreatedById = admin.Id;
            return question;
        });

        var jobs = MvpSeedCatalog.Jobs.Select(job =>
        {
            job.PostedById = admin.Id;
            return job;
        });

        var blogs = MvpSeedCatalog.Blogs.Select(blog =>
        {
            blog.AuthorId = admin.Id;
            return blog;
        });

        var experiences = MvpSeedCatalog.InterviewExperiences.Select(experience =>
        {
            experience.SubmittedById = admin.Id;
            return experience;
        });

        context.InterviewQuestions.AddRange(questions);
        context.Jobs.AddRange(jobs);
        context.Blogs.AddRange(blogs);
        context.InterviewExperiences.AddRange(experiences);
        await context.SaveChangesAsync();
    }
}
