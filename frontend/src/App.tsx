// Screen flow: CityMap → ProblemExploration → MindmapCanvas

import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CityMap } from './components/CityMap';
import { ProblemExploration } from './components/ProblemExploration';
import { MindmapCanvas } from './components/MindmapCanvas';
import { StepProgressBar } from './components/StepProgressBar';
import type { Problem } from './types/journey';
import './styles/app.css';

type Screen = 'map' | 'exploration' | 'mindmap';

export default function App() {
  const sessionId = useMemo(() => {
    const stored = sessionStorage.getItem('mindmap-session-id');
    if (stored) return stored;
    const id = uuidv4();
    sessionStorage.setItem('mindmap-session-id', id);
    return id;
  }, []);

  const [screen, setScreen] = useState<Screen>('map');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setScreen('exploration');
  };

  const handleStartBrainstorm = () => {
    setScreen('mindmap');
  };

  return (
    <div className="app-shell">
      <StepProgressBar screen={screen} />
      <div className="app-screen">
        {screen === 'map' && <CityMap onSelectProblem={handleSelectProblem} />}
        {screen === 'exploration' && selectedProblem && (
          <ProblemExploration problem={selectedProblem} onComplete={handleStartBrainstorm} />
        )}
        {screen === 'mindmap' && <MindmapCanvas sessionId={sessionId} />}
      </div>
    </div>
  );
}

