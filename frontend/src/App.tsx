// Screen flow: CityMap → ProblemExploration → MindmapCanvas (analysis) → MindmapCanvas (solution)

import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CityMap } from './components/CityMap';
import { ProblemExploration } from './components/ProblemExploration';
import { MindmapCanvas } from './components/MindmapCanvas';
import { MakeSolutionStudio } from './components/solution/MakeSolutionStudio';
import { StepProgressBar, type Screen } from './components/StepProgressBar';
import type { Problem } from './types/journey';
import './styles/app.css';

export default function App() {
  const sessionId = useMemo(() => {
    const stored = sessionStorage.getItem('mindmap-session-id');
    if (stored) return stored;
    const id = uuidv4();
    sessionStorage.setItem('mindmap-session-id', id);
    return id;
  }, []);

  const solutionSessionId = useMemo(() => `${sessionId}-solution`, [sessionId]);

  const [screen, setScreen] = useState<Screen>('map');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  const onStepComplete =
    screen === 'mindmap-analysis' ? () => setScreen('mindmap-solution') :
    screen === 'mindmap-solution' ? () => setScreen('make-solution') :
    screen === 'make-solution'    ? () => setScreen('present') :
    undefined;

  return (
    <div className="app-shell">
      <StepProgressBar screen={screen} onStepComplete={onStepComplete} />
      <div className="app-screen">
        {screen === 'map' && (
          <CityMap onSelectProblem={(p: Problem) => { setSelectedProblem(p); setScreen('exploration'); }} />
        )}
        {screen === 'exploration' && selectedProblem && (
          <ProblemExploration
            problem={selectedProblem}
            onComplete={() => setScreen('mindmap-analysis')}
          />
        )}
        {screen === 'mindmap-analysis' && (
          <MindmapCanvas
            sessionId={sessionId}
            mode="analysis"
            onComplete={() => setScreen('mindmap-solution')}
          />
        )}
        {screen === 'mindmap-solution' && (
          <MindmapCanvas
            sessionId={solutionSessionId}
            mode="solution"
            onComplete={() => setScreen('make-solution')}
          />
        )}
        {screen === 'make-solution' && (
          <MakeSolutionStudio />
        )}
        {screen === 'present' && (
          <div className="present-placeholder">
            <h2>🎤 Presentatie</h2>
            <p>Dit onderdeel is nog niet beschikbaar.</p>
          </div>
        )}
      </div>
    </div>
  );
}


