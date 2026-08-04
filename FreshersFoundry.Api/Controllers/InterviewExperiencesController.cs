using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreshersFoundry.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InterviewExperiencesController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() => Ok(new { items = Array.Empty<object>() });

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id) => Ok(new { id });

    [HttpPost]
    [Authorize]
    public IActionResult Create() => Ok(new { message = "Interview experience submission endpoint scaffolded." });

    [HttpPut("{id:guid}/approve")]
    [Authorize(Roles = "Admin")]
    public IActionResult Approve(Guid id) => Ok(new { id, status = "approved" });

    [HttpPut("{id:guid}/reject")]
    [Authorize(Roles = "Admin")]
    public IActionResult Reject(Guid id) => Ok(new { id, status = "rejected" });
}
