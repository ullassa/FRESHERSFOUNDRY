using System;

namespace FreshersFoundry.Api.Models;

public class Blog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public string Tags { get; set; } = string.Empty;
    public Guid AuthorId { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Pending;
    public int Views { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
