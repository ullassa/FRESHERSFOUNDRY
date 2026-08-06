namespace FreshersFoundry.Api.Models;

public enum UserRole
{
    Admin = 1,
    Creator = 2,
    User = 3
}

public enum CreatorStatus
{
    None = 0,
    Pending = 1,
    Approved = 2,
    Rejected = 3
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

public enum AdSlotType
{
    Banner = 1,
    SponsoredJob = 2,
    SponsoredBlog = 3
}

public enum AdPlacement
{
    HomeTop = 1,
    HomeSidebar = 2,
    JobsListTop = 3,
    BlogsListTop = 4,
    InterviewExperienceDetailBottom = 5
}

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public CreatorStatus CreatorStatus { get; set; } = CreatorStatus.None;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Job
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    // optional URL for a company logo
    public string? CompanyLogoUrl { get; set; }
    public string Location { get; set; } = string.Empty;
    public JobType JobType { get; set; }
    // experience level text (e.g. "0-1 years")
    public string? ExperienceLevel { get; set; }
    // salary/stipend range text (e.g. "4-6 LPA")
    public string? SalaryRange { get; set; }
    public string SkillTags { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
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

public class AdSlot
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public AdSlotType Type { get; set; }
    public AdPlacement Placement { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string TargetUrl { get; set; } = string.Empty;
    public string SponsorName { get; set; } = string.Empty;
    public Guid? LinkedContentId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public int ClickCount { get; set; }
    public int ImpressionCount { get; set; }
    public Guid CreatedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
