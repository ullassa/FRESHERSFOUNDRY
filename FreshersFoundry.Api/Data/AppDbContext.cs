using Microsoft.EntityFrameworkCore;

namespace FreshersFoundry.Api.Data;

// Compatibility shim: keep the original AppDbContext type so existing
// migrations and references continue to work. It inherits the new
// ApplicationDbContext implementation.
public class AppDbContext : ApplicationDbContext
{
    public AppDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }
}
