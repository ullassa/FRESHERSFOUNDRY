using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreshersFoundry.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    [HttpPost]
    [Authorize]
    public IActionResult Create() => Ok(new { message = "Comment create endpoint scaffolded." });

    [HttpGet]
    public IActionResult Get([FromQuery] string? contentType, [FromQuery] Guid? contentId)
        => Ok(new { contentType, contentId, items = Array.Empty<object>() });
}
