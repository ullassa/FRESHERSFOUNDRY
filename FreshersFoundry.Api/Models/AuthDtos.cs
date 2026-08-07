namespace FreshersFoundry.Api.Models;

public sealed record RegisterRequest(string FullName, string Email, string Password);
public sealed record LoginRequest(string Email, string Password);
public sealed record AuthResponse(Guid Id, string FullName, string Email, string Role, string Token);
public sealed record CreateJobRequest(string Title, string CompanyName, string CompanyLogoUrl, string Location, string JobType, string ExperienceLevel, string SalaryRange, string SkillTags, string Description, string ApplyLink, DateTime? ExpiryDate);
public sealed record JobCreateResponse(Guid Id, string Title, string CompanyName, string CompanyLogoUrl, string Location, string JobType, string ExperienceLevel, string SalaryRange, string SkillTags, string Description, string ApplyLink, DateTime? ExpiryDate, Guid PostedById, string Status, DateTime CreatedAt);

public sealed record CreateInterviewQuestionRequest(string Category, string? SubTopic, string Question, string Answer, string DifficultyLevel, string? CodeSnippet);
public sealed record InterviewQuestionResponse(Guid Id, string Category, string? SubTopic, string Question, string Answer, string DifficultyLevel, string? CodeSnippet, Guid CreatedById, DateTime CreatedAt);
public sealed record CreateBlogRequest(string Title, string Content, string? CoverImageUrl, string? Tags);
