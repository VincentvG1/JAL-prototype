import { useCallback, useState } from 'react';
import type { CoachFeedback, PromptStage, VideoMode, VideoResult } from '../types/video';
import { coachPrompt, generateVideo as generateVideoRequest } from '../services/videoService';

interface InitialState {
  promptStage: PromptStage;
  rawPrompt: string;
  coachFeedback: CoachFeedback | null;
  currentVideo: VideoResult | null;
  error: string | null;
}

const INITIAL: InitialState = {
  promptStage: 'idle',
  rawPrompt: '',
  coachFeedback: null,
  currentVideo: null,
  error: null,
};

export interface UseVideoWorkflow {
  promptStage: PromptStage;
  rawPrompt: string;
  coachFeedback: CoachFeedback | null;
  currentVideo: VideoResult | null;
  error: string | null;
  mode: VideoMode;
  loadingPhase: 'idle' | 'coaching' | 'generating';
  setRawPrompt: (value: string) => void;
  toggleMode: () => void;
  submitToCoach: () => Promise<void>;
  applyEnhancedPrompt: () => void;
  generateVideo: () => Promise<void>;
  startRegenerate: () => void;
  reset: () => void;
  clearError: () => void;
}

const MODE_KEY = 'jal-video-mode';

function readInitialMode(): VideoMode {
  const raw = window.localStorage.getItem(MODE_KEY);
  return raw === 'real' ? 'real' : 'mock';
}

export function useVideoWorkflow(): UseVideoWorkflow {
  const [promptStage, setPromptStage] = useState<PromptStage>(INITIAL.promptStage);
  const [rawPrompt, setRawPromptState] = useState<string>(INITIAL.rawPrompt);
  const [coachFeedback, setCoachFeedback] = useState<CoachFeedback | null>(INITIAL.coachFeedback);
  const [currentVideo, setCurrentVideo] = useState<VideoResult | null>(INITIAL.currentVideo);
  const [error, setError] = useState<string | null>(INITIAL.error);
  const [mode, setMode] = useState<VideoMode>(() => readInitialMode());
  const [loadingPhase, setLoadingPhase] = useState<'idle' | 'coaching' | 'generating'>('idle');

  const clearError = useCallback(() => setError(null), []);

  const setRawPrompt = useCallback((value: string) => {
    setRawPromptState(value);
    setPromptStage('idle');
    setError(null);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(prev => {
      const next: VideoMode = prev === 'mock' ? 'real' : 'mock';
      window.localStorage.setItem(MODE_KEY, next);
      return next;
    });
    setCoachFeedback(null);
    setPromptStage('idle');
    setError(null);
    setLoadingPhase('idle');
  }, []);

  const submitToCoach = useCallback(async () => {
    const trimmed = rawPrompt.trim();
    if (!trimmed) {
      setError('Vul eerst een prompt in.');
      return;
    }

    setError(null);
    setCoachFeedback(null);
    setPromptStage('coaching');
    setLoadingPhase('coaching');

    try {
      const result = await coachPrompt(trimmed, mode);
      if (!result.success) {
        setError(result.error);
        setPromptStage('idle');
        setLoadingPhase('idle');
        return;
      }

      setCoachFeedback(result.feedback);
      setPromptStage('coached');
      setLoadingPhase('idle');
    } catch {
      setError('Coach service is tijdelijk niet bereikbaar.');
      setPromptStage('idle');
      setLoadingPhase('idle');
    }
  }, [rawPrompt, mode]);

  const applyEnhancedPrompt = useCallback(() => {
    if (!coachFeedback) return;
    setRawPromptState(coachFeedback.enhancedPrompt);
  }, [coachFeedback]);

  const generateVideo = useCallback(async () => {
    const trimmed = rawPrompt.trim();
    if (!trimmed) {
      setError('Prompt is leeg.');
      return;
    }
    if (!coachFeedback?.isReadyForGeneration) {
      setError('Check je prompt eerst met de coach.');
      return;
    }

    setError(null);
    setPromptStage('generating');
    setLoadingPhase('generating');

    try {
      const result = await generateVideoRequest(trimmed, mode);
      if (!result.success) {
        setError(result.error);
        setPromptStage('coached');
        setLoadingPhase('idle');
        return;
      }

      setCurrentVideo(result.video);
      setPromptStage('completed');
      setLoadingPhase('idle');
    } catch {
      setError('Video service is tijdelijk niet bereikbaar.');
      setPromptStage('coached');
      setLoadingPhase('idle');
    }
  }, [rawPrompt, coachFeedback, mode]);

  const startRegenerate = useCallback(() => {
    setCoachFeedback(null);
    setError(null);
    setPromptStage('idle');
    setLoadingPhase('idle');
  }, []);

  const reset = useCallback(() => {
    setPromptStage(INITIAL.promptStage);
    setRawPromptState(INITIAL.rawPrompt);
    setCoachFeedback(INITIAL.coachFeedback);
    setCurrentVideo(INITIAL.currentVideo);
    setError(INITIAL.error);
    setLoadingPhase('idle');
  }, []);

  return {
    promptStage,
    rawPrompt,
    coachFeedback,
    currentVideo,
    error,
    mode,
    loadingPhase,
    setRawPrompt,
    toggleMode,
    submitToCoach,
    applyEnhancedPrompt,
    generateVideo,
    startRegenerate,
    reset,
    clearError,
  };
}
