using FreshersFoundry.Api.Data;
using FreshersFoundry.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FreshersFoundry.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PublicController : ControllerBase
{
    private readonly ApplicationDbContext context;

    public PublicController(ApplicationDbContext context)
    {
        this.context = context;
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> Search([FromQuery] string? q)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return Ok(new AdminSearchResponse(q ?? string.Empty, Array.Empty<AdminSearchResultDto>()));
        }

        var pattern = $"%{q}%";

        var jobResults = await context.Jobs
            .Where(j => j.Status == ContentStatus.Approved && (
                EF.Functions.Like(j.Title, pattern) ||
                EF.Functions.Like(j.CompanyName, pattern) ||
                EF.Functions.Like(j.SkillTags, pattern) ||
                EF.Functions.Like(j.Description, pattern)
            ))
            .OrderByDescending(j => j.CreatedAt)
            .Take(10)
            .Select(j => new AdminSearchResultDto("job", j.Title, j.CompanyName, "jobs"))
            .ToListAsync();

        var blogResults = await context.Blogs
            .Where(b => b.Status == ContentStatus.Approved && (
                EF.Functions.Like(b.Title, pattern) ||
                EF.Functions.Like(b.Content, pattern) ||
                EF.Functions.Like(b.Tags, pattern)
            ))
            .OrderByDescending(b => b.CreatedAt)
            .Take(10)
            .Select(b => new AdminSearchResultDto("blog", b.Title, string.IsNullOrWhiteSpace(b.Tags) ? "" : b.Tags, "blogs"))
            .ToListAsync();

        var questionResults = await context.InterviewQuestions
            .Where(qt => EF.Functions.Like(qt.Question, pattern) || EF.Functions.Like(qt.Category, pattern))
            .OrderByDescending(qt => qt.CreatedAt)
            .Take(10)
            .Select(qt => new AdminSearchResultDto("question", qt.Question.Length > 120 ? qt.Question.Substring(0, 117) + "..." : qt.Question, qt.Category, "interview-questions"))
            .ToListAsync();

        var experienceResults = await context.InterviewExperiences
            .Where(e => e.Status == ContentStatus.Approved && (
                EF.Functions.Like(e.CompanyName, pattern) ||
                EF.Functions.Like(e.RoleAppliedFor, pattern) ||
                EF.Functions.Like(e.Content, pattern)
            ))
            .OrderByDescending(e => e.CreatedAt)
            .Take(10)
            .Select(e => new AdminSearchResultDto("experience", e.CompanyName + " — " + e.RoleAppliedFor, e.RoleAppliedFor, "interview-experiences"))
            .ToListAsync();

        var results = new List<AdminSearchResultDto>();
        results.AddRange(jobResults);
        results.AddRange(blogResults);
        results.AddRange(questionResults);
        results.AddRange(experienceResults);

        var response = new AdminSearchResponse(q, results);
        return Ok(response);
    }

    [HttpGet("stats")]
    [AllowAnonymous]
    public async Task<IActionResult> Stats()
    {
        var activeJobs = await context.Jobs.CountAsync(j => j.Status == ContentStatus.Approved);
        var interviewStories = await context.InterviewExperiences.CountAsync(e => e.Status == ContentStatus.Approved);
        var practiceQuestions = await context.InterviewQuestions.CountAsync();
        var expertBlogs = await context.Blogs.CountAsync(b => b.Status == ContentStatus.Approved);

        return Ok(new
        {
            activeJobs,
            interviewStories,
            practiceQuestions,
            expertBlogs
        });
    }

    [HttpGet("latest-jobs")]
    [AllowAnonymous]
    public async Task<IActionResult> LatestJobs([FromQuery] int take = 6)
    {
        var jobs = await context.Jobs
            .Where(j => j.Status == ContentStatus.Approved)
            .OrderByDescending(j => j.CreatedAt)
            .Take(take)
            .Select(j => new
            {
                j.Id,
                j.Title,
                j.CompanyName,
                j.CompanyLogoUrl,
                j.Location,
                j.JobType,
                j.ExperienceLevel,
                j.SalaryRange,
                j.SkillTags,
                j.ApplyLink,
                j.CreatedAt
            })
            .ToListAsync();

        return Ok(new { items = jobs });
    }
}
