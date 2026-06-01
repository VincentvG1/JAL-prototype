"use client";

import { useRef, useEffect } from "react";
import type { PromptStage } from "@/types";

const MAX_CHARS = 500;

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  stage: PromptStage;
  placeholder?: string;
}

export function PromptInput({
  value,
  onChange,
  stage,
  placeholder = "Describe your 5-second video... e.g. A lone astronaut walks across a red Martian plain at sunset, slow cinematic push-in, dust particles catching the light.",
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDisabled = stage === "coaching" || stage === "generating";

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const borderColor =
    stage === "coaching" ? "rgba(245,158,11,0.6)" :
    stage === "coached" ? "rgba(16,185,129,0.4)" :
    stage === "generating" ? "rgba(124,58,237,0.6)" :
    "rgba(63,63,70,0.8)";

  return (
    <div style={{
      position: "relative",
      borderRadius: "1rem",
      border: `1px solid ${borderColor}`,
      background: "#18181b",
      transition: "border-color 0.3s",
    }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
        disabled={isDisabled}
        rows={4}
        placeholder={placeholder}
        style={{
          width: "100%",
          resize: "none",
          borderRadius: "1rem",
          background: "transparent",
          padding: "1rem 1.25rem 2.5rem",
          fontSize: "0.875rem",
          color: "#e4e4e7",
          border: "none",
          outline: "none",
          opacity: isDisabled ? 0.5 : 1,
          cursor: isDisabled ? "not-allowed" : "text",
          fontFamily: "inherit",
          lineHeight: 1.6,
        }}
        aria-label="Video prompt input"
      />
      <div style={{
        position: "absolute",
        bottom: "0.75rem",
        right: "1rem",
        fontSize: "0.75rem",
        color: value.length >= MAX_CHARS * 0.9 ? "#fbbf24" : "#52525b",
        pointerEvents: "none",
        userSelect: "none",
      }}>
        {value.length}/{MAX_CHARS}
      </div>
    </div>
  );
}
