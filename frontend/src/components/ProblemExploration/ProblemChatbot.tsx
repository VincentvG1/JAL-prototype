import { useEffect, useRef, useState } from 'react';
import { askProblemQuestion } from '../../services/chatService';
import type { Problem } from '../../types/journey';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface ProblemChatbotProps {
  problem: Problem;
  onReady: () => void;
}

export function ProblemChatbot({ problem, onReady }: ProblemChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: `Goed gedaan! 🎉 Je hebt het probleem "${problem.title}" verkend. Nu is het jouw beurt: stel mij minimaal één vraag over dit probleem. Alles mag!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    setInput('');
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setLoading(true);

    try {
      const answer = await askProblemQuestion(problem.id, question);
      setMessages((m) => [...m, { role: 'assistant', text: answer }]);
      setQuestionAnswered(true);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: 'Sorry, er ging iets mis. Probeer het opnieuw.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-section">
      <div className="chatbot-header">
        <span className="chatbot-avatar">🤖</span>
        <div>
          <h3 className="chatbot-header-title">Stel een vraag</h3>
          <p className="chatbot-header-sub">
            Stel minimaal 1 vraag voordat je gaat brainstormen
          </p>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message chat-message--${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="chat-message chat-message--assistant chat-message--loading">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chatbot-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Typ je vraag hier…"
          disabled={loading}
          className="chatbot-input"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="chatbot-send"
          style={{ background: problem.color }}
        >
          Stuur
        </button>
      </div>

      {questionAnswered && (
        <button
          className="chatbot-proceed"
          style={{ background: problem.color }}
          onClick={onReady}
        >
          Start met brainstormen! 🧠
        </button>
      )}
    </div>
  );
}
