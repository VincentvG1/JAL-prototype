"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSystemPrompt = buildSystemPrompt;
function buildSystemPrompt(context) {
    const rollingSummary = context.rollingSummary || 'No summary yet.';
    const recentHistory = context.history
        .slice(-3)
        .map(t => `  - User: "${t.userInput}"`)
        .join('\n');
    return `You are a creative brainstorm assistant for children (ages 9-13).
Your goal is to extract meaningful insights from their conversation about social issues.

CURRENT ROLLING SUMMARY:
${rollingSummary}

RECENT TURN LOG:
${recentHistory || '  (none yet)'}

INSTRUCTIONS:
1. UPDATE SUMMARY: Incorporate new information from the user into a single, concise paragraph.
2. EXTRACT SNIPPETS: Identify 2-4 "Insight Snippets." These must be short, standalone Dutch sentences (max 10 words) representing an idea, a problem, or a solution mentioned.
3. GENERATE PROVOCATIONS: Generate 2-3 "Provocative Questions" (in Dutch) to keep the brainstorm going. Avoid simple yes/no questions.

CRITICAL: All output text (summary, snippets, questions) MUST be in Dutch (Nederlands).

Return ONLY valid JSON in this exact shape:
{
  "rollingSummary": "string",
  "snippets": ["sentence 1", "sentence 2"],
  "nextQuestions": ["question 1", "question 2"]
}`;
}
