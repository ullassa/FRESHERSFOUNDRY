using FreshersFoundry.Api.Models;

namespace FreshersFoundry.Api.Data;

public static class MvpSeedCatalog
{
    public static IReadOnlyList<InterviewQuestion> InterviewQuestions =>
    [
        new InterviewQuestion { Category = "Java", Question = "What is the difference between JDK, JRE, and JVM?", Answer = "JDK includes tools, JRE includes runtime, and JVM executes bytecode.", Difficulty = DifficultyLevel.Easy },
        new InterviewQuestion { Category = "SQL", Question = "What is a JOIN and when would you use it?", Answer = "JOIN combines rows from related tables using a matching key.", Difficulty = DifficultyLevel.Easy },
        new InterviewQuestion { Category = "HR", Question = "Tell me about yourself.", Answer = "A concise summary of background, strengths, and role fit.", Difficulty = DifficultyLevel.Easy },
        new InterviewQuestion { Category = "React", Question = "What is the virtual DOM?", Answer = "A lightweight representation of the UI used to diff and update efficiently.", Difficulty = DifficultyLevel.Medium },
        new InterviewQuestion { Category = "Angular", Question = "What are standalone components?", Answer = "Components that do not require NgModules and can be bootstrapped directly.", Difficulty = DifficultyLevel.Medium }
    ];

    public static IReadOnlyList<Job> Jobs =>
    [
    ];

    public static IReadOnlyList<Blog> Blogs =>
    [
        new Blog { Title = "How I prepared for my first interview", Content = "<p>Preparation notes and interview learnings.</p>", Tags = "interview,prep", Status = ContentStatus.Approved },
        new Blog { Title = "SQL basics every fresher should know", Content = "<p>Core SQL concepts explained simply.</p>", Tags = "sql,database", Status = ContentStatus.Approved }
    ];

    public static IReadOnlyList<InterviewExperience> InterviewExperiences =>
    [
        new InterviewExperience { CompanyName = "Google", RoleAppliedFor = "SDE Intern", InterviewRounds = "OA, Tech 1, Tech 2, HR", Difficulty = DifficultyLevel.Hard, Result = InterviewResult.Selected, Content = "Detailed first-hand interview narrative.", Status = ContentStatus.Approved },
        new InterviewExperience { CompanyName = "Amazon", RoleAppliedFor = "Support Associate", InterviewRounds = "Screening, HR", Difficulty = DifficultyLevel.Medium, Result = InterviewResult.Pending, Content = "Narrative with notes and round-wise feedback.", Status = ContentStatus.Pending }
    ];

}
