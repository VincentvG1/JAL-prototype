import { useState } from 'react';
import type { Problem } from '../../types/journey';

interface SnippetCarouselProps {
  problem: Problem;
  onComplete: () => void;
}

export function SnippetCarousel({ problem, onComplete }: SnippetCarouselProps) {
  const [index, setIndex] = useState(0);

  const snippet = problem.snippets[index];
  const isLast = index === problem.snippets.length - 1;

  const goNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  return (
    <div className="snippet-carousel">
      {/* Card — changing the key causes React to remount the element, triggering the CSS enter animation */}
      <div
        key={index}
        className="snippet-slide"
        style={{ '--accent-color': problem.color } as React.CSSProperties}
      >
        <div className="snippet-slide-icon">{snippet.icon}</div>
        <h2 className="snippet-slide-title">{snippet.title}</h2>
        <p className="snippet-slide-body">{snippet.body}</p>
      </div>

      {/* Progress dots */}
      <div className="snippet-dots">
        {problem.snippets.map((_, i) => (
          <span
            key={i}
            className={`snippet-dot${i === index ? ' snippet-dot--active' : i < index ? ' snippet-dot--done' : ''}`}
            style={i <= index ? ({ '--dot-color': problem.color } as React.CSSProperties) : undefined}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="snippet-nav">
        <button className="snippet-nav-prev" onClick={goPrev} disabled={index === 0}>
          ← Vorige
        </button>
        <button
          className="snippet-nav-next"
          onClick={goNext}
          style={{ background: problem.color }}
        >
          {isLast ? 'Start brainstormen! 🧠' : 'Volgende →'}
        </button>
      </div>
    </div>
  );
}
