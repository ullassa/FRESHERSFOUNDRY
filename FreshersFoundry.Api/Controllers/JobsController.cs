using FreshersFoundry.Api.Data;
using FreshersFoundry.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FreshersFoundry.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly AppDbContext context;

    public JobsController(AppDbContext context)
    {
        this.context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? skill, [FromQuery] string? location, [FromQuery] string? type)
    {
        var query = context.Jobs.Where(job => job.Status == ContentStatus.Approved).AsQueryable();

        if (!string.IsNullOrWhiteSpace(skill))
        {
            query = query.Where(job => job.SkillTags.Contains(skill));
        }

        if (!string.IsNullOrWhiteSpace(location))
        {
            query = query.Where(job => job.Location.Contains(location));
        }

        if (!string.IsNullOrWhiteSpace(type) && Enum.TryParse<JobType>(type, true, out var parsedType))
        {
            query = query.Where(job => job.JobType == parsedType);
        }

        var items = await query
            .OrderByDescending(job => job.CreatedAt)
            .Select(job => new
            {
                job.Id,
                job.Title,
                job.CompanyName,
                job.Location,
                job.JobType,
                job.SkillTags,
                job.Description,
                job.ApplyLink,
                job.CreatedAt
            })
            .ToListAsync();

        return Ok(new { skill, location, type, items });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var job = await context.Jobs.FirstOrDefaultAsync(candidate => candidate.Id == id);
        if (job is null)
        {
            return NotFound(new { message = "Job not found." });
        }

        return Ok(new
        {
            job.Id,
            job.Title,
            job.CompanyName,
            job.Location,
            job.JobType,
            job.SkillTags,
            job.Description,
            job.ApplyLink,
            job.PostedById,
            job.PostedByRole,
            job.Status,
            job.CreatedAt
        });
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Creator")]
    public async Task<IActionResult> Create([FromBody] CreateJobRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new { message = "User identity could not be determined." });
        }

        var user = await context.Users.FindAsync(Guid.Parse(userId));
        if (user is null)
        {
            return Unauthorized(new { message = "User not found." });
        }

        var job = new Job
        {
            Title = request.Title.Trim(),
            CompanyName = request.CompanyName.Trim(),
            Location = request.Location.Trim(),
            JobType = Enum.Parse<JobType>(request.JobType, true),
            SkillTags = request.SkillTags.Trim(),
            Description = request.Description.Trim(),
            ApplyLink = request.ApplyLink.Trim(),
            PostedById = user.Id,
            PostedByRole = user.Role,
            Status = user.Role == UserRole.Admin ? ContentStatus.Approved : ContentStatus.Pending
        };

        context.Jobs.Add(job);
        await context.SaveChangesAsync();

        return Ok(new JobCreateResponse(
            job.Id,
            job.Title,
            job.CompanyName,
            job.Location,
            job.JobType.ToString(),
            job.SkillTags,
            job.Description,
            job.ApplyLink,
            job.PostedById,
            job.Status.ToString(),
            job.CreatedAt));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Creator")]
    public IActionResult Update(Guid id) => Ok(new { id, message = "Job update endpoint scaffolded." });

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Creator")]
    public IActionResult Delete(Guid id) => Ok(new { id, message = "Job delete endpoint scaffolded." });

    [HttpPut("{id:guid}/approve")]
    [Authorize(Roles = "Admin")]
    public IActionResult Approve(Guid id) => Ok(new { id, status = "approved" });

    [HttpPut("{id:guid}/reject")]
    [Authorize(Roles = "Admin")]
    public IActionResult Reject(Guid id) => Ok(new { id, status = "rejected" });
}
