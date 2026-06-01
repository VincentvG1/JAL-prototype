export async function transcribeAudioChunk(chunk: Blob): Promise<string> {
  const startedAt = performance.now();
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    body: chunk,
  });

  console.log(
    `[transcription-service] /api/transcribe responded ${response.status} in ${Math.round(performance.now() - startedAt)}ms`,
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText })) as { error?: string };
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  const payload = await response.json() as { text?: string };
  return payload.text ?? '';
}