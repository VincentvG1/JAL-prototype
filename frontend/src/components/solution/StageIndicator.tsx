import type { PromptStage } from '../../types/video';

const STAGES = ['Schrijf', 'Coach', 'Review', 'Genereer', 'Bekijk'];
const STAGE_INDEX: Record<PromptStage, number> = {
  idle: 0,
  coaching: 1,
  coached: 2,
  generating: 3,
  completed: 4,
};

export function StageIndicator({ stage }: { stage: PromptStage }) {
  const current = STAGE_INDEX[stage];

  return (
    <nav className="solution-stage-nav">
      {STAGES.map((label, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <div key={label} className="solution-stage-item">
            <span className={`solution-stage-pill${isActive ? ' solution-stage-pill--active' : ''}${isDone ? ' solution-stage-pill--done' : ''}`}>
              {isDone ? '✓ ' : ''}{label}
            </span>
            {i < STAGES.length - 1 && <span className="solution-stage-sep">›</span>}
          </div>
        );
      })}
    </nav>
  );
}
