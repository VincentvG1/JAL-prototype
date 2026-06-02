// Persistent progress bar shown across all screens to give users orientation.

type Screen = 'map' | 'exploration' | 'mindmap';

const STEPS = [
  {
    num: 1,
    label: 'Kies een probleem',
    hint: 'Welk probleem in de stad wil jij oplossen?',
  },
  {
    num: 2,
    label: 'Verken het probleem',
    hint: 'Leer meer en begrijp het probleem beter',
  },
  {
    num: 3,
    label: 'Brainstorm',
    hint: 'Bedenk oplossingen en verbind je ideeën',
  },
  {
    num: 4,
    label: 'Presenteer',
    hint: 'Deel je beste idee met de groep',
  },
] as const;

const SCREEN_TO_STEP: Record<Screen, number> = {
  map: 0,
  exploration: 1,
  mindmap: 2,
};

interface StepProgressBarProps {
  screen: Screen;
}

export function StepProgressBar({ screen }: StepProgressBarProps) {
  const activeStep = SCREEN_TO_STEP[screen];

  return (
    <div className="step-bar">
      {STEPS.map((step, i) => {
        const state: 'done' | 'active' | 'upcoming' =
          i < activeStep ? 'done' : i === activeStep ? 'active' : 'upcoming';

        return (
          <div key={i} className="step-bar-track">
            <div className={`step-item step-item--${state}`}>
              <div className="step-circle">
                {state === 'done' ? '✓' : step.num}
              </div>
              <div className="step-text">
                <span className="step-label">{step.label}</span>
                <span className="step-hint">{step.hint}</span>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-connector step-connector--${i < activeStep ? 'done' : 'upcoming'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
