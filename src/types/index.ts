// ─────────────────────────────────────────────────────────────────────────────
// JAL-Prototype — Central Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

// ---------------------------------------------------------------------------
// Prompt Coach
// ---------------------------------------------------------------------------

/** Structured response returned by /api/coach */
export interface CoachFeedback {
  /** Whether the prompt is rich enough to generate a compelling 5-second video */
  isReadyForGeneration: boolean;
  /** Ordered list of actionable tips (lighting, motion, style, subject detail) */
  tips: string[];
  /** An AI-optimised rewrite of the user's prompt */
  enhancedPrompt: string;
}

/** Request body sent to /api/coach */
export interface CoachRequest {
  prompt: string;
}

/** Response envelope from /api/coach */
export type CoachResponse =
  | { success: true; feedback: CoachFeedback }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Video Generation
// ---------------------------------------------------------------------------

/** Request body sent to /api/generate */
export interface GenerateRequest {
  prompt: string;
}

/** A single completed video result */
export interface VideoResult {
  id: string;
  url: string;
  prompt: string;
  createdAt: string; // ISO-8601
  thumbnailUrl?: string;
}

/** Response envelope from /api/generate */
export type GenerateResponse =
  | { success: true; video: VideoResult }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// UI State Machine
// ---------------------------------------------------------------------------

/**
 * Represents the lifecycle of a single prompt → video cycle.
 *
 * idle        → User has not yet submitted a prompt
 * coaching    → /api/coach request in-flight
 * coached     → Coach feedback received; user may refine & generate
 * generating  → /api/generate request in-flight
 * completed   → Video returned and displayed
 *
 * Any stage can transition back to `idle` via a hard reset.
 */
export type PromptStage =
  | "idle"
  | "coaching"
  | "coached"
  | "generating"
  | "completed";

/** Full UI state for the text-to-video page */
export interface VideoPageState {
  promptStage: PromptStage;
  rawPrompt: string;
  coachFeedback: CoachFeedback | null;
  currentVideo: VideoResult | null;
  error: string | null;
}
