// ─────────────────────────────────────────────────────────────────────────────
// OpenAI API client  (replaces the previous local-Ollama client)
// ─────────────────────────────────────────────────────────────────────────────
//
// REQUIRED — set in  backend/.env  (copy from  backend/.env.example):
//
//   OPENAI_API_KEY=sk-proj-...your-key-here...
//
// Get a key at: https://platform.openai.com/api-keys
//
// OPTIONAL overrides:
//   OPENAI_MODEL=gpt-4o-mini   (default)
// ─────────────────────────────────────────────────────────────────────────────

// ⚠️  REPLACE "YOUR_API_KEY_HERE" WITH YOUR ACTUAL KEY  ⚠️
// Better: set OPENAI_API_KEY in backend/.env instead of hard-coding here.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? 'YOUR_API_KEY_HERE';
const DEFAULT_MODEL   = process.env.OPENAI_MODEL  ?? 'gpt-4o-mini';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

if (OPENAI_API_KEY === 'YOUR_API_KEY_HERE') {
  console.warn(
    '\n[openai] ⚠️  OPENAI_API_KEY is not set!\n' +
    '         Create backend/.env and add:  OPENAI_API_KEY=sk-proj-...\n' +
    '         See backend/.env.example for all options.\n',
  );
}

export interface OllamaResponse {
  rollingSummary: string;
  snippets: string[];
  nextQuestions: string[];
}

interface OpenAIMessage { role: 'system' | 'user'; content: string }

interface OpenAIResult {
  choices: [{ message: { content: string } }];
}

async function openAIFetch(
  messages: OpenAIMessage[],
  jsonMode: boolean,
  maxTokens = 800,
): Promise<string> {
  type Body = {
    model: string;
    messages: OpenAIMessage[];
    max_tokens: number;
    response_format?: { type: 'json_object' };
  };

  const body: Body = { model: DEFAULT_MODEL, messages, max_tokens: maxTokens };
  if (jsonMode) body.response_format = { type: 'json_object' };

  let response: Response;
  try {
    response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(`Cannot reach OpenAI API. Check your network connection. (${String(err)})`);
  }

  if (!response.ok) {
    const raw = await response.text().catch(() => '');
    throw new Error(`OpenAI returned HTTP ${response.status}: ${raw.slice(0, 300)}`);
  }

  const data = (await response.json()) as OpenAIResult;
  return data.choices[0].message.content;
}

// JSON-structured response — used by /api/ai/process
export async function callOllama(
  systemPrompt: string,
  userMessage: string,
): Promise<OllamaResponse> {
  const content = await openAIFetch(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage  },
    ],
    true,   // request JSON mode
    900,
  );

  try {
    return JSON.parse(content) as OllamaResponse;
  } catch {
    throw new Error(
      `LLM response was not valid JSON. Raw content: ${content.slice(0, 200)}`,
    );
  }
}

// Plain-text response — used by chatbot endpoints.
// Pass jsonMode=true when the caller expects a JSON object back (e.g. the prompt coach).
export async function callOllamaText(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 150,
  jsonMode = false,
): Promise<string> {
  return openAIFetch(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage  },
    ],
    jsonMode,
    maxTokens,
  );
}
