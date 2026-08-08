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
    [AllowAnonymous]
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
                job.CompanyLogoUrl,
                job.Location,
                job.JobType,
                job.ExperienceLevel,
                job.SalaryRange,
                job.SkillTags,
                job.Description,
                job.ApplyLink,
                job.ExpiryDate,
                job.CreatedAt
            })
            .ToListAsync();

        return Ok(new { skill, location, type, items });
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var job = await context.Jobs.FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.Status == ContentStatus.Approved);
        if (job is null)
        {
            return NotFound(new { message = "Job not found." });
        }

        return Ok(new
        {
            job.Id,
            job.Title,
            job.CompanyName,
            job.CompanyLogoUrl,
            job.Location,
            job.JobType,
            job.ExperienceLevel,
            job.SalaryRange,
            job.SkillTags,
            job.Description,
            job.ApplyLink,
            job.ExpiryDate,
            job.PostedById,
            job.PostedByRole,
            job.Status,
            job.CreatedAt
        });
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateJobRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

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
            CompanyLogoUrl = string.IsNullOrWhiteSpace(request.CompanyLogoUrl) ? null : request.CompanyLogoUrl.Trim(),
            Location = request.Location.Trim(),
            JobType = Enum.Parse<JobType>(request.JobType, true),
            ExperienceLevel = string.IsNullOrWhiteSpace(request.ExperienceLevel) ? null : request.ExperienceLevel.Trim(),
            SalaryRange = string.IsNullOrWhiteSpace(request.SalaryRange) ? null : request.SalaryRange.Trim(),
            SkillTags = request.SkillTags.Trim(),
            Description = request.Description.Trim(),
            ApplyLink = request.ApplyLink.Trim(),
            ExpiryDate = request.ExpiryDate,
            PostedById = user.Id,
            PostedByRole = user.Role,
            Status = user.Role == UserRole.Admin ? ContentStatus.Approved : ContentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        context.Jobs.Add(job);
        await context.SaveChangesAsync();

        var response = new JobCreateResponse(
            job.Id,
            job.Title,
            job.CompanyName,
            job.CompanyLogoUrl ?? string.Empty,
            job.Location,
            job.JobType.ToString(),
            job.ExperienceLevel ?? string.Empty,
            job.SalaryRange ?? string.Empty,
            job.SkillTags,
            job.Description,
            job.ApplyLink,
            job.ExpiryDate,
            job.PostedById,
            job.Status.ToString(),
            job.CreatedAt);

        return CreatedAtAction(nameof(GetById), new { id = job.Id }, response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public IActionResult Update(Guid id) => Ok(new { id, message = "Job update endpoint scaffolded." });

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public IActionResult Delete(Guid id) => Ok(new { id, message = "Job delete endpoint scaffolded." });

    [HttpPut("{id:guid}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var job = await context.Jobs.FindAsync(id);
        if (job is null)
        {
            return NotFound(new { message = "Job not found." });
        }

        job.Status = ContentStatus.Approved;
        await context.SaveChangesAsync();

        return Ok(new { id, status = "approved" });
    }

    [HttpPut("{id:guid}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var job = await context.Jobs.FindAsync(id);
        if (job is null)
        {
            return NotFound(new { message = "Job not found." });
        }

        job.Status = ContentStatus.Rejected;
        await context.SaveChangesAsync();

        return Ok(new { id, status = "rejected" });
    }
}
