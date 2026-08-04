using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreshersFoundry.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll([FromQuery] string? skill, [FromQuery] string? location, [FromQuery] string? type)
        => Ok(new { skill, location, type, items = Array.Empty<object>() });

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id) => Ok(new { id });

    [HttpPost]
    [Authorize(Roles = "Admin,Creator")]
    public IActionResult Create() => Ok(new { message = "Job create endpoint scaffolded." });

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Creator")]
    public IActionResult Update(Guid id) => Ok(new { id, message = "Job update endpoint scaffolded." });

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Creator")]
    public IActionResult Delete(Guid id) => Ok(new { id, message = "Job delete endpoint scaffolded." });

    [HttpPut("{id:guid}/approve")]
    [Authorize(Roles = "Admin")]
    public IActionResult Approve(Guid id) => Ok(new { id, status = "approved" });

    [HttpPut("{id:guid}/reject")]
    [Authorize(Roles = "Admin")]
    public IActionResult Reject(Guid id) => Ok(new { id, status = "rejected" });
}
