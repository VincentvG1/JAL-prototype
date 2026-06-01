export interface ConversationTurn {
  userInput: string;
  snippets: string[];
  timestamp: number;
}

export interface SessionContext {
  history: ConversationTurn[];
  rollingSummary: string;
  snippets: string[];
  nextQuestions: string[];
}

const MAX_HISTORY_TURNS = 20;

const sessions = new Map<string, SessionContext>();

export function getSession(sessionId: string): SessionContext {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      history: [],
      rollingSummary: 'No summary yet.',
      snippets: [],
      nextQuestions: [],
    });
  }
  return sessions.get(sessionId)!;
}

export function updateSession(
  sessionId: string,
  userInput: string,
  rollingSummary: string,
  snippets: string[],
  nextQuestions: string[],
): void {
  const session = getSession(sessionId);
  session.history.push({ userInput, snippets, timestamp: Date.now() });

  // Rolling window — prevent unbounded context growth
  if (session.history.length > MAX_HISTORY_TURNS) {
    session.history.shift();
  }

  session.rollingSummary = rollingSummary;
  session.snippets = snippets;
  session.nextQuestions = nextQuestions;
}

export function clearSession(sessionId: string): void {
  sessions.delete(sessionId);
}
