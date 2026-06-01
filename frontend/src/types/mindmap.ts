// Shared type definitions for the mindmap domain.
// These mirror the backend's shapes so both sides stay in sync.

export type SnippetSource = 'ai' | 'user';
export type StickyColorId = 'yellow' | 'pink' | 'blue' | 'green';

export interface SnippetNodeData extends Record<string, unknown> {
  label: string;
  source: SnippetSource;
  color?: StickyColorId;
  editing?: boolean;
}

export interface InsightContext {
  rollingSummary: string;
  snippets: string[];
  nextQuestions: string[];
}

export interface AIInsightsResponse extends InsightContext {
}
