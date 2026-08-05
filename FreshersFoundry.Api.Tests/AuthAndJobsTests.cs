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
            "Remote",
            "FullTime",
            "C#, ASP.NET Core",
            "Great role for a strong backend engineer",
            "https://example.com/apply"));

        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<JobCreateResponse>(okResult.Value);
        Assert.Equal(adminUser.Id, response.PostedById);
        Assert.Equal(ContentStatus.Approved.ToString(), response.Status);
        Assert.Equal("Senior .NET Developer", response.Title);

        var savedJob = await context.Jobs.SingleAsync();
        Assert.Equal(adminUser.Id, savedJob.PostedById);
        Assert.Equal(ContentStatus.Approved, savedJob.Status);
    }
}
