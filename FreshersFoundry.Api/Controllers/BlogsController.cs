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
public class BlogsController : ControllerBase
{
    private readonly AppDbContext context;

    public BlogsController(AppDbContext context)
    {
        this.context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await context.Blogs.OrderByDescending(b => b.CreatedAt).ToListAsync();
        return Ok(new { items });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var item = await context.Blogs.FindAsync(id);
        if (item is null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Creator")]
    public async Task<IActionResult> Create([FromBody] CreateBlogRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var user = await context.Users.FindAsync(Guid.Parse(userId));
        if (user is null) return Unauthorized();

        var blog = new Blog
        {
            Title = request.Title.Trim(),
            Content = request.Content.Trim(),
            CoverImageUrl = string.IsNullOrWhiteSpace(request.CoverImageUrl) ? null : request.CoverImageUrl.Trim(),
            Tags = request.Tags ?? string.Empty,
            AuthorId = user.Id,
            Status = user.Role == UserRole.Admin ? ContentStatus.Approved : ContentStatus.Pending
        };

        context.Blogs.Add(blog);
        await context.SaveChangesAsync();

        return Ok(blog);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Creator")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateBlogRequest request)
    {
        var blog = await context.Blogs.FindAsync(id);
        if (blog is null) return NotFound();

        blog.Title = request.Title.Trim();
        blog.Content = request.Content.Trim();
        blog.CoverImageUrl = string.IsNullOrWhiteSpace(request.CoverImageUrl) ? null : request.CoverImageUrl.Trim();
        blog.Tags = request.Tags ?? string.Empty;

        await context.SaveChangesAsync();
        return Ok(blog);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Creator")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var blog = await context.Blogs.FindAsync(id);
        if (blog is null) return NotFound();
        context.Blogs.Remove(blog);
        await context.SaveChangesAsync();
        return Ok(new { id });
    }

    [HttpPut("{id:guid}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var blog = await context.Blogs.FindAsync(id);
        if (blog is null) return NotFound();
        blog.Status = ContentStatus.Approved;
        await context.SaveChangesAsync();
        return Ok(new { id, status = "approved" });
    }

    [HttpPut("{id:guid}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var blog = await context.Blogs.FindAsync(id);
        if (blog is null) return NotFound();
        blog.Status = ContentStatus.Rejected;
        await context.SaveChangesAsync();
        return Ok(new { id, status = "rejected" });
    }
}
