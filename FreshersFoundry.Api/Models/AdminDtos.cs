namespace FreshersFoundry.Api.Models;

public sealed record AdminMetricDto(string Key, string Label, long? Value, string? TodayChange, string Icon, string SectionId);
public sealed record AdminQuickActionDto(string Label, string SectionId, string Variant);
public sealed record AdminActivityItemDto(Guid Id, string Title, string Subtitle, string Status, string SectionId, DateTime CreatedAt);
public sealed record AdminActivityGroupDto(string Key, string Title, IReadOnlyList<AdminActivityItemDto> Items, string EmptyState);
public sealed record AdminDashboardResponse(IReadOnlyList<AdminMetricDto> Metrics, IReadOnlyList<AdminQuickActionDto> QuickActions, IReadOnlyList<AdminActivityGroupDto> RecentActivity);
public sealed record AdminSearchResultDto(string Type, string Title, string Subtitle, string SectionId);
public sealed record AdminSearchResponse(string Query, IReadOnlyList<AdminSearchResultDto> Results);