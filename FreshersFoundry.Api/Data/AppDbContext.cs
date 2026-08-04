using FreshersFoundry.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FreshersFoundry.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<Blog> Blogs => Set<Blog>();
    public DbSet<InterviewExperience> InterviewExperiences => Set<InterviewExperience>();
    public DbSet<InterviewQuestion> InterviewQuestions => Set<InterviewQuestion>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Bookmark> Bookmarks => Set<Bookmark>();
    public DbSet<AdSlot> AdSlots => Set<AdSlot>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(user => user.Email)
            .IsUnique();

        modelBuilder.Entity<Job>().Property(job => job.SkillTags).HasMaxLength(1000);
        modelBuilder.Entity<Blog>().Property(blog => blog.Tags).HasMaxLength(1000);
        modelBuilder.Entity<Comment>().Property(comment => comment.ContentType).HasMaxLength(64);
        modelBuilder.Entity<Bookmark>().Property(bookmark => bookmark.ContentType).HasMaxLength(64);
    }
}
