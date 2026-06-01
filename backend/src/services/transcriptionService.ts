// Uses OpenAI Whisper API for transcription (whisper-1 model).
// The same OPENAI_API_KEY from backend/.env is reused — no extra config needed.

import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const OPENAI_API_KEY  = process.env.OPENAI_API_KEY ?? 'YOUR_API_KEY_HERE';
const WHISPER_LANGUAGE = process.env.WHISPER_LANGUAGE ?? 'nl';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

export async function transcribeAudioBuffer(audioBuffer: Buffer): Promise<string> {
  // Write buffer to a temp file so it can be sent as a multipart upload
  const tmpFile = path.join(os.tmpdir(), `jal-audio-${Date.now()}.webm`);
  await fs.writeFile(tmpFile, audioBuffer);

  try {
    const fileBytes = await fs.readFile(tmpFile);
    const blob = new Blob([fileBytes], { type: 'audio/webm' });

    const form = new FormData();
    form.append('file', blob, 'audio.webm');
    form.append('model', 'whisper-1');
    form.append('language', WHISPER_LANGUAGE);
    // Prompt biases the model toward Dutch speech content and away from subtitle hallucinations
    form.append('prompt', 'Dit is een Nederlands gesprek over stedelijke problemen in Tilburg.');

    // Do NOT set Content-Type manually — fetch adds the multipart boundary automatically
    const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });

    if (!response.ok) {
      const raw = await response.text().catch(() => '');
      throw new Error(`OpenAI Whisper returned HTTP ${response.status}: ${raw.slice(0, 300)}`);
    }

    const data = (await response.json()) as { text: string };
    return data.text;
  } finally {
    await fs.unlink(tmpFile).catch(() => { /* best-effort cleanup */ });
  }
}