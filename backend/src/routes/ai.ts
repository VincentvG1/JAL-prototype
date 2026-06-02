import { Router, type Request, type Response } from 'express';
import { getSession, updateSession, clearSession } from '../services/contextManager.js';
import { buildSystemPrompt } from '../services/promptBuilder.js';
import { callOllama } from '../services/ollamaClient.js';

const router = Router();

router.post('/process', async (req: Request, res: Response) => {
  const { text, sessionId, mode = 'analysis' } = req.body as { text?: string; sessionId?: string; mode?: 'analysis' | 'solution' };

  if (!text?.trim() || !sessionId?.trim()) {
    res.status(400).json({ error: '`text` and `sessionId` are required' });
    return;
  }

  try {
    const session = getSession(sessionId);
    console.log(`[ai/process] starting insight extraction for session ${sessionId} (mode=${mode})`);
    const systemPrompt = buildSystemPrompt(session, mode);
    const result = await callOllama(systemPrompt, text.trim());

    const rollingSummary = typeof result.rollingSummary === 'string' ? result.rollingSummary.trim() : '';
    const snippets = Array.isArray(result.snippets)
      ? result.snippets.filter((s): s is string => typeof s === 'string').map(s => s.trim()).filter(Boolean)
      : [];
    const nextQuestions = Array.isArray(result.nextQuestions)
      ? result.nextQuestions.filter((q): q is string => typeof q === 'string').map(q => q.trim()).filter(Boolean)
      : [];

    console.log(`[ai/process] insights complete (${snippets.length} snippets, ${nextQuestions.length} questions)`);
    updateSession(
      sessionId,
      text.trim(),
      rollingSummary,
      snippets,
      nextQuestions,
    );

    res.json({
      rollingSummary,
      snippets,
      nextQuestions,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ai/process]', message);
    res.status(502).json({ error: `AI request failed: ${message}` });
  }
});

router.delete('/session/:sessionId', (req: Request, res: Response) => {
  clearSession(req.params.sessionId);
  res.json({ ok: true });
});

export default router;
