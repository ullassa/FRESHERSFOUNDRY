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

    [HttpGet("pending-creators")]
    public async Task<IActionResult> PendingCreators()
    {
        var creators = await context.Users
            .Where(u => u.CreatorStatus == CreatorStatus.Pending)
            .ToListAsync();

        return Ok(new { creators });
    }

    [HttpGet("dashboard-stats")]
    public async Task<IActionResult> DashboardStats()
    {
        var totalUsers = await context.Users.CountAsync();
        var pendingContent = await context.InterviewExperiences.CountAsync(e => e.Status == ContentStatus.Pending)
                            + await context.Blogs.CountAsync(b => b.Status == ContentStatus.Pending)
                            + await context.Jobs.CountAsync(j => j.Status == ContentStatus.Pending);
        var activeAds = await context.AdSlots.CountAsync(a => a.IsActive && a.StartDate <= DateTime.UtcNow && a.EndDate >= DateTime.UtcNow);

        return Ok(new { totalUsers, pendingContent, activeAds });
    }

    [HttpGet("ads")]
    public async Task<IActionResult> GetAds()
    {
        var ads = await context.AdSlots.OrderByDescending(a => a.StartDate).ToListAsync();
        return Ok(new { ads });
    }

    [HttpPost("ads")]
    public async Task<IActionResult> CreateAd([FromBody] AdSlot ad)
    {
        ad.Id = Guid.NewGuid();
        ad.CreatedAt = DateTime.UtcNow;
        context.AdSlots.Add(ad);
        await context.SaveChangesAsync();
        return Ok(ad);
    }

    [HttpPut("ads/{id:guid}/toggle")]
    public async Task<IActionResult> ToggleAd(Guid id)
    {
        var ad = await context.AdSlots.FindAsync(id);
        if (ad is null) return NotFound();
        ad.IsActive = !ad.IsActive;
        await context.SaveChangesAsync();
        return Ok(ad);
    }

    [HttpDelete("ads/{id:guid}")]
    public async Task<IActionResult> DeleteAd(Guid id)
    {
        var ad = await context.AdSlots.FindAsync(id);
        if (ad is null) return NotFound();
        context.AdSlots.Remove(ad);
        await context.SaveChangesAsync();
        return Ok(new { id });
    }
}
