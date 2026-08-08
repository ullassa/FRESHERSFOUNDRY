using FreshersFoundry.Api.Data;
using FreshersFoundry.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FreshersFoundry.Api.Controllers;

using FreshersFoundry.Api.Data;
using FreshersFoundry.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    [HttpGet("pending-content")]
    public IActionResult PendingContent() => Ok(new { items = Array.Empty<object>() });

    [HttpGet("pending-creators")]
    public IActionResult PendingCreators() => Ok(new { items = Array.Empty<object>() });

    [HttpGet("dashboard-stats")]
    public IActionResult DashboardStats() => Ok(new { totalUsers = 0, pendingContent = 0, activeAds = 0 });
}
