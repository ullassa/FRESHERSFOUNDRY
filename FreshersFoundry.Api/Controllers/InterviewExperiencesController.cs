using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreshersFoundry.Api.Controllers;

using FreshersFoundry.Api.Data;
using FreshersFoundry.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/interview-experiences")]
public class InterviewExperiencesController : ControllerBase
{
    private readonly ApplicationDbContext context;

    public InterviewExperiencesController(ApplicationDbContext context)
    {
        this.context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await context.InterviewExperiences
            .Where(experience => experience.Status == ContentStatus.Approved)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return Ok(new { items });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var item = await context.InterviewExperiences.FindAsync(id);
        if (item is null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateInterviewExperienceRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var user = await context.Users.FindAsync(Guid.Parse(userId));
        if (user is null) return Unauthorized();

        var experience = new InterviewExperience
        {
            Id = Guid.NewGuid(),
            CompanyName = request.CompanyName.Trim(),
            RoleAppliedFor = request.RoleAppliedFor.Trim(),
            InterviewRounds = request.InterviewRounds.Trim(),
            Difficulty = Enum.Parse<DifficultyLevel>(request.Difficulty, true),
            Result = Enum.Parse<InterviewResult>(request.Result, true),
            Content = request.Content.Trim(),
            IsAnonymous = request.IsAnonymous,
            SubmittedById = user.Id,
            CreatedAt = DateTime.UtcNow,
            Status = user.Role == UserRole.Admin ? ContentStatus.Approved : ContentStatus.Pending
        };

        context.InterviewExperiences.Add(experience);
        await context.SaveChangesAsync();

        return Ok(experience);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateInterviewExperienceRequest update)
    {
        var item = await context.InterviewExperiences.FindAsync(id);
        if (item is null) return NotFound();

        item.CompanyName = update.CompanyName.Trim();
        item.RoleAppliedFor = update.RoleAppliedFor.Trim();
        item.InterviewRounds = update.InterviewRounds.Trim();
        item.Difficulty = Enum.Parse<DifficultyLevel>(update.Difficulty, true);
        item.Result = Enum.Parse<InterviewResult>(update.Result, true);
        item.Content = update.Content.Trim();
        item.IsAnonymous = update.IsAnonymous;

        await context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await context.InterviewExperiences.FindAsync(id);
        if (item is null) return NotFound();
        context.InterviewExperiences.Remove(item);
        await context.SaveChangesAsync();
        return Ok(new { id });
    }

    [HttpPut("{id:guid}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var item = await context.InterviewExperiences.FindAsync(id);
        if (item is null) return NotFound();
        item.Status = ContentStatus.Approved;
        await context.SaveChangesAsync();
        return Ok(new { id, status = "approved" });
    }

    [HttpPut("{id:guid}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var item = await context.InterviewExperiences.FindAsync(id);
        if (item is null) return NotFound();
        item.Status = ContentStatus.Rejected;
        await context.SaveChangesAsync();
        return Ok(new { id, status = "rejected" });
    }
}
