import type { CoachFeedback } from '../../types/video';

interface PromptCoachFeedbackProps {
  feedback: CoachFeedback;
}

export function PromptCoachFeedback({ feedback }: PromptCoachFeedbackProps) {
  return (
    <section className={`solution-coach-card${feedback.isReadyForGeneration ? ' solution-coach-card--ready' : ''}`}>
      <ul className="solution-coach-tips">
        {feedback.tips.slice(0, 3).map((tip, i) => (
          <li key={`${tip}-${i}`} className="solution-coach-tip-item">
            <span className="solution-coach-tip-index">{i + 1}</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
