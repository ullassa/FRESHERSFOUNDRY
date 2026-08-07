using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreshersFoundry.Api.Controllers;

using FreshersFoundry.Api.Data;
using FreshersFoundry.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext context;

    public AdminController(AppDbContext context)
    {
        this.context = context;
    }

    [HttpGet("pending-content")]
    public async Task<IActionResult> PendingContent()
    {
        var pendingExperiences = await context.InterviewExperiences
            .Where(e => e.Status == ContentStatus.Pending)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();

        var pendingBlogs = await context.Blogs
            .Where(b => b.Status == ContentStatus.Pending)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        var pendingJobs = await context.Jobs
            .Where(j => j.Status == ContentStatus.Pending)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync();

        return Ok(new { pendingExperiences, pendingBlogs, pendingJobs });
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var totalUsers = await context.Users.CountAsync();
        var activeJobs = await context.Jobs.CountAsync(j => j.Status == ContentStatus.Approved);
        var pendingJobs = await context.Jobs.CountAsync(j => j.Status == ContentStatus.Pending);
        var pendingExperiences = await context.InterviewExperiences.CountAsync(e => e.Status == ContentStatus.Pending);
        var totalQuestions = await context.InterviewQuestions.CountAsync();
        var pendingBlogs = await context.Blogs.CountAsync(b => b.Status == ContentStatus.Pending);

        var metrics = new[]
        {
            new { key = "users", label = "Total users", value = totalUsers, todayChange = "+1%", icon = "users", sectionId = "users" },
            new { key = "activeJobs", label = "Active jobs", value = activeJobs, todayChange = "+2%", icon = "jobs", sectionId = "jobs" },
            new { key = "pendingJobs", label = "Pending jobs", value = pendingJobs, todayChange = "--", icon = "pending", sectionId = "jobs" },
            new { key = "pendingExperiences", label = "Pending experiences", value = pendingExperiences, todayChange = "--", icon = "experiences", sectionId = "interview-experiences" },
            new { key = "questions", label = "Total questions", value = totalQuestions, todayChange = "+3%", icon = "questions", sectionId = "interview-questions" },
            new { key = "pendingBlogs", label = "Pending blogs", value = pendingBlogs, todayChange = "--", icon = "blogs", sectionId = "blogs" }
        };

        var quickActions = new[]
        {
            new { label = "Post a new job", sectionId = "jobs", variant = "primary" },
            new { label = "Review pending content", sectionId = "interview-experiences", variant = "secondary" }
        };

        var recentActivity = new[]
        {
            new
            {
                key = "jobs",
                title = "Recent job approvals",
                items = new object[] { },
                emptyState = "No recent job approvals yet."
            },
            new
            {
                key = "questions",
                title = "Recent question activity",
                items = new object[] { },
                emptyState = "No question activity yet."
            },
            new
            {
                key = "experiences",
                title = "Recent experience updates",
                items = new object[] { },
                emptyState = "No experience updates yet."
            }
        };

        return Ok(new
        {
            metrics,
            quickActions,
            recentActivity
        });
    }

    [HttpGet("dashboard-stats")]
    public async Task<IActionResult> DashboardStats()
    {
        var totalUsers = await context.Users.CountAsync();
        var activeJobs = await context.Jobs.CountAsync(j => j.Status == ContentStatus.Approved);
        var pendingJobs = await context.Jobs.CountAsync(j => j.Status == ContentStatus.Pending);
        var pendingExperiences = await context.InterviewExperiences.CountAsync(e => e.Status == ContentStatus.Pending);
        var totalQuestions = await context.InterviewQuestions.CountAsync();

        return Ok(new
        {
            totalUsers,
            activeJobs,
            pendingJobs,
            pendingExperiences,
            totalQuestions
        });
    }

}
