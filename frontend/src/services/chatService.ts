// Sends a student's question about a civic problem to the backend chatbot endpoint.

export async function askProblemQuestion(
  problemId: string,
  question: string,
): Promise<string> {
  const response = await fetch('/api/chat/problem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemId, question }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ error: response.statusText }))) as {
      error?: string;
    };
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  const data = (await response.json()) as { answer: string };
  return data.answer;
}

// Sends a quick question to the in-canvas brainstorm chatbot.
// Returns a short plain-text answer (max ~2 sentences).
export async function askBrainstormQuestion(
  question: string,
  summary?: string,
): Promise<string> {
  const response = await fetch('/api/chat/brainstorm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, summary }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ error: response.statusText }))) as {
      error?: string;
    };
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  const data = (await response.json()) as { answer: string };
  return data.answer;
}
