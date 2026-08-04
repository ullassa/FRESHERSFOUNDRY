namespace FreshersFoundry.Api.Models;

public sealed record RegisterRequest(string FullName, string Email, string Password);
public sealed record LoginRequest(string Email, string Password);
public sealed record AuthResponse(Guid Id, string FullName, string Email, string Role, string Token);
