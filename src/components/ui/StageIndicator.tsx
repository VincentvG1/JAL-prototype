"use client";

import type { PromptStage } from "@/types";

const STAGES = ["Write", "Coach", "Review", "Generate", "Watch"];
const STAGE_INDEX: Record<PromptStage, number> = {
  idle: 0, coaching: 1, coached: 2, generating: 3, completed: 4,
};

export function StageIndicator({ stage }: { stage: PromptStage }) {
  const current = STAGE_INDEX[stage];
  return (
    <nav style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
      {STAGES.map((label, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{
              fontSize: "0.7rem",
              fontWeight: 500,
              padding: "2px 10px",
              borderRadius: "9999px",
              background: isActive ? "#3f3f46" : "transparent",
              color: isActive ? "#e4e4e7" : isDone ? "#34d399" : "#3f3f46",
              transition: "all 0.3s",
            }}>
              {isDone ? "✓ " : ""}{label}
            </span>
            {i < STAGES.length - 1 && (
              <span style={{ color: "#27272a", fontSize: "0.75rem" }}>›</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
