// Persistent progress bar — horizontally scrollable, draggable, with edge arrows.
// Active step expands with hint + timer (mindmap screens).
// Upcoming steps show expanded preview on hover (no click navigation).
// After EARLY_CONT_SEC a small › circle appears to advance to the next step.
// Timer shows minutes by default, then seconds in the final 2 minutes.

import { useCallback, useEffect, useRef, useState } from 'react';

export type Screen =
  | 'map'
  | 'exploration'
  | 'mindmap-analysis'
  | 'mindmap-solution'
  | 'make-solution'
  | 'present';

export const STEPS: { num: number; label: string; hint: string; icon: string }[] = [
  { num: 1, label: 'Kies een probleem',      hint: 'Welk probleem in de stad wil jij oplossen?',   icon: '📍' },
  { num: 2, label: 'Verken het probleem',    hint: 'Begrijp het probleem beter',       icon: '🔭' },
  { num: 3, label: 'Analyseer het probleem', hint: 'Schrijf op wat je ziet, hoort en begrijpt',    icon: '🔍' },
  { num: 4, label: 'Bedenk een oplossing',   hint: 'Bedenk de beste manieren om het probleem op te lossen',        icon: '💡' },
  { num: 5, label: 'Maak de oplossing',      hint: 'Maak van je idee iets wat je kan laten zien',  icon: '🔨' },
  { num: 6, label: 'Presenteer',             hint: 'Deel je beste idee met de groep',               icon: '🎤' },
];

export const SCREEN_TO_STEP: Record<Screen, number> = {
  map: 0,
  exploration: 1,
  'mindmap-analysis': 2,
  'mindmap-solution': 3,
  'make-solution': 4,
  present: 5,
};

// Step index → Screen (used for peek navigation)
const MINDMAP_SCREENS = new Set<Screen>(['mindmap-analysis', 'mindmap-solution']);
const TOTAL_SEC          = 30 * 60;
const EARLY_CONT_SEC     = 1  * 60; // DEMO: 1 min (production: 10 min)

function formatRemaining(sec: number): string {
  if (sec <= 120) return `${sec} sec`;
  return `${Math.ceil(sec / 60)} minuten`;
}

interface StepProgressBarProps {
  screen: Screen;
  onStepComplete?: () => void;
}

export function StepProgressBar({ screen, onStepComplete }: StepProgressBarProps) {
  const activeStep = SCREEN_TO_STEP[screen];
  const isMindmap  = MINDMAP_SCREENS.has(screen);

  const [elapsed, setElapsed]          = useState(0);
  const [hoveredStep, setHoveredStep]  = useState<number | null>(null);
  const [showLeft, setShowLeft]        = useState(false);
  const [showRight, setShowRight]      = useState(false);

  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const innerRef        = useRef<HTMLDivElement>(null);
  const isDragging      = useRef(false);
  const dragStartX      = useRef(0);
  const dragStartScroll = useRef(0);

  // Timer lifecycle — resets when screen changes
  useEffect(() => {
    setElapsed(0);
    if (timerRef.current)    clearInterval(timerRef.current);
    if (!isMindmap) return;
    timerRef.current    = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => {
      if (timerRef.current)    clearInterval(timerRef.current);
    };
  }, [screen]); // intentionally only screen

  const remaining   = Math.max(0, TOTAL_SEC - elapsed);
  const canContinue = elapsed >= EARLY_CONT_SEC;
  const showSeconds = remaining <= 120;

  // Show/hide edge arrows based on scroll position
  const updateArrows = useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 4);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateArrows); ro.disconnect(); };
  }, [updateArrows]);

  // Scroll active step into view whenever screen changes
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const track = el.querySelector('.step-bar-track--active') as HTMLElement | null;
    if (track) track.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [screen]);

  // Drag-to-scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!innerRef.current) return;
    isDragging.current      = true;
    dragStartX.current      = e.clientX;
    dragStartScroll.current = innerRef.current.scrollLeft;
    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current || !innerRef.current) return;
      innerRef.current.scrollLeft = dragStartScroll.current - (ev.clientX - dragStartX.current);
    };
    const onUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // Vertical or horizontal wheel → horizontal scroll
  const handleWheel = (e: React.WheelEvent) => {
    if (!innerRef.current) return;
    e.preventDefault();
    innerRef.current.scrollLeft += e.deltaY + e.deltaX;
  };

  const scrollBy = (delta: number) =>
    innerRef.current?.scrollBy({ left: delta, behavior: 'smooth' });

  return (
    <div className="step-bar-shell">
      {/* Left edge arrow */}
      <button
        className={`step-scroll-arrow step-scroll-arrow--left${showLeft ? ' step-scroll-arrow--visible' : ''}`}
        onClick={() => scrollBy(-240)}
        aria-hidden={!showLeft}
        tabIndex={showLeft ? 0 : -1}
      >‹</button>

      {/* Scrollable track */}
      <div
        className="step-bar-inner"
        ref={innerRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        {STEPS.map((step, i) => {
          const state: 'done' | 'active' | 'upcoming' =
            i < activeStep ? 'done' : i === activeStep ? 'active' : 'upcoming';
          const isActive   = state === 'active';
          const isHovered  = hoveredStep === i && state === 'upcoming';
          const isExpanded = isActive || isHovered;

          return (
            <div
              key={i}
              className={`step-bar-track${isActive ? ' step-bar-track--active' : ''}`}
            >
              <div
                className={`step-item step-item--${state}${isExpanded ? ' step-item--expanded' : ''}`}
                onMouseEnter={() => state === 'upcoming' && setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Circle / emoji icon */}
                <div className="step-circle">
                  {state === 'done' ? '✓' : isActive ? step.icon : step.num}
                </div>

                {/* Text block */}
                <div className="step-text">
                  <span className="step-label">{step.label}</span>
                  {isExpanded && <span className="step-hint">{step.hint}</span>}

                  {/* Timer — only on active mindmap steps */}
                  {isActive && isMindmap && (
                    <div className="step-timer-row">
                      <span className={`step-countdown${showSeconds ? ' step-countdown--urgent' : ''}`}>
                        <span className="step-countdown-icon">⏱</span>
                        <span className="step-countdown-value">{formatRemaining(remaining)}</span>
                      </span>

                      {/* › next-step arrow — always visible after threshold, right of time */}
                      {canContinue && onStepComplete && (
                        <button
                          className="step-next-arrow"
                          onClick={e => { e.stopPropagation(); onStepComplete(); }}
                          aria-label="Volgende stap"
                        >≫</button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {i < STEPS.length - 1 && (
                <div className={`step-connector step-connector--${i < activeStep ? 'done' : 'upcoming'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Right edge arrow */}
      <button
        className={`step-scroll-arrow step-scroll-arrow--right${showRight ? ' step-scroll-arrow--visible' : ''}`}
        onClick={() => scrollBy(240)}
        aria-hidden={!showRight}
        tabIndex={showRight ? 0 : -1}
      >›</button>
    </div>
  );
}

