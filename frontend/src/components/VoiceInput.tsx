import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { transcribeAudioChunk } from '../services/transcriptionService';

export interface VoiceInputHandle {
  start: () => void;
  stop: () => void;
}

interface VoiceInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  batchIntervalMs?: number;
  onTranscription?: (entry: { time: string; text: string }) => void;
  onDebugEvent?: (message: string) => void;
  onRecordingChange?: (isRecording: boolean) => void;
}

export const VoiceInput = forwardRef<VoiceInputHandle, VoiceInputProps>(function VoiceInput({
  onSubmit,
  disabled,
  batchIntervalMs = 60000,
  onTranscription,
  onDebugEvent,
  onRecordingChange,
}, ref) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const activeRecorderRef = useRef<MediaRecorder | null>(null);
  const batchTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const shouldContinueRef = useRef(false);
  
  const transcriptionQueueRef = useRef(Promise.resolve());

  const logVoiceEvent = useCallback((message: string) => {
    const stamped = `${new Date().toLocaleTimeString()} ${message}`;
    console.log(`[voice-input] ${stamped}`);
    onDebugEvent?.(stamped);
  }, [onDebugEvent]);

  const enqueueTranscription = useCallback(
    (chunk: Blob) => {
      if (!chunk.size) return;
      // Skip suspiciously small blobs — likely silence (< ~1s of audio ≈ 8 KB at 64 kbps)
      if (chunk.size < 8000) {
        logVoiceEvent(`batch too small (${chunk.size} bytes), skipping`);
        return;
      }
      setIsTranscribing(true);

      transcriptionQueueRef.current = transcriptionQueueRef.current
        .then(async () => {
          logVoiceEvent(`sending batch (${chunk.size} bytes) to /api/transcribe`);
          const transcript = await transcribeAudioChunk(chunk);
          const trimmed = transcript.trim();

          // Whisper sometimes hallucinates subtitle credits on silent/short audio — discard them
          const HALLUCINATIONS = [
            'ondertitels ingediend door de amara.org gemeenschap',
            'subtitles by the amara.org community',
            'amara.org',
          ];
          const isHallucination = HALLUCINATIONS.some(h =>
            trimmed.toLowerCase().includes(h)
          );

          if (!trimmed || isHallucination) {
            logVoiceEvent(isHallucination ? 'filtered whisper hallucination' : 'transcription returned empty text');
            return;
          }
          onTranscription?.({
            time: new Date().toLocaleTimeString(),
            text: trimmed,
          });
          logVoiceEvent(`transcription completed (${trimmed.length} chars)`);
          setVoiceError(null);
          await onSubmit(trimmed);
        })
        .catch(err => {
          setVoiceError('Transcription failed');
          logVoiceEvent(`transcription error: ${err.message}`);
        })
        .finally(() => {
          setIsTranscribing(false);
        });
    },
    [onSubmit, onTranscription, logVoiceEvent]
  );

  // The Relay Race Logic
  const recordNextBatch = useCallback(() => {
    if (!shouldContinueRef.current || !streamRef.current) return;

    // Create a BRAND NEW recorder instance for this batch (just like the probe)
    const recorder = new MediaRecorder(streamRef.current);
    activeRecorderRef.current = recorder;
    const chunks: Blob[] = [];

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const mimeType = recorder.mimeType || chunks[0]?.type || 'audio/webm';
      const blob = new Blob(chunks, { type: mimeType });
      
      if (blob.size > 0) {
        logVoiceEvent(`batch complete: captured ${blob.size} bytes`);
        enqueueTranscription(blob);
      } else {
        logVoiceEvent('warning: batch captured 0 bytes');
      }

      // As soon as this batch successfully stops and is handed off, start the next one
      if (shouldContinueRef.current) {
        recordNextBatch();
      }
    };

    // Start recording without timeslices. We just want one big chunk at the end.
    recorder.start();
    logVoiceEvent('started new recording batch...');

    // Set a timer to stop this specific recorder after the interval
    batchTimeoutRef.current = window.setTimeout(() => {
      if (recorder.state === 'recording') {
        logVoiceEvent('batch interval reached, stopping current recorder');
        recorder.stop(); // This triggers onstop, which triggers the next batch
      }
    }, batchIntervalMs);

  }, [batchIntervalMs, enqueueTranscription, logVoiceEvent]);

  const startRecording = useCallback(async () => {
    try {
      setVoiceError(null);

      // 1. Open the mic ONCE
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      shouldContinueRef.current = true;
      setIsRecording(true);
      logVoiceEvent('microphone stream opened successfully');

      // 2. Kick off the relay race
      recordNextBatch();

    } catch (err) {
      alert('Could not access the microphone. Please allow permissions.');
    }
  }, [logVoiceEvent, recordNextBatch]);

  const stopRecording = useCallback(() => {
    shouldContinueRef.current = false; // Break the loop
    
    if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);

    if (activeRecorderRef.current && activeRecorderRef.current.state === 'recording') {
      logVoiceEvent('manual stop requested, finishing final batch');
      activeRecorderRef.current.stop();
    }

    // Kill the mic stream entirely
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setIsRecording(false);
  }, [logVoiceEvent]);

  const flushNow = useCallback(() => {
    if (activeRecorderRef.current && activeRecorderRef.current.state === 'recording') {
      logVoiceEvent('manual flush requested');
      if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
      // Stopping the current recorder forces it to fire onstop, 
      // which sends the audio AND immediately starts the next batch.
      activeRecorderRef.current.stop(); 
    }
  }, [logVoiceEvent]);

  const handleSubmit = useCallback(() => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  }, [onSubmit, text]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldContinueRef.current = false;
      streamRef.current?.getTracks().forEach(track => track.stop());
      if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
    };
  }, []);

  // Notify parent of recording state changes
  useEffect(() => {
    onRecordingChange?.(isRecording);
  }, [isRecording, onRecordingChange]);

  // Expose start/stop to parent via ref
  useImperativeHandle(ref, () => ({ start: startRecording, stop: stopRecording }));

  return (
    <div className="voice-input">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type or record in Dutch..."
        disabled={disabled}
        onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
      />
      <div className="voice-input-actions" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button onClick={isRecording ? stopRecording : startRecording} disabled={disabled}>
          {isRecording ? '⏹ Stop' : '🎙 Record'}
        </button>
        
        {isRecording && (
          <button onClick={flushNow} disabled={disabled}>
            ⚡ Flush now
          </button>
        )}
        
        <button onClick={handleSubmit} disabled={disabled || !text.trim()}>
          Genereer Inzichten Nu
        </button>
      </div>

      {isRecording && <p>Recording locally in batches...</p>}
      {isTranscribing && <p>Transcribing...</p>}
      {voiceError && <p style={{ color: 'red' }}>{voiceError}</p>}
    </div>
  );
});