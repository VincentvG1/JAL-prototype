import { useEffect, useState } from 'react';
import { useVideoWorkflow } from '../../hooks/useVideoWorkflow';
import { PromptInput } from './PromptInput';
import { PromptCoachFeedback } from './PromptCoachFeedback';
import { ActionBar } from './ActionBar';
import { VideoPlayer } from './VideoPlayer';
import { ErrorBanner } from './ErrorBanner';
import { StageIndicator } from './StageIndicator';
import { ToolSelector } from './ToolSelector';

const GENERATION_STEPS = [
  'Scene wordt opgebouwd...',
  'Karakters en objecten worden geplaatst...',
  'Camera-beweging wordt ingesteld...',
  'Licht en sfeer worden afgewerkt...',
  'Video wordt gerenderd...',
];

export function MakeSolutionStudio() {
  const [subScreen, setSubScreen] = useState<'select' | 'video'>('select');

  const {
    promptStage,
    rawPrompt,
    coachFeedback,
    currentVideo,
    error,
    mode,
    loadingPhase,
    setRawPrompt,
    toggleMode,
    submitToCoach,
    generateVideo,
    startRegenerate,
    reset,
    clearError,
  } = useVideoWorkflow();

  const [unlockPulse, setUnlockPulse] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const isReady = coachFeedback?.isReadyForGeneration === true;

  useEffect(() => {
    if (!isReady) return;
    setUnlockPulse(true);
    const t = setTimeout(() => setUnlockPulse(false), 850);
    return () => clearTimeout(t);
  }, [isReady]);

  useEffect(() => {
    if (loadingPhase !== 'generating') {
      setStepIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setStepIndex(prev => (prev + 1) % GENERATION_STEPS.length);
    }, 1700);

    return () => clearInterval(timer);
  }, [loadingPhase]);

  const handlePromptChange = (value: string) => {
    setRawPrompt(value);
  };

  const handleRegenerate = () => {
    if (currentVideo) setRawPrompt(currentVideo.prompt);
    startRegenerate();
  };

  return (
    <div className="solution-shell">
      {subScreen === 'select' && (
        <ToolSelector onSelect={(id) => { if (id === 'video') setSubScreen('video'); }} />
      )}

      {subScreen === 'video' && (
      <div className="solution-container solution-container--split">
        <header className="solution-header solution-header--split">
          <div />
          {promptStage !== 'idle' && (
            <button className="solution-link-btn" onClick={reset}>Start opnieuw</button>
          )}
        </header>

        <StageIndicator stage={promptStage} />

        {error && <ErrorBanner message={error} onDismiss={clearError} />}

        <div className="solution-layout">
          <aside className="solution-sidebar">
            <PromptInput value={rawPrompt} onChange={handlePromptChange} stage={promptStage} />

            <ActionBar
              stage={promptStage}
              coachFeedback={coachFeedback}
              rawPrompt={rawPrompt}
              onCoach={submitToCoach}
              onGenerate={generateVideo}
              unlockPulse={unlockPulse}
            />

            <section className="solution-tips-zone">
              <p className="solution-coach-block-label">Tips van AI Coach</p>

              {loadingPhase === 'coaching' && (
                <div className="solution-coach-loading">
                  <span className="solution-spinner" aria-hidden="true" />
                  <span>Coach denkt na over je prompt...</span>
                </div>
              )}

              {coachFeedback && loadingPhase !== 'coaching' && (
                <PromptCoachFeedback
                  feedback={coachFeedback}
                />
              )}

              {!coachFeedback && loadingPhase !== 'coaching' && (
                <div className="solution-tips-empty">
                  Na "Check met AI Coach" verschijnen hier tips om je prompt beter te maken.
                </div>
              )}
            </section>

          </aside>

          <section className="solution-video-pane">
            {!currentVideo && (
              <div className="solution-video-placeholder">
                <p className="solution-video-placeholder-title">Videovenster</p>
                <p className="solution-video-placeholder-sub">Je gegenereerde video verschijnt hier.</p>
              </div>
            )}

            {currentVideo && (
              <VideoPlayer
                video={currentVideo}
                onRegenerate={handleRegenerate}
                isGenerating={promptStage === 'generating'}
              />
            )}

            {loadingPhase === 'generating' && (
              <div className="solution-video-overlay">
                <div className="solution-video-overlay-card">
                  <span className="solution-spinner solution-spinner--big" aria-hidden="true" />
                  <strong>AI maakt je video...</strong>
                  <ul>
                    {GENERATION_STEPS.map((step, i) => (
                      <li
                        key={step}
                        className={i === stepIndex ? 'solution-gen-step solution-gen-step--active' : 'solution-gen-step'}
                      >
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
      )}

      <button className="solution-mode-toggle" onClick={toggleMode}>
        {mode === 'mock' ? 'MOCK' : 'REAL'}
      </button>
    </div>
  );
}
