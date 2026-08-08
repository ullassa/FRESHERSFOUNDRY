using System.ComponentModel.DataAnnotations;

namespace FreshersFoundry.Api.Models;

public enum UserRole
{
    Admin = 1,
    User = 2
}

public enum JobType
{
    FullTime = 1,
    Internship = 2,
    Contract = 3
}

public enum ContentStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3
}

public enum DifficultyLevel
{
    Easy = 1,
    Medium = 2,
    Hard = 3
}

public enum InterviewResult
{
    Pending = 1,
    Selected = 2,
    Rejected = 3
}

public enum ContentType
{
    Job = 1,
    Blog = 2,
    InterviewExperience = 3
}


public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Job
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string CompanyName { get; set; } = string.Empty;

    // optional URL for a company logo
    public string? CompanyLogoUrl { get; set; }

    [Required]
    public string Location { get; set; } = string.Empty;

    public JobType JobType { get; set; }

    // experience level text (e.g. "0-1 years")
    public string? ExperienceLevel { get; set; }

    // salary/stipend range text (e.g. "4-6 LPA")
    public string? SalaryRange { get; set; }

    [Required]
    public string SkillTags { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    [Url]
    public string ApplyLink { get; set; } = string.Empty;

    public Guid PostedById { get; set; }
    public UserRole PostedByRole { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiryDate { get; set; }
}

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

public class Comment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public ContentType ContentType { get; set; }
    public Guid ContentId { get; set; }
    public Guid UserId { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Bookmark
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public ContentType ContentType { get; set; }
    public Guid ContentId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

