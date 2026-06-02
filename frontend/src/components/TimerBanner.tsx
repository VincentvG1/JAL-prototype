// Banner with a live countdown timer shown on both mindmap phases.
// After EARLY_CONTINUE_AFTER_SEC the user sees a "continue anyway" button.
// The banner is centred between the listen button and the sidebar.

import { useEffect, useRef, useState } from 'react';

const TOTAL_SEC = 30 * 60;          // 30 minutes
const EARLY_CONTINUE_SEC = 10 * 60; // button appears after 10 minutes

export type MindmapMode = 'analysis' | 'solution';

interface TimerBannerProps {
  mode: MindmapMode;
  onContinue: () => void;
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function TimerBanner({ mode, onContinue }: TimerBannerProps) {
  const [remaining, setRemaining] = useState(TOTAL_SEC);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset timer whenever the mode changes (analysis → solution)
  useEffect(() => {
    setRemaining(TOTAL_SEC);
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [mode]);

  const elapsed = TOTAL_SEC - remaining;
  const earlyAllowed = elapsed >= EARLY_CONTINUE_SEC;
  const finished = remaining === 0;

  const isAnalysis = mode === 'analysis';

  return (
    <div className={`timer-banner timer-banner--${mode}`}>
      <span className="timer-banner-icon">{isAnalysis ? '🔍' : '💡'}</span>

      <div className="timer-banner-body">
        <strong className="timer-banner-title">
          {isAnalysis
            ? 'Analyseer nu het probleem!'
            : 'Bedenk nu jullie oplossing!'}
        </strong>
        <span className="timer-banner-hint">
          {isAnalysis
            ? 'Luister goed en schrijf op wat je ziet, hoort en begrijpt.'
            : 'Verbind je ideeën en kies de beste aanpak.'}
        </span>
      </div>

      <div className="timer-banner-clock">
        <span className={`timer-countdown${remaining < 60 ? ' timer-countdown--urgent' : ''}`}>
          ⏱ {fmt(remaining)}
        </span>
      </div>

      {(earlyAllowed || finished) && (
        <button className="timer-banner-continue" onClick={onContinue}>
          {isAnalysis ? 'Doorgaan naar oplossing →' : 'Doorgaan naar presentatie →'}
        </button>
      )}
    </div>
  );
}
