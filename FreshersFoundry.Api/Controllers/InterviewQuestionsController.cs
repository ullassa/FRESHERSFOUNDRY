using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreshersFoundry.Api.Controllers;

using FreshersFoundry.Api.Data;
using FreshersFoundry.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/interview-questions")]
public class InterviewQuestionsController : ControllerBase
{
    private readonly AppDbContext context;

    public InterviewQuestionsController(AppDbContext context)
    {
        this.context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await context.InterviewQuestions
            .OrderByDescending(iq => iq.CreatedAt)
            .Select(iq => new InterviewQuestionResponse(iq.Id, iq.Category, iq.SubTopic, iq.Question, iq.Answer, iq.Difficulty.ToString(), iq.CodeSnippet, iq.CreatedById, iq.CreatedAt))
            .ToListAsync();

        return Ok(new { items });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var iq = await context.InterviewQuestions.FindAsync(id);
        if (iq is null) return NotFound();

        return Ok(new InterviewQuestionResponse(iq.Id, iq.Category, iq.SubTopic, iq.Question, iq.Answer, iq.Difficulty.ToString(), iq.CodeSnippet, iq.CreatedById, iq.CreatedAt));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateInterviewQuestionRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var iq = new InterviewQuestion
        {
            Category = request.Category.Trim(),
            SubTopic = string.IsNullOrWhiteSpace(request.SubTopic) ? null : request.SubTopic.Trim(),
            Question = request.Question.Trim(),
            Answer = request.Answer.Trim(),
            Difficulty = Enum.Parse<DifficultyLevel>(request.DifficultyLevel, true),
            CodeSnippet = string.IsNullOrWhiteSpace(request.CodeSnippet) ? null : request.CodeSnippet,
            CreatedById = Guid.Parse(userId)
        };

        context.InterviewQuestions.Add(iq);
        await context.SaveChangesAsync();

        return Ok(new InterviewQuestionResponse(iq.Id, iq.Category, iq.SubTopic, iq.Question, iq.Answer, iq.Difficulty.ToString(), iq.CodeSnippet, iq.CreatedById, iq.CreatedAt));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateInterviewQuestionRequest request)
    {
        var iq = await context.InterviewQuestions.FindAsync(id);
        if (iq is null) return NotFound();

        iq.Category = request.Category.Trim();
        iq.SubTopic = string.IsNullOrWhiteSpace(request.SubTopic) ? null : request.SubTopic.Trim();
        iq.Question = request.Question.Trim();
        iq.Answer = request.Answer.Trim();
        iq.Difficulty = Enum.Parse<DifficultyLevel>(request.DifficultyLevel, true);
        iq.CodeSnippet = string.IsNullOrWhiteSpace(request.CodeSnippet) ? null : request.CodeSnippet;

        await context.SaveChangesAsync();

        return Ok(new InterviewQuestionResponse(iq.Id, iq.Category, iq.SubTopic, iq.Question, iq.Answer, iq.Difficulty.ToString(), iq.CodeSnippet, iq.CreatedById, iq.CreatedAt));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var iq = await context.InterviewQuestions.FindAsync(id);
        if (iq is null) return NotFound();

        context.InterviewQuestions.Remove(iq);
        await context.SaveChangesAsync();

        return Ok(new { id });
    }
}
