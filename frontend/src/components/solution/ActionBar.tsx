import type { CoachFeedback, PromptStage } from '../../types/video';

interface ActionBarProps {
  stage: PromptStage;
  coachFeedback: CoachFeedback | null;
  rawPrompt: string;
  onCoach: () => void;
  onGenerate: () => void;
  unlockPulse?: boolean;
}

export function ActionBar({
  stage,
  coachFeedback,
  rawPrompt,
  onCoach,
  onGenerate,
  unlockPulse = false,
}: ActionBarProps) {
  const hasPrompt = rawPrompt.trim().length >= 3;
  const isReady = coachFeedback?.isReadyForGeneration === true;

  const coachBusy = stage === 'coaching';
  const generating = stage === 'generating';

  const coachLabel = coachBusy
    ? 'Coach analyseert je prompt...'
    : stage === 'coached'
      ? 'Opnieuw checken met AI Coach'
      : 'Check met AI Coach';

  const generateDisabled = !isReady || generating;

  return (
    <div className="solution-actionbar">
      <button
        className={`solution-primary-btn solution-primary-btn--coach${coachBusy ? ' solution-primary-btn--loading' : ''}`}
        onClick={onCoach}
        disabled={!hasPrompt || coachBusy || generating}
      >
        {coachBusy && <span className="solution-spinner" aria-hidden="true" />}
        {coachLabel}
      </button>

      <div
        className="solution-generate-wrap"
        data-tooltip={!isReady ? 'Maak je prompt eerst beter met de AI Coach.' : ''}
      >
        <button
          className={`solution-primary-btn solution-primary-btn--generate${generateDisabled ? ' solution-primary-btn--locked' : ''}${unlockPulse ? ' solution-primary-btn--unlock' : ''}`}
          onClick={onGenerate}
          disabled={generateDisabled}
          aria-label="Genereer video"
        >
          <span className="solution-generate-icon" aria-hidden="true">{generateDisabled ? '🔒' : '🔓'}</span>
          <span>{generating ? 'Video wordt gemaakt...' : 'Genereer video'}</span>
        </button>
      </div>
    </div>
  );
}
