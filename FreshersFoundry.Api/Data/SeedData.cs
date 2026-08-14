using System;
using System.Threading.Tasks;
using FreshersFoundry.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace FreshersFoundry.Api.Data;

public static class SeedData
{
    /// <summary>
    /// Ensures the database exists and creates a default admin only if it does not already exist.
    /// This leaves user-submitted content intact across app restarts.
    /// </summary>
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        var adminId = Guid.Empty;
        if (!context.Users.Any(u => u.Email == "admin@local"))
        {
            var hasher = new PasswordHasher<User>();
            var passwordHash = hasher.HashPassword(new User(), "Password123!");
            adminId = Guid.NewGuid();

            if (context.Database.IsRelational())
            {
                var createdAt = DateTime.UtcNow;
                await context.Database.ExecuteSqlRawAsync(
                    "INSERT INTO [Users] (Id, CreatedAt, Email, FullName, PasswordHash, Role, CreatorStatus) VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6})",
                    adminId, createdAt, "admin@local", "Administrator", passwordHash, (int)UserRole.Admin, 0);
            }
            else
            {
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    CreatedAt = DateTime.UtcNow,
                    Email = "admin@local",
                    FullName = "Administrator",
                    PasswordHash = passwordHash,
                    Role = UserRole.Admin
                };
                context.Users.Add(user);
                adminId = user.Id;
                await context.SaveChangesAsync();
            }
        }
        else
        {
            var admin = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@local");
            if (admin != null) adminId = admin.Id;
        }

        // Seed interview questions if none exist
        if (!context.InterviewQuestions.Any())
        {
            var questions = new List<InterviewQuestion>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Category = "Java",
                    SubTopic = "OOP Concepts",
                    Question = "What is the difference between abstract class and interface in Java?",
                    Answer = "Abstract classes can have constructors, instance variables, and methods with implementation. Interfaces can only have method signatures and constants. A class can implement multiple interfaces but can only extend one abstract class.",
                    Difficulty = DifficultyLevel.Medium,
                    CreatedById = adminId,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-10)
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Category = "Java",
                    SubTopic = "Exception Handling",
                    Question = "Explain the difference between checked and unchecked exceptions.",
                    Answer = "Checked exceptions are checked at compile-time (e.g., IOException, SQLException). The compiler forces you to handle them. Unchecked exceptions are checked at runtime (e.g., NullPointerException, ArithmeticException).",
                    Difficulty = DifficultyLevel.Easy,
                    CreatedById = adminId,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-20)
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Category = "SQL",
                    SubTopic = "Joins",
                    Question = "Write a query to find the second highest salary in an employee table using window functions.",
                    Answer = "SELECT DISTINCT salary FROM employees WHERE salary < (SELECT MAX(salary) FROM employees) ORDER BY salary DESC LIMIT 1; OR using window functions: SELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rank FROM employees) WHERE rank = 2;",
                    Difficulty = DifficultyLevel.Medium,
                    CreatedById = adminId,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-30)
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Category = "React",
                    SubTopic = "Hooks",
                    Question = "What is the useState hook and how do you use it?",
                    Answer = "useState is a React Hook that lets you add state to functional components. It returns an array with two elements: the current state and a function to update it. Example: const [count, setCount] = useState(0);",
                    Difficulty = DifficultyLevel.Easy,
                    CreatedById = adminId,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-40)
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Category = "HR",
                    SubTopic = "Behavioral",
                    Question = "Tell me about a time when you faced a challenge in a project and how you handled it.",
                    Answer = "This is a STAR method question. Describe the Situation, Task, Action you took, and Result. Focus on what you learned and how it helped you grow professionally.",
                    Difficulty = DifficultyLevel.Easy,
                    CreatedById = adminId,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-50)
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Category = "Data Structures",
                    SubTopic = "Arrays",
                    Question = "Write a function to find the longest substring without repeating characters.",
                    Answer = "Use a sliding window approach with a HashMap to track character indices. Move the right pointer and expand the window, shrink from left when duplicate found. Time complexity: O(n).",
                    Difficulty = DifficultyLevel.Hard,
                    CreatedById = adminId,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-60)
                }
            };

            context.InterviewQuestions.AddRange(questions);
            await context.SaveChangesAsync();
        }
    }
}
