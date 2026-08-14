using FreshersFoundry.Api.Data;
using FreshersFoundry.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FreshersFoundry.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext context;

    public AdminController(ApplicationDbContext context)
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

        var metrics = new List<AdminMetricDto>
        {
            new AdminMetricDto("users", "Total users", (long?)totalUsers, "+1%", "users", "users"),
            new AdminMetricDto("activeJobs", "Active jobs", (long?)activeJobs, "+2%", "jobs", "jobs"),
            new AdminMetricDto("pendingJobs", "Pending jobs", (long?)pendingJobs, "--", "pending", "jobs"),
            new AdminMetricDto("pendingExperiences", "Pending experiences", (long?)pendingExperiences, "--", "experiences", "interview-experiences"),
            new AdminMetricDto("questions", "Total questions", (long?)totalQuestions, "+3%", "questions", "interview-questions"),
            new AdminMetricDto("pendingBlogs", "Pending blogs", (long?)pendingBlogs, "--", "blogs", "blogs")
        };

        var quickActions = new List<AdminQuickActionDto>
        {
            new AdminQuickActionDto("Post a new job", "jobs", "primary"),
            new AdminQuickActionDto("Review pending content", "interview-experiences", "secondary")
        };

        // Recent approved jobs (show latest 5)
        var recentJobs = await context.Jobs
            .Where(j => j.Status == ContentStatus.Approved)
            .OrderByDescending(j => j.CreatedAt)
            .Take(5)
            .Select(j => new AdminActivityItemDto(j.Id, j.Title, j.CompanyName, j.Status.ToString(), "jobs", j.CreatedAt))
            .ToListAsync();

        // Recent questions (latest 5)
        var recentQuestions = await context.InterviewQuestions
            .OrderByDescending(q => q.CreatedAt)
            .Take(5)
            .Select(q => new AdminActivityItemDto(
                q.Id,
                q.Question.Length > 120 ? q.Question.Substring(0, 117) + "..." : q.Question,
                q.Category,
                q.Difficulty.ToString(),
                "questions",
                q.CreatedAt))
            .ToListAsync();

        var recentBlogs = await context.Blogs
            .OrderByDescending(b => b.CreatedAt)
            .Take(5)
            .Select(b => new AdminActivityItemDto(
                b.Id,
                b.Title,
                string.IsNullOrWhiteSpace(b.Tags) ? "No tags" : b.Tags,
                b.Status.ToString(),
                "blogs",
                b.CreatedAt))
            .ToListAsync();

        // Recent approved experiences (show latest 5)
        var recentExperiences = await context.InterviewExperiences
            .Where(e => e.Status == ContentStatus.Approved)
            .OrderByDescending(e => e.CreatedAt)
            .Take(5)
            .Select(e => new AdminActivityItemDto(
                e.Id,
                e.CompanyName,
                e.RoleAppliedFor,
                e.Result.ToString(),
                "interview-experiences",
                e.CreatedAt))
            .ToListAsync();

        var recentActivity = new List<AdminActivityGroupDto>
        {
            new AdminActivityGroupDto("jobs", "Recent job approvals", recentJobs, "No recent job approvals yet."),
            new AdminActivityGroupDto("questions", "Recent question activity", recentQuestions, "No question activity yet."),
            new AdminActivityGroupDto("blogs", "Recent blogs", recentBlogs, "No blogs yet."),
            new AdminActivityGroupDto("experiences", "Recent experience updates", recentExperiences, "No experience updates yet.")
        };

        var response = new AdminDashboardResponse(metrics, quickActions, recentActivity);
        return Ok(response);
    }

    [HttpGet("dashboard-stats")]
    public async Task<IActionResult> DashboardStats()
    {
        var totalUsers = await context.Users.CountAsync();
        var activeJobs = await context.Jobs.CountAsync(j => j.Status == ContentStatus.Approved);
        var pendingJobs = await context.Jobs.CountAsync(j => j.Status == ContentStatus.Pending);
        var pendingExperiences = await context.InterviewExperiences.CountAsync(e => e.Status == ContentStatus.Pending);
        var totalQuestions = await context.InterviewQuestions.CountAsync();
        var pendingApprovals = pendingJobs + pendingExperiences;

        return Ok(new
        {
            totalUsers,
            activeJobs,
            pendingJobs,
            pendingExperiences,
            pendingApprovals,
            totalQuestions
        });
    }

}
