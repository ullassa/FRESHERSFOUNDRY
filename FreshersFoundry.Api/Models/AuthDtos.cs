namespace FreshersFoundry.Api.Models;

public sealed record RegisterRequest(string FullName, string Email, string Password);
public sealed record LoginRequest(string Email, string Password);
public sealed record AuthResponse(Guid Id, string FullName, string Email, string Role, string Token);
public sealed record CreateJobRequest(string Title, string CompanyName, string Location, string JobType, string SkillTags, string Description, string ApplyLink);
public sealed record JobCreateResponse(Guid Id, string Title, string CompanyName, string Location, string JobType, string SkillTags, string Description, string ApplyLink, Guid PostedById, string Status, DateTime CreatedAt);
