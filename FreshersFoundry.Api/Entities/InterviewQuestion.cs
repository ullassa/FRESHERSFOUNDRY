using System;

namespace FreshersFoundry.Api.Models;

public class InterviewQuestion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Category { get; set; } = string.Empty;
    // optional sub-topic for finer categorization
    public string? SubTopic { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public DifficultyLevel Difficulty { get; set; }
    // optional code snippet to accompany the question
    public string? CodeSnippet { get; set; }
    public Guid CreatedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
