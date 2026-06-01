"use client";

import type { PromptStage, CoachFeedback } from "@/types";

interface ActionBarProps {
  stage: PromptStage;
  coachFeedback: CoachFeedback | null;
  rawPrompt: string;
  onCoach: () => void;
  onGenerate: () => void;
}

function Spinner() {
  return (
    <svg
      style={{ animation: "spin 1s linear infinite", width: "1rem", height: "1rem" }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
      <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

const baseBtn: React.CSSProperties = {
  width: "100%",
  borderRadius: "0.75rem",
  padding: "0.75rem 1.5rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
};

export function ActionBar({ stage, coachFeedback, rawPrompt, onCoach, onGenerate }: ActionBarProps) {
  const hasPrompt = rawPrompt.trim().length >= 3;
  const isReady = coachFeedback?.isReadyForGeneration === true;

  if (stage === "idle" || stage === "coached") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>

        {/* Generate button — only when coached AND ready */}
        {stage === "coached" && isReady && (
          <button
            onClick={onGenerate}
            style={{
              ...baseBtn,
              background: "linear-gradient(to right, #7c3aed, #4f46e5)",
              color: "#fff",
            }}
          >
            Generate Video
          </button>
        )}

        {/* Coach button — idle, or coached but not ready */}
        {(stage === "idle" || (stage === "coached" && !isReady)) && (
          <button
            onClick={onCoach}
            disabled={!hasPrompt}
            style={{
              ...baseBtn,
              background: hasPrompt ? "#f59e0b" : "#27272a",
              color: hasPrompt ? "#09090b" : "#52525b",
              cursor: hasPrompt ? "pointer" : "not-allowed",
            }}
          >
            {stage === "coached" ? "Re-check with Coach" : "Check with AI Coach"}
          </button>
        )}

        {/* Small re-check link when ready */}
        {stage === "coached" && isReady && (
          <button
            onClick={onCoach}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.75rem",
              color: "#52525b",
              textAlign: "center",
              padding: "0.25rem",
            }}
          >
            Re-check with coach
          </button>
        )}
      </div>
    );
  }

  if (stage === "coaching") {
    return (
      <button disabled style={{ ...baseBtn, background: "rgba(245,158,11,0.2)", color: "#fcd34d", cursor: "not-allowed" }}>
        <Spinner /> Analysing your prompt...
      </button>
    );
  }

  if (stage === "generating") {
    return (
      <button disabled style={{ ...baseBtn, background: "rgba(124,58,237,0.2)", color: "#c4b5fd", cursor: "not-allowed" }}>
        <Spinner /> Generating video...
      </button>
    );
  }

  return null;
}
