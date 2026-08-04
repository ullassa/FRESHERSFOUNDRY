using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreshersFoundry.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookmarksController : ControllerBase
{
    [HttpPost]
    [Authorize]
    public IActionResult Create() => Ok(new { message = "Bookmark create endpoint scaffolded." });

    [HttpGet("mine")]
    [Authorize]
    public IActionResult Mine() => Ok(new { items = Array.Empty<object>() });

    [HttpDelete("{id:guid}")]
    [Authorize]
    public IActionResult Delete(Guid id) => Ok(new { id, message = "Bookmark delete endpoint scaffolded." });
}
