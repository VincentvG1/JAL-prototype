import { Router, type Request, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { callOllamaText } from '../services/ollamaClient.js';

const router = Router();

interface CoachFeedback {
  isReadyForGeneration: boolean;
  tips: string[];
  enhancedPrompt: string;
}

type VideoMode = 'mock' | 'real';

const DEMO_BASE_DIR = path.resolve(process.cwd(), '..', 'demo-files');
const DEMO_VIDEOS_DIR = path.join(DEMO_BASE_DIR, 'videos');

let demoVideoCursor = 0;
let mockCoachCallCount = 0;

const COACH_PROMPT = `Je bent een expert prompt-coach voor text-to-video (5 seconden clips) voor leerlingen van 10-15 jaar.
Beoordeel of een prompt rijk genoeg is om een sterke video te maken.

Een goede prompt bevat meestal:
- duidelijk onderwerp (wie/wat)
- omgeving/setting
- beweging/actie
- camerastandpunt of camerabeweging
- licht/sfeer/stijl

Geef ALTIJD geldig JSON terug, zonder markdown, in exact dit formaat:
{
  "isReadyForGeneration": boolean,
  "tips": ["tip 1", "tip 2"],
  "enhancedPrompt": "verbeterde prompt"
}

Regels:
- Antwoordinhoud in het Nederlands.
- Tips: 2-5 korte, concrete tips.
- enhancedPrompt: 1 korte alinea, max 80 woorden.
- Verzin geen nieuw onderwerp dat niet past bij de originele intentie.
- Als de prompt al goed is: isReadyForGeneration = true en geef 1-2 kleine verbeterpunten.`;

function stripFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function isCoachFeedback(value: unknown): value is CoachFeedback {
  if (typeof value !== 'object' || value === null) return false;
  const x = value as Record<string, unknown>;
  return (
    typeof x.isReadyForGeneration === 'boolean' &&
    Array.isArray(x.tips) &&
    x.tips.every(t => typeof t === 'string') &&
    typeof x.enhancedPrompt === 'string'
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function listDemoVideos(): Promise<string[]> {
  const files = await fs.readdir(DEMO_VIDEOS_DIR, { withFileTypes: true });
  return files
    .filter(f => f.isFile() && f.name.toLowerCase().endsWith('.mp4'))
    .map(f => f.name)
    .sort((a, b) => a.localeCompare(b));
}

function getMode(mode?: string): VideoMode {
  return mode === 'mock' ? 'mock' : 'real';
}

router.get('/mock/video/:filename', async (req: Request, res: Response) => {
  const fileName = path.basename(req.params.filename);
  const fullPath = path.join(DEMO_VIDEOS_DIR, fileName);

  if (!fullPath.startsWith(DEMO_VIDEOS_DIR)) {
    res.status(400).json({ success: false, error: 'Invalid filename' });
    return;
  }

  try {
    await fs.access(fullPath);
    res.sendFile(fullPath);
  } catch {
    res.status(404).json({ success: false, error: 'Mock video bestand niet gevonden.' });
  }
});

router.post('/coach', async (req: Request, res: Response) => {
  const { prompt, mode } = req.body as { prompt?: string; mode?: VideoMode };

  if (!prompt?.trim()) {
    res.status(400).json({ success: false, error: '`prompt` is required' });
    return;
  }

  const trimmed = prompt.trim();
  if (trimmed.length < 3) {
    res.status(400).json({ success: false, error: 'Prompt is te kort om te beoordelen.' });
    return;
  }

  const activeMode = getMode(mode);

  if (activeMode === 'mock') {
    await sleep(2000);
    mockCoachCallCount += 1;
    const isReady = mockCoachCallCount >= 2;
    if (isReady) mockCoachCallCount = 0; // reset voor volgende cyclus

    const feedback: CoachFeedback = isReady
      ? {
          isReadyForGeneration: true,
          tips: [
            'Goede prompt! Je video kan gegenereerd worden.',
            'Eventueel: voeg een camerastandpunt toe voor meer effect.',
            'Top, klik nu op "Genereer video"!',
          ],
          enhancedPrompt: trimmed,
        }
      : {
          isReadyForGeneration: false,
          tips: [
            'Beschrijf wie of wat er in de video te zien is.',
            'Voeg een omgeving of locatie toe, zoals "in een ruimteschip".',
            'Beschrijf een beweging of actie, zoals "rent door het bos".',
          ],
          enhancedPrompt: trimmed,
        };

    res.json({ success: true, feedback });
    return;
  }

  try {
    const raw = await callOllamaText(
      COACH_PROMPT,
      `Beoordeel deze prompt en geef JSON terug:\n\n"${trimmed}"`,
      600,
      true, // enforce JSON response format
    );

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripFences(raw));
    } catch {
      console.error('[video/coach] invalid JSON:', raw);
      res.status(502).json({ success: false, error: 'Coach gaf ongeldige output. Probeer opnieuw.' });
      return;
    }

    if (!isCoachFeedback(parsed)) {
      res.status(502).json({ success: false, error: 'Coach output had een onverwacht formaat.' });
      return;
    }

    res.json({ success: true, feedback: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[video/coach]', message);
    res.status(502).json({ success: false, error: message });
  }
});

const MAGIC_HOUR_URL = 'https://api.magichour.ai';

async function createMagicHourJob(prompt: string): Promise<string> {
  const key = process.env.MAGIC_HOUR_API_KEY;
  if (!key) {
    throw new Error('MAGIC_HOUR_API_KEY ontbreekt in backend/.env');
  }

  const response = await fetch(`${MAGIC_HOUR_URL}/v1/text-to-video`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      end_seconds: 5,
      dimensions: { width: 1920, height: 1080 },
      style: { prompt, model: 'default' },
    }),
  });

  if (!response.ok) {
    const raw = await response.text().catch(() => '');
    throw new Error(`Job aanmaken mislukt (${response.status}): ${raw.slice(0, 200)}`);
  }

  const data = (await response.json()) as { id?: string };
  if (!data.id) throw new Error('Geen job-id ontvangen van Magic Hour');
  return data.id;
}

async function pollMagicHourJob(jobId: string, maxWaitMs = 180_000): Promise<string> {
  const key = process.env.MAGIC_HOUR_API_KEY;
  if (!key) {
    throw new Error('MAGIC_HOUR_API_KEY ontbreekt in backend/.env');
  }

  const deadline = Date.now() + maxWaitMs;

  while (Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 4000));

    const response = await fetch(`${MAGIC_HOUR_URL}/v1/video-projects/${jobId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });

    if (!response.ok) continue;

    const data = (await response.json()) as {
      status?: string;
      downloads?: Array<{ url?: string }>;
    };

    if (data.status === 'complete') {
      const url = data.downloads?.[0]?.url;
      if (!url) throw new Error('Video klaar, maar geen download URL ontvangen');
      return url;
    }

    if (data.status === 'error' || data.status === 'cancelled') {
      throw new Error(`Video-job gestopt met status: ${data.status}`);
    }
  }

  throw new Error('Video generatie duurde te lang (timeout na 3 minuten).');
}

router.post('/generate', async (req: Request, res: Response) => {
  const { prompt, mode } = req.body as { prompt?: string; mode?: VideoMode };

  if (!prompt?.trim()) {
    res.status(400).json({ success: false, error: '`prompt` is required' });
    return;
  }

  const trimmed = prompt.trim();
  const activeMode = getMode(mode);

  if (activeMode === 'mock') {
    try {
      await sleep(15000); // DEMO: generation loading
      const videos = await listDemoVideos();
      if (videos.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Geen mockvideo\'s gevonden in demo-files/videos. Voeg .mp4 bestanden toe.',
        });
        return;
      }

      const selected = videos[demoVideoCursor % videos.length];
      demoVideoCursor += 1;

      res.json({
        success: true,
        video: {
          id: randomUUID(),
          url: `/api/video/mock/video/${encodeURIComponent(selected)}`,
          prompt: trimmed,
          createdAt: new Date().toISOString(),
        },
      });
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[video/generate][mock]', message);
      res.status(502).json({ success: false, error: `Mock generatie fout: ${message}` });
      return;
    }
  }

  try {
    const jobId = await createMagicHourJob(trimmed);
    const url = await pollMagicHourJob(jobId);

    res.json({
      success: true,
      video: {
        id: randomUUID(),
        url,
        prompt: trimmed,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[video/generate]', message);
    res.status(502).json({ success: false, error: message });
  }
});

export default router;
