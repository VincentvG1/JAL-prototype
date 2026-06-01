// POST /api/chat/problem  — intro chatbot for ProblemExploration screen
// POST /api/chat/brainstorm — in-canvas quick-answer chatbot

import { Router, type Request, type Response } from 'express';
import { callOllamaText } from '../services/ollamaClient.js';

const router = Router();

// Short context descriptions per problem (Dutch, kid-friendly framing).
const PROBLEM_CONTEXT: Record<string, string> = {
  afval:
    'Afvalproblematiek in Tilburg: overvolle prullenbakken, zwerfvuil op straat en onvoldoende recyclingmogelijkheden in het stadscentrum.',
  verkeer:
    'Verkeersveiligheid bij scholen in Tilburg: drukke wegen, gevaarlijke oversteken en te snel rijdend verkeer tijdens schooltijden.',
  park:
    'Bewegen en gezondheid in Tilburg: jongeren bewegen te weinig, het Wilhelminapark wordt weinig gebruikt en er zijn onvoldoende aantrekkelijke buitenactiviteiten.',
  mobiliteit:
    'Openbaar vervoer en toegankelijkheid in Tilburg: het OV-systeem is verwarrend en duur voor jongeren, en niet iedereen heeft een fiets.',
  luchtkwaliteit:
    'Luchtkwaliteit in Tilburg: bedrijven en verkeer in de Spoorzone veroorzaken luchtvervuiling in woonwijken, wat gezondheidsklachten oplevert.',
};

router.post('/problem', async (req: Request, res: Response) => {
  const { problemId, question } = req.body as { problemId?: string; question?: string };

  if (!problemId || !question?.trim()) {
    res.status(400).json({ error: '`problemId` and `question` are required' });
    return;
  }

  const context =
    PROBLEM_CONTEXT[problemId] ?? `Maatschappelijk probleem in de stad: ${problemId}`;

  const systemPrompt = `Je bent een vriendelijke uitlegassistent voor leerlingen van 10–15 jaar die deelnemen aan een maatschappelijke hackathon.
Je helpt hen het volgende probleem begrijpen:

${context}

Regels:
- Antwoord altijd in het Nederlands.
- Maximaal 3 korte zinnen per antwoord.
- Gebruik begrijpelijke taal, geen jargon.
- Moedig de leerling aan om kritisch na te denken.
- Wees enthousiast en positief.`;

  try {
    const answer = await callOllamaText(systemPrompt, question.trim());
    res.json({ answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[chat/problem]', message);
    res.status(502).json({ error: message });
  }
});

// ─── Brainstorm chatbot ────────────────────────────────────────────────────
// Quick factual/provocative answer to keep the brainstorm moving.
// Keeps answers very short — students won't read long text.

router.post('/brainstorm', async (req: Request, res: Response) => {
  const { question, summary } = req.body as { question?: string; summary?: string };

  if (!question?.trim()) {
    res.status(400).json({ error: '`question` is required' });
    return;
  }

  const contextLine = summary?.trim()
    ? `De lopende brainstorm gaat over: ${summary.trim()}`
    : 'Er is nog geen specifieke brainstormcontext.';

  const systemPrompt = `Je bent een snelle informatieve assistent voor leerlingen van 10–15 jaar.
${contextLine}

Regels:
- Antwoord ALTIJD in het Nederlands.
- Geef een DIRECTE, feitelijke antwoord. Stel GEEN vragen terug aan de leerling.
- Maximaal 4-5 korte zinnen. Niet meer.
- Geen lange uitleg, geen opsommingen.
- Sluit je antwoord NIET af met een vraag of uitnodiging.`;

  try {
    const rawAnswer = await callOllamaText(systemPrompt, question.trim(), 120);
    const answer = `${rawAnswer.trim()} Zijn er nog verdere vragen?`;
    res.json({ answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[chat/brainstorm]', message);
    res.status(502).json({ error: message });
  }
});

export default router;
