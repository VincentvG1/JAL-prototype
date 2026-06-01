"use client";

import { useState } from "react";
import { useVideoWorkflow } from "@/lib/useVideoWorkflow";
import { PromptInput } from "@/components/coach/PromptInput";
import { PromptCoachFeedback } from "@/components/coach/PromptCoachFeedback";
import { ActionBar } from "@/components/coach/ActionBar";
import { VideoPlayer } from "@/components/coach/VideoPlayer";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { StageIndicator } from "@/components/ui/StageIndicator";

export default function VideoPage() {
  const {
    promptStage, rawPrompt, coachFeedback, currentVideo, error,
    setRawPrompt, submitToCoach, applyEnhancedPrompt,
    generateVideo, startRegenerate, reset,
  } = useVideoWorkflow();

  const [enhancedApplied, setEnhancedApplied] = useState(false);

  const handleApplyEnhanced = () => {
    applyEnhancedPrompt();
    setEnhancedApplied(true);
  };

  const handlePromptChange = (value: string) => {
    setRawPrompt(value);
    setEnhancedApplied(false);
  };

  const handleRegenerate = () => {
    if (currentVideo) setRawPrompt(currentVideo.prompt);
    setEnhancedApplied(false);
    startRegenerate();
  };

  return (
    <main style={{ minHeight: "100vh", background: "#09090b", color: "#e4e4e7" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "3rem 1rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* Header */}
        <header style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
              Text to Video
            </h1>
            {promptStage !== "idle" && (
              <button onClick={reset} style={{ fontSize: "0.75rem", color: "#52525b", background: "none", border: "none", cursor: "pointer" }}>
                Start over
              </button>
            )}
          </div>
          <StageIndicator stage={promptStage} />
        </header>

        {/* Error */}
        {error && <ErrorBanner message={error} onDismiss={() => handlePromptChange(rawPrompt)} />}

        {/* Input + coach + buttons */}
        {promptStage !== "completed" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <PromptInput value={rawPrompt} onChange={handlePromptChange} stage={promptStage} />
            {coachFeedback && (
              <PromptCoachFeedback
                feedback={coachFeedback}
                onApplyEnhanced={handleApplyEnhanced}
                enhancedApplied={enhancedApplied}
              />
            )}
            <ActionBar
              stage={promptStage}
              coachFeedback={coachFeedback}
              rawPrompt={rawPrompt}
              onCoach={submitToCoach}
              onGenerate={generateVideo}
            />
          </div>
        )}

        {/* Generating skeleton */}
        {promptStage === "generating" && !currentVideo && (
          <div style={{ borderRadius: "1rem", border: "1px solid #27272a", background: "#18181b", overflow: "hidden" }}>
            <div style={{ aspectRatio: "16/9", background: "#27272a", animation: "pulse 2s infinite" }} />
            <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ height: "0.75rem", width: "75%", borderRadius: "0.25rem", background: "#27272a" }} />
              <div style={{ height: "0.75rem", width: "50%", borderRadius: "0.25rem", background: "#27272a" }} />
            </div>
          </div>
        )}

        {/* Video player */}
        {currentVideo && (
          <VideoPlayer
            video={currentVideo}
            onRegenerate={handleRegenerate}
            isGenerating={promptStage === "generating"}
          />
        )}

        {/* Regenerate flow — show input again */}
        {promptStage !== "completed" && currentVideo && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <PromptInput value={rawPrompt} onChange={handlePromptChange} stage={promptStage} />
            {coachFeedback && (
              <PromptCoachFeedback
                feedback={coachFeedback}
                onApplyEnhanced={handleApplyEnhanced}
                enhancedApplied={enhancedApplied}
              />
            )}
            <ActionBar
              stage={promptStage}
              coachFeedback={coachFeedback}
              rawPrompt={rawPrompt}
              onCoach={submitToCoach}
              onGenerate={generateVideo}
            />
          </div>
        )}

      </div>
    </main>
  );
}
