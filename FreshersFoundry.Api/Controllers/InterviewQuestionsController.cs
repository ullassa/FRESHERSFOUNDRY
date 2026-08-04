using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreshersFoundry.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InterviewQuestionsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() => Ok(new { items = Array.Empty<object>() });

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id) => Ok(new { id });

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public IActionResult Create() => Ok(new { message = "Interview question create endpoint scaffolded." });

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public IActionResult Update(Guid id) => Ok(new { id, message = "Interview question update endpoint scaffolded." });

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public IActionResult Delete(Guid id) => Ok(new { id, message = "Interview question delete endpoint scaffolded." });
}
