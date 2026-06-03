export interface CoachFeedback {
  isReadyForGeneration: boolean;
  tips: string[];
  enhancedPrompt: string;
}

export type VideoMode = 'mock' | 'real';

export type CoachResponse =
  | { success: true; feedback: CoachFeedback }
  | { success: false; error: string };

export interface VideoResult {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
}

export type GenerateResponse =
  | { success: true; video: VideoResult }
  | { success: false; error: string };

export type PromptStage =
  | 'idle'
  | 'coaching'
  | 'coached'
  | 'generating'
  | 'completed';
