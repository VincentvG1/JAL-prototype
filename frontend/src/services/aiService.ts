// Thin HTTP client — isolates all network concerns from the rest of the app.
// If the backend URL ever changes (e.g. staging vs prod), only this file needs updating.

import type { AIInsightsResponse } from '../types/mindmap';

const API_BASE = '/api/ai';

export async function processInput(
  text: string,
  sessionId: string,
): Promise<AIInsightsResponse> {
  const response = await fetch(`${API_BASE}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sessionId }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText })) as { error?: string };
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<AIInsightsResponse>;
}

export async function clearSession(sessionId: string): Promise<void> {
  await fetch(`${API_BASE}/session/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
  });
}
