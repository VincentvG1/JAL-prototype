// Encapsulates the async AI request lifecycle (loading, error, result).
// Components call submitInput and get back keywords without touching fetch directly.

import { useState, useCallback } from 'react';
import { processInput } from '../services/aiService';
import type { AIInsightsResponse } from '../types/mindmap';

export interface UseAIKeywordsReturn {
  loading: boolean;
  error: string | null;
  submitInput: (text: string, sessionId: string) => Promise<AIInsightsResponse>;
}

export function useAIKeywords(): UseAIKeywordsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitInput = useCallback(
    async (text: string, sessionId: string): Promise<AIInsightsResponse> => {
      setLoading(true);
      setError(null);
      try {
        return await processInput(text, sessionId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return { rollingSummary: '', snippets: [], nextQuestions: [] };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { loading, error, submitInput };
}
