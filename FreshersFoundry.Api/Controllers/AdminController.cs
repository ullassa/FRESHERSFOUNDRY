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
    private readonly AppDbContext context;

    public AdminController(AppDbContext context)
    {
        this.context = context;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<AdminDashboardResponse>> Dashboard(CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.Date;

        var jobs = await context.Jobs.AsNoTracking().ToListAsync(cancellationToken);
        var blogs = await context.Blogs.AsNoTracking().ToListAsync(cancellationToken);
        var experiences = await context.InterviewExperiences.AsNoTracking().ToListAsync(cancellationToken);
        var questions = await context.InterviewQuestions.AsNoTracking().ToListAsync(cancellationToken);
        var users = await context.Users.AsNoTracking().ToListAsync(cancellationToken);

        var metrics = new[]
        {
            Metric("totalJobs", "Total Jobs", jobs.Count, jobs.Count(job => job.CreatedAt.Date == today), "jobs", "jobs"),
            Metric("publishedJobs", "Published Jobs", jobs.Count(job => job.Status == ContentStatus.Approved), jobs.Count(job => job.Status == ContentStatus.Approved && job.CreatedAt.Date == today), "jobs", "jobs"),
            Metric("draftJobs", "Draft Jobs", jobs.Count(job => job.Status == ContentStatus.Pending), jobs.Count(job => job.Status == ContentStatus.Pending && job.CreatedAt.Date == today), "jobs", "jobs"),
            Metric("blogs", "Blogs", blogs.Count, blogs.Count(blog => blog.CreatedAt.Date == today), "blogs", "blogs"),
            Metric("interviewExperiences", "Interview Experiences", experiences.Count, experiences.Count(experience => experience.CreatedAt.Date == today), "experiences", "interview-experiences"),
            Metric("questions", "Questions", questions.Count, questions.Count(question => question.CreatedAt.Date == today), "questions", "interview-questions"),
            Metric("users", "Users", users.Count, users.Count(user => user.CreatedAt.Date == today), "users", "users"),
            Metric("premiumMembers", "Premium Members", users.Count(user => user.Role == UserRole.Creator && user.CreatorStatus == CreatorStatus.Approved), users.Count(user => user.Role == UserRole.Creator && user.CreatorStatus == CreatorStatus.Approved && user.CreatedAt.Date == today), "members", "creators"),
            Metric("courses", "Courses", null, null, "courses", "courses"),
            Metric("revenue", "Revenue", null, null, "revenue", "reports"),
            Metric("websiteVisitors", "Website Visitors", null, null, "visitors", "analytics")
        };

        var quickActions = new[]
        {
            new AdminQuickActionDto("Post New Job", "jobs", "primary"),
            new AdminQuickActionDto("Write Blog", "blogs", "secondary"),
            new AdminQuickActionDto("Add Interview Questions", "interview-questions", "secondary"),
            new AdminQuickActionDto("Create Course", "courses", "secondary"),
            new AdminQuickActionDto("Create Webinar", "webinars", "secondary"),
            new AdminQuickActionDto("Add Advertisement", "advertisements", "secondary"),
            new AdminQuickActionDto("Add Company", "companies", "secondary"),
            new AdminQuickActionDto("Send Notification", "notifications", "secondary")
        };

        var recentActivity = new[]
        {
            new AdminActivityGroupDto(
                "recentJobs",
                "Recent Jobs",
                jobs.OrderByDescending(job => job.CreatedAt).Take(5).Select(job => new AdminActivityItemDto(
                    job.Title,
                    $"{job.CompanyName} · {job.Location}",
                    job.Status.ToString(),
                    "jobs",
                    job.CreatedAt)).ToList(),
                "No Recent Activity"),
            new AdminActivityGroupDto(
                "recentBlogs",
                "Recently Published Blogs",
                blogs.Where(blog => blog.Status == ContentStatus.Approved)
                    .OrderByDescending(blog => blog.CreatedAt)
                    .Take(5)
                    .Select(blog => new AdminActivityItemDto(
                        blog.Title,
                        string.IsNullOrWhiteSpace(blog.Tags) ? "Blog" : blog.Tags,
                        blog.Status.ToString(),
                        "blogs",
                        blog.CreatedAt))
                    .ToList(),
                "No Recent Activity"),
            new AdminActivityGroupDto(
                "recentUsers",
                "Latest Users",
                users.OrderByDescending(user => user.CreatedAt).Take(5).Select(user => new AdminActivityItemDto(
                    user.FullName,
                    user.Email,
                    user.Role.ToString(),
                    "users",
                    user.CreatedAt)).ToList(),
                "No Recent Activity"),
            new AdminActivityGroupDto(
                "recentPremiumPurchases",
                "Recent Premium Purchases",
                Array.Empty<AdminActivityItemDto>(),
                "No Recent Activity"),
            new AdminActivityGroupDto(
                "recentExperiences",
                "Latest Interview Experiences",
                experiences.OrderByDescending(experience => experience.CreatedAt).Take(5).Select(experience => new AdminActivityItemDto(
                    experience.CompanyName,
                    experience.RoleAppliedFor,
                    experience.Status.ToString(),
                    "interview-experiences",
                    experience.CreatedAt)).ToList(),
                "No Recent Activity")
        };

        return Ok(new AdminDashboardResponse(metrics, quickActions, recentActivity));
    }

    [HttpGet("search")]
    public async Task<ActionResult<AdminSearchResponse>> Search([FromQuery] string? query, CancellationToken cancellationToken)
    {
        var term = query?.Trim();
        if (string.IsNullOrWhiteSpace(term))
        {
            return Ok(new AdminSearchResponse(string.Empty, Array.Empty<AdminSearchResultDto>()));
        }

        var normalized = term.ToLowerInvariant();

        var jobs = await context.Jobs.AsNoTracking()
            .Where(job => job.Title.ToLower().Contains(normalized) || job.CompanyName.ToLower().Contains(normalized) || job.Location.ToLower().Contains(normalized) || job.SkillTags.ToLower().Contains(normalized))
            .OrderByDescending(job => job.CreatedAt)
            .Take(5)
            .Select(job => new AdminSearchResultDto("Job", job.Title, $"{job.CompanyName} · {job.Location}", "jobs"))
            .ToListAsync(cancellationToken);

        var blogs = await context.Blogs.AsNoTracking()
            .Where(blog => blog.Title.ToLower().Contains(normalized) || blog.Tags.ToLower().Contains(normalized))
            .OrderByDescending(blog => blog.CreatedAt)
            .Take(5)
            .Select(blog => new AdminSearchResultDto("Blog", blog.Title, string.IsNullOrWhiteSpace(blog.Tags) ? "Blog" : blog.Tags, "blogs"))
            .ToListAsync(cancellationToken);

        var questions = await context.InterviewQuestions.AsNoTracking()
            .Where(question => question.Question.ToLower().Contains(normalized) || question.Category.ToLower().Contains(normalized))
            .OrderByDescending(question => question.CreatedAt)
            .Take(5)
            .Select(question => new AdminSearchResultDto("Question", question.Question, question.Category, "interview-questions"))
            .ToListAsync(cancellationToken);

        var users = await context.Users.AsNoTracking()
            .Where(user => user.FullName.ToLower().Contains(normalized) || user.Email.ToLower().Contains(normalized))
            .OrderByDescending(user => user.CreatedAt)
            .Take(5)
            .Select(user => new AdminSearchResultDto("User", user.FullName, user.Email, "users"))
            .ToListAsync(cancellationToken);

        var companies = await context.Jobs.AsNoTracking()
            .Where(job => job.CompanyName.ToLower().Contains(normalized))
            .Select(job => job.CompanyName)
            .Distinct()
            .Take(5)
            .Select(companyName => new AdminSearchResultDto("Company", companyName, "Live company data", "jobs"))
            .ToListAsync(cancellationToken);

        var creators = await context.Users.AsNoTracking()
            .Where(user => user.Role == UserRole.Creator && (user.FullName.ToLower().Contains(normalized) || user.Email.ToLower().Contains(normalized)))
            .OrderByDescending(user => user.CreatedAt)
            .Take(5)
            .Select(user => new AdminSearchResultDto("Creator", user.FullName, user.Email, "creators"))
            .ToListAsync(cancellationToken);

        var results = jobs
            .Concat(blogs)
            .Concat(questions)
            .Concat(users)
            .Concat(companies)
            .Concat(creators)
            .ToList();

        return Ok(new AdminSearchResponse(term, results));
    }

    private static AdminMetricDto Metric(string key, string label, long? value, long? todayCount, string icon, string sectionId)
    {
        return new AdminMetricDto(key, label, value, value.HasValue && todayCount.HasValue ? $"+{todayCount.Value} today" : null, icon, sectionId);
    }
}
