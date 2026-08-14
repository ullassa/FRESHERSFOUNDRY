using FreshersFoundry.Api.Data;
using FreshersFoundry.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FreshersFoundry.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly ApplicationDbContext context;

    public StatsController(ApplicationDbContext context)
    {
        this.context = context;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetStats()
    {
        var activeJobs = await context.Jobs.CountAsync(job => job.Status == ContentStatus.Approved);
        var interviewStories = await context.InterviewExperiences.CountAsync(experience => experience.Status == ContentStatus.Approved);
        var practiceQuestions = await context.InterviewQuestions.CountAsync();
        var expertBlogs = await context.Blogs.CountAsync(blog => blog.Status == ContentStatus.Approved);

        return Ok(new
        {
            activeJobs,
            interviewStories,
            practiceQuestions,
            expertBlogs
        });
    }
}
