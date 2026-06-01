"use client";

import { useEffect, useRef } from "react";
import type { CoachFeedback } from "@/types";

interface PromptCoachFeedbackProps {
  feedback: CoachFeedback;
  onApplyEnhanced: () => void;
  enhancedApplied: boolean;
}

function TipItem({ tip, index }: { tip: string; index: number }) {
  return (
    <li
      className="flex gap-3 items-start"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold flex items-center justify-center border border-amber-500/30">
        {index + 1}
      </span>
      <span className="text-sm text-zinc-300 leading-relaxed">{tip}</span>
    </li>
  );
}

export function PromptCoachFeedback({
  feedback,
  onApplyEnhanced,
  enhancedApplied,
}: PromptCoachFeedbackProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const { isReadyForGeneration, tips, enhancedPrompt } = feedback;

  return (
    <div
      ref={cardRef}
      style={{
        borderRadius: "1rem",
        border: `1px solid ${isReadyForGeneration ? "rgba(16,185,129,0.4)" : "rgba(245,158,11,0.4)"}`,
        padding: "1.25rem",
        background: "rgba(24,24,27,0.9)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            width: "2.25rem",
            height: "2.25rem",
            borderRadius: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: isReadyForGeneration ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
            color: isReadyForGeneration ? "#34d399" : "#fbbf24",
          }}
        >
          {isReadyForGeneration ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: isReadyForGeneration ? "#34d399" : "#fbbf24" }}>
            {isReadyForGeneration ? "Prompt is ready for generation" : "Prompt needs more detail"}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "2px" }}>
            AI Coach feedback
          </p>
        </div>
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#71717a", marginBottom: "0.75rem" }}>
            Suggestions
          </p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "0.625rem", listStyle: "none" }}>
            {tips.map((tip, i) => (
              <TipItem key={i} tip={tip} index={i} />
            ))}
          </ul>
        </div>
      )}

      {/* Enhanced prompt — only show when ready, with Apply button */}
      {isReadyForGeneration && (
        <div style={{
          borderRadius: "0.75rem",
          background: "rgba(39,39,42,0.6)",
          border: "1px solid rgba(63,63,70,0.5)",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#71717a" }}>
            AI-enhanced prompt
          </p>
          <p style={{ fontSize: "0.875rem", color: "#e4e4e7", lineHeight: 1.6, fontStyle: "italic" }}>
            "{enhancedPrompt}"
          </p>
          <button
            onClick={onApplyEnhanced}
            disabled={enhancedApplied}
            style={{
              width: "100%",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: enhancedApplied ? "default" : "pointer",
              background: enhancedApplied ? "#3f3f46" : "#52525b",
              color: enhancedApplied ? "#71717a" : "#e4e4e7",
              border: "none",
              transition: "background 0.2s",
            }}
          >
            {enhancedApplied ? "✓ Applied" : "Apply AI Enhanced Prompt"}
          </button>
        </div>
      )}
    </div>
  );
}
