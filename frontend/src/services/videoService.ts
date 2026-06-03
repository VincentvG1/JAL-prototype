import type { CoachResponse, GenerateResponse, VideoMode } from '../types/video';

const API_BASE = '/api/video';

export async function coachPrompt(prompt: string, mode: VideoMode): Promise<CoachResponse> {
  const response = await fetch(`${API_BASE}/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, mode }),
  });

  const body = (await response.json().catch(() => ({ success: false, error: response.statusText }))) as CoachResponse;

  if (!response.ok && !body.success) {
    return body;
  }

  return body;
}

export async function generateVideo(prompt: string, mode: VideoMode): Promise<GenerateResponse> {
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, mode }),
  });

  const body = (await response.json().catch(() => ({ success: false, error: response.statusText }))) as GenerateResponse;

  if (!response.ok && !body.success) {
    return body;
  }

  return body;
}
