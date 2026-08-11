using System;

namespace FreshersFoundry.Api.Models;

public class Bookmark
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public ContentType ContentType { get; set; }
    public Guid ContentId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
