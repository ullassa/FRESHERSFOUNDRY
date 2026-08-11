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
    public async Task<IActionResult> Create([FromBody] InterviewExperience request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var user = await context.Users.FindAsync(Guid.Parse(userId));
        if (user is null) return Unauthorized();

        request.Id = Guid.NewGuid();
        request.SubmittedById = user.Id;
        request.CreatedAt = DateTime.UtcNow;
        request.Status = user.Role == UserRole.Admin ? ContentStatus.Approved : ContentStatus.Pending;

        context.InterviewExperiences.Add(request);
        await context.SaveChangesAsync();

        return Ok(request);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] InterviewExperience update)
    {
        var item = await context.InterviewExperiences.FindAsync(id);
        if (item is null) return NotFound();

        item.CompanyName = update.CompanyName;
        item.RoleAppliedFor = update.RoleAppliedFor;
        item.InterviewRounds = update.InterviewRounds;
        item.Difficulty = update.Difficulty;
        item.Result = update.Result;
        item.Content = update.Content;
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
