"use client";

import type { VideoResult } from "@/types";

interface VideoPlayerProps {
  video: VideoResult;
  onRegenerate: () => void;
  isGenerating: boolean;
}

export function VideoPlayer({ video, onRegenerate, isGenerating }: VideoPlayerProps) {
  const formattedDate = new Date(video.createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div style={{
      borderRadius: "1rem",
      overflow: "hidden",
      border: "1px solid #27272a",
      background: "#18181b",
    }}>
      <div style={{ position: "relative", aspectRatio: "16/9", background: "#000" }}>
        <video
          key={video.url}
          src={video.url}
          autoPlay
          loop
          muted
          playsInline
          controls
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <p style={{ fontSize: "0.75rem", color: "#52525b", lineHeight: 1.5 }}>
          <span style={{ textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem", fontWeight: 600 }}>Prompt used</span>
          <br />
          <span style={{ color: "#a1a1aa", fontStyle: "italic" }}>"{video.prompt}"</span>
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#52525b" }}>{formattedDate}</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <a
              href={video.url}
              download={`video-${video.id}.mp4`}
              style={{
                borderRadius: "0.5rem",
                padding: "0.375rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                border: "1px solid #3f3f46",
                color: "#a1a1aa",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              Download
            </a>
            <button
              onClick={onRegenerate}
              disabled={isGenerating}
              style={{
                borderRadius: "0.5rem",
                padding: "0.375rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                border: "none",
                background: isGenerating ? "#27272a" : "#3f3f46",
                color: isGenerating ? "#52525b" : "#e4e4e7",
                cursor: isGenerating ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              Regenerate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
