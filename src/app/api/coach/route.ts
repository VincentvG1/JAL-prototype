// ─────────────────────────────────────────────────────────────────────────────
// /api/coach — AI Prompt Coach endpoint (Groq)
//
// Accepts: POST { prompt: string }
// Returns: CoachResponse (see src/types/index.ts)
//
// Requires GROQ_API_KEY in your .env.local
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { CoachRequest, CoachResponse, CoachFeedback } from "@/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ---------------------------------------------------------------------------
// System prompt — shapes the LLM into a Wan 2.1 prompt engineer
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are an expert prompt engineer specialising in the Fal.ai Wan 2.1 text-to-video model.
Your role is to evaluate a user's raw video prompt and return structured JSON feedback.

The Wan 2.1 model generates short 5-second video clips. Great prompts share these traits:
- A clear, concrete subject (person, animal, object, scene)
- Explicit camera motion or perspective (slow dolly-in, aerial pan, handheld close-up, etc.)
- Defined lighting conditions (golden-hour backlight, neon-lit rain, overcast diffuse, etc.)
- Visual style or texture cues (cinematic 35 mm, stop-motion, watercolour, hyper-realistic, etc.)
- Motion description for subjects (walking briskly, leaves swirling, water cascading, etc.)
- Mood / atmosphere words (serene, frenetic, melancholic, euphoric, etc.)

Prompts that are TOO SHORT or vague (< ~15 words, no motion, no style) are NOT ready.
Prompts that are descriptive, sensory, and action-oriented ARE ready.

Return ONLY valid JSON — no markdown fences, no extra text — in this exact shape:
{
  "isReadyForGeneration": boolean,
  "tips": string[],
  "enhancedPrompt": string
}

Rules:
- "tips" must contain 2–5 short, actionable sentences. Each tip should address ONE specific gap (lighting, motion, camera, style, or subject detail).
- "enhancedPrompt" must be a single paragraph rewrite of the user's prompt, no longer than 80 words, optimised for Wan 2.1. Preserve the user's original intent.
- If the prompt is already excellent, set isReadyForGeneration to true and still provide 1–2 tips on what makes it strong or tiny improvements.
- Never invent subject matter the user did not imply.`;

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest): Promise<NextResponse<CoachResponse>> {
  try {
    const body: CoachRequest = await req.json();

    if (!body.prompt || typeof body.prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "prompt is required and must be a string." },
        { status: 400 }
      );
    }

    const trimmed = body.prompt.trim();
    if (trimmed.length < 3) {
      return NextResponse.json(
        { success: false, error: "Prompt is too short to evaluate." },
        { status: 400 }
      );
    }

    // -----------------------------------------------------------------------
    // Call Groq
    // -----------------------------------------------------------------------
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 512,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Evaluate this video prompt and return JSON feedback:\n\n"${trimmed}"`,
        },
      ],
    });

    const rawText = response.choices[0]?.message?.content ?? "";

    // Strip any accidental markdown fences the model might emit
    const jsonString = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let feedback: CoachFeedback;
    try {
      feedback = JSON.parse(jsonString) as CoachFeedback;
    } catch {
      console.error("[/api/coach] JSON parse failed:", jsonString);
      return NextResponse.json(
        { success: false, error: "Coach returned malformed feedback. Please try again." },
        { status: 502 }
      );
    }

    // Basic shape validation
    if (
      typeof feedback.isReadyForGeneration !== "boolean" ||
      !Array.isArray(feedback.tips) ||
      typeof feedback.enhancedPrompt !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "Unexpected feedback shape from coach." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, feedback });
  } catch (err) {
    console.error("[/api/coach] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
