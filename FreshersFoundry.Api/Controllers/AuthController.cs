using FreshersFoundry.Api.Data;
using FreshersFoundry.Api.Models;
using FreshersFoundry.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FreshersFoundry.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext context;
    private readonly IPasswordHasher<User> passwordHasher;
    private readonly ITokenService tokenService;

    public AuthController(AppDbContext context, IPasswordHasher<User> passwordHasher, ITokenService tokenService)
    {
        this.context = context;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await context.Users.AnyAsync(user => user.Email == email))
        {
            return BadRequest(new { message = "Email already exists." });
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            Role = UserRole.User
        };

        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var token = tokenService.CreateToken(user.Id.ToString(), user.FullName, user.Email, user.Role.ToString());

        return Ok(new AuthResponse(user.Id, user.FullName, user.Email, user.Role.ToString(), token));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await context.Users.FirstOrDefaultAsync(candidate => candidate.Email == email);

        if (user is null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var verification = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var token = tokenService.CreateToken(user.Id.ToString(), user.FullName, user.Email, user.Role.ToString());

        return Ok(new AuthResponse(user.Id, user.FullName, user.Email, user.Role.ToString(), token));
    }

    [HttpPost("admin-login")]
    public async Task<IActionResult> AdminLogin([FromBody] LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await context.Users.FirstOrDefaultAsync(candidate => candidate.Email == email && candidate.Role == UserRole.Admin);

        if (user is null)
        {
            return Unauthorized(new { message = "Invalid admin email or password." });
        }

        var verification = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { message = "Invalid admin email or password." });
        }

        var token = tokenService.CreateToken(user.Id.ToString(), user.FullName, user.Email, user.Role.ToString());

        return Ok(new AuthResponse(user.Id, user.FullName, user.Email, user.Role.ToString(), token));
    }

}
