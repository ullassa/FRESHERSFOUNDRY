using System;
using System.ComponentModel.DataAnnotations;

namespace FreshersFoundry.Api.Models;

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
