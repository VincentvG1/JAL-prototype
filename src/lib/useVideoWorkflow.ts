// ─────────────────────────────────────────────────────────────────────────────
// useVideoWorkflow — encapsulates the full prompt → coach → generate lifecycle
//
// Keeps ALL async logic and state transitions outside of the UI layer,
// so components stay declarative and testable.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useCallback } from "react";
import type {
  PromptStage,
  CoachFeedback,
  VideoResult,
  CoachResponse,
  GenerateResponse,
} from "@/types";

// ---------------------------------------------------------------------------
// Return shape
// ---------------------------------------------------------------------------
export interface UseVideoWorkflow {
  // ── State ──────────────────────────────────────────────────────────────────
  promptStage: PromptStage;
  rawPrompt: string;
  coachFeedback: CoachFeedback | null;
  currentVideo: VideoResult | null;
  error: string | null;

  // ── Actions ────────────────────────────────────────────────────────────────
  /** Update the controlled textarea value */
  setRawPrompt: (value: string) => void;
  /** Step 1 — send to /api/coach and surface feedback */
  submitToCoach: () => Promise<void>;
  /** Step 2 — replace prompt with the AI-enhanced version */
  applyEnhancedPrompt: () => void;
  /** Step 3 — send the (optionally edited) prompt to /api/generate */
  generateVideo: () => Promise<void>;
  /** Called when the user clicks "Regenerate" on a completed video */
  startRegenerate: () => void;
  /** Hard-reset the whole workflow back to idle */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
const INITIAL: {
  promptStage: PromptStage;
  rawPrompt: string;
  coachFeedback: CoachFeedback | null;
  currentVideo: VideoResult | null;
  error: string | null;
} = {
  promptStage: "idle",
  rawPrompt: "",
  coachFeedback: null,
  currentVideo: null,
  error: null,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useVideoWorkflow(): UseVideoWorkflow {
  const [promptStage, setPromptStage] = useState<PromptStage>(
    INITIAL.promptStage
  );
  const [rawPrompt, setRawPromptState] = useState<string>(INITIAL.rawPrompt);
  const [coachFeedback, setCoachFeedback] = useState<CoachFeedback | null>(
    INITIAL.coachFeedback
  );
  const [currentVideo, setCurrentVideo] = useState<VideoResult | null>(
    INITIAL.currentVideo
  );
  const [error, setError] = useState<string | null>(INITIAL.error);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const setRawPrompt = useCallback((value: string) => {
    setRawPromptState(value);
    // Keep coach feedback visible while the user edits.
    // Only clear it when they re-submit to the coach.
    // We still reset to idle so Generate re-locks if they change the prompt.
    setPromptStage("idle");
    setError(null);
  }, []);

  // ── Step 1: Coach ──────────────────────────────────────────────────────────
  const submitToCoach = useCallback(async () => {
    const trimmed = rawPrompt.trim();
    if (!trimmed) {
      setError("Please enter a prompt before submitting.");
      return;
    }

    setError(null);
    setCoachFeedback(null);
    setPromptStage("coaching");

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data: CoachResponse = await res.json();

      if (!data.success) {
        setError(data.error);
        setPromptStage("idle");
        return;
      }

      setCoachFeedback(data.feedback);
      setPromptStage("coached");
    } catch {
      setError("Could not reach the coach API. Check your network.");
      setPromptStage("idle");
    }
  }, [rawPrompt]);

  // ── Step 2: Apply enhanced prompt ─────────────────────────────────────────
  const applyEnhancedPrompt = useCallback(() => {
    if (!coachFeedback) return;
    // We set the raw state directly (not via setRawPrompt) so we keep the
    // coach feedback — the user is just accepting the AI's improved wording.
    setRawPromptState(coachFeedback.enhancedPrompt);
  }, [coachFeedback]);

  // ── Step 3: Generate ──────────────────────────────────────────────────────
  const generateVideo = useCallback(async () => {
    const trimmed = rawPrompt.trim();
    if (!trimmed) {
      setError("Prompt is empty.");
      return;
    }
    if (!coachFeedback?.isReadyForGeneration) {
      setError("Please complete the coach review first.");
      return;
    }

    setError(null);
    setPromptStage("generating");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data: GenerateResponse = await res.json();

      if (!data.success) {
        setError(data.error);
        setPromptStage("coached"); // drop back so they can try again
        return;
      }

      setCurrentVideo(data.video);
      setPromptStage("completed");
    } catch {
      setError("Video generation request failed. Check your network.");
      setPromptStage("coached");
    }
  }, [rawPrompt, coachFeedback]);

  // ── Regenerate ─────────────────────────────────────────────────────────────
  const startRegenerate = useCallback(() => {
    // Preserve the rawPrompt (already set to the last used prompt)
    // but wipe coach state so the user re-runs through the gate.
    setCoachFeedback(null);
    setError(null);
    setPromptStage("idle");
    // currentVideo intentionally kept so the old video stays visible while editing
  }, []);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setPromptStage(INITIAL.promptStage);
    setRawPromptState(INITIAL.rawPrompt);
    setCoachFeedback(INITIAL.coachFeedback);
    setCurrentVideo(INITIAL.currentVideo);
    setError(INITIAL.error);
  }, []);

  return {
    promptStage,
    rawPrompt,
    coachFeedback,
    currentVideo,
    error,
    setRawPrompt,
    submitToCoach,
    applyEnhancedPrompt,
    generateVideo,
    startRegenerate,
    reset,
  };
}
