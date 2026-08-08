using FreshersFoundry.Api.Controllers;
using FreshersFoundry.Api.Data;
using FreshersFoundry.Api.Models;
using FreshersFoundry.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using Xunit;

namespace FreshersFoundry.Api.Tests;

public class AuthAndJobsTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static IConfiguration CreateConfiguration() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "super-secret-key-for-tests-123456",
                ["Jwt:Issuer"] = "FreshersFoundry.Api",
                ["Jwt:Audience"] = "FreshersFoundry.Web"
            })
            .Build();

    [Fact]
    public async Task CreateJob_WithNonAdminIdentity_LeavesJobPending()
    {
        await using var context = CreateContext();
        var user = new User
        {
            FullName = "Standard User",
            Email = "user@example.com",
            Role = UserRole.User
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var httpContext = new DefaultHttpContext();
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Role, UserRole.User.ToString())
        }, authenticationType: "Test"));

        var controller = new JobsController(context);
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

        var result = await controller.Create(new CreateJobRequest(
            "Junior Backend Developer",
            "FreshersFoundry",
            string.Empty,
            "Remote",
            "FullTime",
            string.Empty,
            string.Empty,
            "C#",
            "Entry-level backend role",
            "https://example.com/apply",
            null));

        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        var response = Assert.IsType<JobCreateResponse>(createdResult.Value);
        Assert.Equal(ContentStatus.Pending.ToString(), response.Status);

        var savedJob = await context.Jobs.SingleAsync();
        Assert.Equal(ContentStatus.Pending, savedJob.Status);
    }

    [Fact]
    public async Task DashboardStats_ReturnsPendingApprovalCount()
    {
        await using var context = CreateContext();
        context.Jobs.Add(new Job
        {
            Title = "Pending Job",
            CompanyName = "FreshersFoundry",
            Location = "Remote",
            JobType = JobType.FullTime,
            SkillTags = "C#",
            Description = "Pending job",
            ApplyLink = "https://example.com/apply",
            PostedById = Guid.NewGuid(),
            PostedByRole = UserRole.User,
            Status = ContentStatus.Pending
        });
        context.Users.Add(new User { FullName = "User", Email = "u@example.com", Role = UserRole.User });
        context.InterviewQuestions.Add(new InterviewQuestion
        {
            Category = "C#",
            Question = "What is async?",
            Answer = "It is non-blocking",
            Difficulty = DifficultyLevel.Easy,
            CreatedById = Guid.NewGuid()
        });
        await context.SaveChangesAsync();

        var controller = new AdminController(context);
        var result = await controller.DashboardStats();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var payload = okResult.Value;
        Assert.NotNull(payload);
        Assert.Contains("pendingApprovals", payload.GetType().GetProperties().Select(p => p.Name));
    }

    [Fact]
    public async Task AdminLogin_ReturnsToken_ForAdminUser()
    {
        await using var context = CreateContext();
        var passwordHasher = new PasswordHasher<User>();
        var adminUser = new User
        {
            FullName = "Admin User",
            Email = "admin@example.com",
            Role = UserRole.Admin
        };
        adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, "Admin@123");
        context.Users.Add(adminUser);
        await context.SaveChangesAsync();

        var controller = new AuthController(context, passwordHasher, new TokenService(CreateConfiguration()));

        var result = await controller.AdminLogin(new LoginRequest("admin@example.com", "Admin@123"));

        var okResult = Assert.IsType<OkObjectResult>(result);
        var authResponse = Assert.IsType<AuthResponse>(okResult.Value);
        Assert.Equal(adminUser.Email, authResponse.Email);
        Assert.Equal(UserRole.Admin.ToString(), authResponse.Role);
        Assert.False(string.IsNullOrWhiteSpace(authResponse.Token));
    }

    [Fact]
    public async Task CreateJob_WithAdminIdentity_SavesJobAndMarksApproved()
    {
        await using var context = CreateContext();
        var adminUser = new User
        {
            FullName = "Admin User",
            Email = "admin@example.com",
            Role = UserRole.Admin
        };
        context.Users.Add(adminUser);
        await context.SaveChangesAsync();

        var httpContext = new DefaultHttpContext();
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, adminUser.Id.ToString()),
            new Claim(ClaimTypes.Role, UserRole.Admin.ToString())
        }, authenticationType: "Test"));

        var controller = new JobsController(context);
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

        var result = await controller.Create(new CreateJobRequest(
            "Senior .NET Developer",
            "FreshersFoundry",
            string.Empty,
            "Remote",
            "FullTime",
            string.Empty,
            string.Empty,
            "C#, ASP.NET Core",
            "Great role for a strong backend engineer",
            "https://example.com/apply",
            null));

        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        var response = Assert.IsType<JobCreateResponse>(createdResult.Value);
        Assert.Equal(adminUser.Id, response.PostedById);
        Assert.Equal(ContentStatus.Approved.ToString(), response.Status);
        Assert.Equal("Senior .NET Developer", response.Title);

        var savedJob = await context.Jobs.SingleAsync();
        Assert.Equal(adminUser.Id, savedJob.PostedById);
        Assert.Equal(ContentStatus.Approved, savedJob.Status);
    }

    [Fact]
    public async Task ApproveJob_WithAdminIdentity_UpdatesStatusToApproved()
    {
        await using var context = CreateContext();
        var adminUser = new User
        {
            FullName = "Admin User",
            Email = "admin@example.com",
            Role = UserRole.Admin
        };
        context.Users.Add(adminUser);

        var job = new Job
        {
            Title = "Junior .NET Developer",
            CompanyName = "FreshersFoundry",
            Location = "Remote",
            JobType = JobType.FullTime,
            SkillTags = "C#",
            Description = "Entry-level backend role",
            ApplyLink = "https://example.com/apply",
            PostedById = adminUser.Id,
            PostedByRole = adminUser.Role,
            Status = ContentStatus.Pending
        };
        context.Jobs.Add(job);
        await context.SaveChangesAsync();

        var httpContext = new DefaultHttpContext();
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, adminUser.Id.ToString()),
            new Claim(ClaimTypes.Role, UserRole.Admin.ToString())
        }, authenticationType: "Test"));

        var controller = new JobsController(context);
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

        var result = await controller.Approve(job.Id);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var savedJob = await context.Jobs.FindAsync(job.Id);
        Assert.NotNull(savedJob);
        Assert.Equal(ContentStatus.Approved, savedJob!.Status);
    }

    [Fact]
    public async Task RejectJob_WithAdminIdentity_UpdatesStatusToRejected()
    {
        await using var context = CreateContext();
        var adminUser = new User
        {
            FullName = "Admin User",
            Email = "admin@example.com",
            Role = UserRole.Admin
        };
        context.Users.Add(adminUser);

        var job = new Job
        {
            Title = "Junior .NET Developer",
            CompanyName = "FreshersFoundry",
            Location = "Remote",
            JobType = JobType.FullTime,
            SkillTags = "C#",
            Description = "Entry-level backend role",
            ApplyLink = "https://example.com/apply",
            PostedById = adminUser.Id,
            PostedByRole = adminUser.Role,
            Status = ContentStatus.Pending
        };
        context.Jobs.Add(job);
        await context.SaveChangesAsync();

        var httpContext = new DefaultHttpContext();
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, adminUser.Id.ToString()),
            new Claim(ClaimTypes.Role, UserRole.Admin.ToString())
        }, authenticationType: "Test"));

        var controller = new JobsController(context);
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

        var result = await controller.Reject(job.Id);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var savedJob = await context.Jobs.FindAsync(job.Id);
        Assert.NotNull(savedJob);
        Assert.Equal(ContentStatus.Rejected, savedJob!.Status);
    }
}
