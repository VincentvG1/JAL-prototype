// Floating top-right chatbot panel inside the mindmap canvas.
// Modes:
//   'helpers' — shows the AI-generated nextQuestions as clickable chips (default)
//   'answer'  — shows the latest chatbot answer (no chat history, just the last reply)
//
// Behaviour:
//   • Typing a question → API call → switches to 'answer' → auto-returns to 'helpers' after 90 s
//   • After the first answer, a persistent toggle appears so the user can switch manually.
//   • Clicking a helper chip sends it through the brainstorm pipeline (adds snippets), not to the chatbot.

import { useCallback, useEffect, useRef, useState } from 'react';
import { askBrainstormQuestion } from '../services/chatService';

interface BrainstormChatPanelProps {
  helpers: string[];
  onHelperClick: (question: string) => void;
  disabled: boolean;
  rollingSummary?: string;
}

export function BrainstormChatPanel({
  helpers,
  onHelperClick,
  disabled,
  rollingSummary,
}: BrainstormChatPanelProps) {
  const [mode, setMode] = useState<'helpers' | 'answer'>('helpers');
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goHelpers = useCallback(() => {
    clearAutoTimer();
    setMode('helpers');
  }, [clearAutoTimer]);

  const goAnswer = useCallback(() => {
    setMode('answer');
  }, []);

  const handleSend = useCallback(async () => {
    const question = input.trim();
    if (!question || loading) return;

    setInput('');
    setLoading(true);
    setMode('answer');

    try {
      const answer = await askBrainstormQuestion(question, rollingSummary);
      setLastAnswer(answer);
    } catch {
      setLastAnswer('Sorry, er ging iets mis. Probeer het opnieuw.');
    } finally {
      setLoading(false);
      // Auto-switch back to helpers after 90 seconds
      clearAutoTimer();
      timerRef.current = setTimeout(goHelpers, 90_000);
    }
  }, [input, loading, rollingSummary, clearAutoTimer, goHelpers]);

  // Cleanup timer on unmount
  useEffect(() => clearAutoTimer, [clearAutoTimer]);

  return (
    <div className="bcp">
      <div className="bcp-header">
        <div className="bcp-header-row">
          <span className="bcp-icon">🤖</span>
          <h3 className="bcp-title">Brainstorm Hulp</h3>
        </div>
        <p className="bcp-tagline">Stel een vraag en krijg meteen een antwoord om verder te denken!</p>
      </div>

      <div className="bcp-body">
        {mode === 'helpers' ? (
          <div className="bcp-helpers">
            {helpers.length === 0 ? (
              <p className="bcp-empty">
                Vertel je idee via de microfoon. Dan verschijnen hier prikkelende vervolgvragen.
              </p>
            ) : (
              helpers.map((q) => (
                <button
                  key={q}
                  className="helper-chip"
                  onClick={() => onHelperClick(q)}
                  disabled={disabled}
                >
                  {q}
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="bcp-answer-view">
            {loading ? (
              <div className="bcp-typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            ) : (() => {
              const footer = 'Zijn er nog verdere vragen?';
              const idx = lastAnswer?.lastIndexOf(footer) ?? -1;
              const mainText = idx > -1 ? lastAnswer!.slice(0, idx).trim() : (lastAnswer ?? '');
              return (
                <>
                  <p className="bcp-answer-text">{mainText}</p>
                  {idx > -1 && (
                    <>
                      <hr className="bcp-answer-divider" />
                      <p className="bcp-answer-footer">{footer}</p>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Toggle — only visible after the first question has been answered */}
      {lastAnswer !== null && (
        <div className="bcp-toggle">
          <button
            className={`bcp-tab${mode === 'helpers' ? ' bcp-tab--active' : ''}`}
            onClick={goHelpers}
          >
            💡 Hulpjes
          </button>
          <button
            className={`bcp-tab${mode === 'answer' ? ' bcp-tab--active' : ''}`}
            onClick={goAnswer}
          >
            💬 Antwoord
          </button>
        </div>
      )}

      <div className="bcp-input-row">
        <input
          type="text"
          className="bcp-input"
          placeholder="Stel een vraag…"
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void handleSend()}
        />
        <button
          className="bcp-send"
          disabled={!input.trim() || loading}
          onClick={() => void handleSend()}
          title="Stuur vraag"
        >
          →
        </button>
      </div>
    </div>
  );
}
