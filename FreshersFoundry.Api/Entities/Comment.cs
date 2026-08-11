using System;

namespace FreshersFoundry.Api.Models;

public class Comment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public ContentType ContentType { get; set; }
    public Guid ContentId { get; set; }
    public Guid UserId { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
