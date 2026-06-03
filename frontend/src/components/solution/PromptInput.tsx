import type { PromptStage } from '../../types/video';

const MAX_CHARS = 500;

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  stage: PromptStage;
}

export function PromptInput({ value, onChange, stage }: PromptInputProps) {
  const isDisabled = stage === 'coaching' || stage === 'generating';

  return (
    <div className={`solution-input-card solution-input-card--${stage}`}>
      <textarea
        className="solution-input"
        value={value}
        disabled={isDisabled}
        onChange={e => onChange(e.target.value.slice(0, MAX_CHARS))}
        rows={5}
        placeholder="Schrijf je videoprompt, check met AI Coach en genereer daarna je video."
      />
      <div className={`solution-input-count${value.length > 450 ? ' solution-input-count--warn' : ''}`}>
        {value.length}/{MAX_CHARS}
      </div>
    </div>
  );
}
