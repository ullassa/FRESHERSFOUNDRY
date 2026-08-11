using System;

namespace FreshersFoundry.Api.Models;

public class InterviewExperience
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CompanyName { get; set; } = string.Empty;
    public string RoleAppliedFor { get; set; } = string.Empty;
    public string InterviewRounds { get; set; } = string.Empty;
    public DifficultyLevel Difficulty { get; set; }
    public InterviewResult Result { get; set; } = InterviewResult.Pending;
    public string Content { get; set; } = string.Empty;
    public bool IsAnonymous { get; set; }
    public Guid SubmittedById { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Pending;
    public int Views { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
