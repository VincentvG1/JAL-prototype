import type { Problem } from '../../types/journey';
import { SnippetCarousel } from './SnippetCarousel';
import '../../styles/exploration.css';

interface ProblemExplorationProps {
  problem: Problem;
  onComplete: () => void;
}

export function ProblemExploration({ problem, onComplete }: ProblemExplorationProps) {
  return (
    <div
      className="exploration-shell"
      style={{ '--accent-color': problem.color } as React.CSSProperties}
    >
      <header className="exploration-header">
        <div className="exploration-header-left">
          <div className="exploration-icon" style={{ background: problem.color }}>
            {problem.icon}
          </div>
          <div>
            <p className="exploration-label">Verkenning</p>
            <h1 className="exploration-title">{problem.title}</h1>
          </div>
        </div>
      </header>

      <main className="exploration-main">
        <SnippetCarousel problem={problem} onComplete={onComplete} />
      </main>
    </div>
  );
}
