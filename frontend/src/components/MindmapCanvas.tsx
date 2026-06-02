// Main canvas component — no sidebar. All controls live inside/around the ReactFlow canvas.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { KeywordNode, STICKY_PALETTE } from './KeywordNode';
import { DeleteEdge } from './DeleteEdge';
import { VoiceInput, type VoiceInputHandle } from './VoiceInput';
import { BrainstormChatPanel } from './BrainstormChatPanel';
import { TimerBanner as _TimerBanner, type MindmapMode } from './TimerBanner'; // unused — timer is now in StepProgressBar
import { useAIKeywords } from '../hooks/useAIKeywords';
import { clearSession } from '../services/aiService';
import type { InsightContext, SnippetNodeData, SnippetSource, StickyColorId } from '../types/mindmap';

const nodeTypes: NodeTypes = { snippet: KeywordNode };
const edgeTypes = { delete: DeleteEdge };

const EMPTY_INSIGHT_CONTEXT: InsightContext = {
  rollingSummary: 'Nog geen samenvatting beschikbaar.',
  snippets: [],
  nextQuestions: [],
};

// ─── DraggableNoteCard ────────────────────────────────────────────────────
// Lives inside <ReactFlow> via Panel so useReactFlow() is accessible.

interface DragCardProps {
  activeColor: StickyColorId;
  onDrop: (x: number, y: number, color: StickyColorId) => void;
  onColorChange: (c: StickyColorId) => void;
}

function DraggableNoteCard({ activeColor, onDrop, onColorChange }: DragCardProps) {
  const { screenToFlowPosition } = useReactFlow();
  const palette = STICKY_PALETTE[activeColor];

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const ghost = document.createElement('div');
    ghost.className = 'note-ghost';
    ghost.style.background = palette.bg;
    ghost.style.borderColor = palette.border;
    ghost.style.left = `${e.clientX - 60}px`;
    ghost.style.top = `${e.clientY - 38}px`;
    document.body.appendChild(ghost);

    const onMove = (ev: PointerEvent) => {
      ghost.style.left = `${ev.clientX - 60}px`;
      ghost.style.top = `${ev.clientY - 38}px`;
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.removeChild(ghost);
      const pos = screenToFlowPosition({ x: ev.clientX, y: ev.clientY });
      onDrop(pos.x, pos.y, activeColor);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div className="note-create-row">
      <div
        className="note-drag-card"
        style={{ background: palette.bg, borderColor: palette.border, color: palette.text }}
        onPointerDown={handlePointerDown}
      >
        <span className="note-drag-icon">📝</span>
        <span className="note-drag-hint">Versleep om een nieuw kaartje te plaatsen</span>
      </div>
      <div className="color-swatches">
        {(Object.keys(STICKY_PALETTE) as StickyColorId[]).map(id => (
          <button
            key={id}
            className={`color-swatch${id === activeColor ? ' active' : ''}`}
            style={{ background: STICKY_PALETTE[id].flat, borderColor: STICKY_PALETTE[id].border }}
            onClick={() => onColorChange(id)}
            title={id}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main canvas component ────────────────────────────────────────────────

interface MindmapCanvasProps {
  sessionId: string;
  mode: MindmapMode;
  onComplete: () => void;
}

type ViewMode = 'product' | 'debug';
interface TranscriptionEntry { id: number; time: string; text: string; }
interface DebugLogEntry { id: number; time: string; message: string; }

export function MindmapCanvas({ sessionId, mode, onComplete }: MindmapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<SnippetNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('product');
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [debugLogs, setDebugLogs] = useState<DebugLogEntry[]>([]);
  const [latestInsights, setLatestInsights] = useState<InsightContext>(EMPTY_INSIGHT_CONTEXT);
  const [isRecording, setIsRecording] = useState(false);
  const [activeColor, setActiveColor] = useState<StickyColorId>('yellow');

  const voiceRef = useRef<VoiceInputHandle>(null);
  const transcriptionSeqRef = useRef(0);
  const debugSeqRef = useRef(0);

  const { loading, error, submitInput } = useAIKeywords();

  const pushDebugLog = useCallback((message: string) => {
    debugSeqRef.current += 1;
    setDebugLogs(current => [
      {
        id: debugSeqRef.current,
        time: new Date().toLocaleTimeString(),
        message,
      },
      ...current,
    ].slice(0, 50));
  }, []);

  // Send transcription to AI — only updates brainstorm questions in the sidebar.
  // AI cards are intentionally NOT added here; users place cards manually.
  const handleUserInput = useCallback(async (text: string) => {
    pushDebugLog(`sending user input to AI (${text.length} chars) [mode=${mode}]`);
    const result = await submitInput(text, sessionId, mode);
    setLatestInsights(result);
    pushDebugLog(`rolling summary updated (${result.rollingSummary.length} chars)`);
    pushDebugLog(`AI returned ${result.nextQuestions.length} brainstorm prompts`);
  }, [submitInput, sessionId, mode, pushDebugLog]);

  const handleTranscription = useCallback((entry: { time: string; text: string }) => {
    transcriptionSeqRef.current += 1;
    setTranscriptions(current => [
      { id: transcriptionSeqRef.current, time: entry.time, text: entry.text },
      ...current,
    ].slice(0, 25));
  }, []);

  const handleVoiceDebugEvent = useCallback((message: string) => {
    pushDebugLog(message);
  }, [pushDebugLog]);

  const handleDropNote = useCallback((x: number, y: number, color: StickyColorId) => {
    const id = `user-${Date.now()}`;
    setNodes(cur => [...cur, {
      id,
      type: 'snippet' as const,
      position: { x, y },
      data: { label: '', source: 'user' as SnippetSource, color, editing: true },
    }]);
  }, [setNodes]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge({ ...connection, type: 'delete' }, eds));
  }, [setEdges]);

  const handleClear = useCallback(async () => {
    if (confirm('Wis alle kaartjes van het canvas en reset de sessie?')) {
      setNodes([]);
      setEdges([]);
      setLatestInsights(EMPTY_INSIGHT_CONTEXT);
      setTranscriptions([]);
      setDebugLogs([]);
      pushDebugLog('canvas and session cleared');
      try {
        await clearSession(sessionId);
        pushDebugLog(`session ${sessionId} cleared on backend`);
      } catch (err) {
        pushDebugLog(`failed to clear backend session: ${err instanceof Error ? err.message : 'unknown'}`);
      }
    }
  }, [setNodes, setEdges, sessionId, pushDebugLog]);

  useEffect(() => {
    if (error) pushDebugLog(`AI error: ${error}`);
  }, [error, pushDebugLog]);

  const toggleView = useCallback(() => {
    setViewMode(cur => cur === 'product' ? 'debug' : 'product');
  }, []);

  return (
    <div className="mindmap-shell">
      {/*
        VoiceInput lives here — OUTSIDE the viewMode conditional — so it never
        unmounts when the user switches between product and debug mode.
        In product mode it is CSS-hidden; in debug mode it is visible inside
        the Invoer panel (which is in the SAME position in the tree).
      */}
      <div className={viewMode === 'product' ? 'voice-hidden' : 'voice-debug-panel'}>
        <VoiceInput
          ref={voiceRef}
          onSubmit={handleUserInput}
          disabled={loading}
          batchIntervalMs={60 * 1000}
          onTranscription={handleTranscription}
          onDebugEvent={handleVoiceDebugEvent}
          onRecordingChange={setIsRecording}
        />
      </div>

      {viewMode === 'product' ? (
        <div className="canvas-wrapper">

          {/* Brainstorm sidebar — AI questions, top-right */}
          <BrainstormChatPanel
            helpers={latestInsights.nextQuestions}
            disabled={loading}
          />

          {/* Timer is now in the top StepProgressBar — removed from here */}

          {/* Debug toggle — bottom-right */}
          <button className="view-toggle-btn" onClick={toggleView}>
            Open Debugging Dashboard
          </button>

          {/* Skip button — admin shortcut, bottom-right above debug btn */}
          <button className="skip-step-btn" onClick={onComplete} title="Sla stap over (admin)">
            ⏭ Sla over
          </button>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionRadius={60}
            fitView
            deleteKeyCode="Delete"
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            {/* Controls CSS-overridden to sit below the listen button */}
            <Controls />

            {/* Top-left: big listen / stop button */}
            <Panel position="top-left" style={{ margin: '14px 0 0 14px' }}>
              <button
                className={`listen-btn${isRecording ? ' listening' : ''}`}
                onClick={() => isRecording ? voiceRef.current?.stop() : voiceRef.current?.start()}
                disabled={loading}
              >
                {isRecording ? '⏹ Stop met luisteren' : '🎙 Luister met ons mee'}
              </button>
            </Panel>

            {/* Bottom-left: draggable note card + colour swatches */}
            <Panel position="bottom-left" style={{ margin: '0 0 14px 14px' }}>
              <DraggableNoteCard
                activeColor={activeColor}
                onDrop={handleDropNote}
                onColorChange={setActiveColor}
              />
            </Panel>
          </ReactFlow>
        </div>
      ) : (
        <div className="debug-dashboard">
          <button className="view-toggle-btn" onClick={toggleView}>
            ← Terug naar product
          </button>
          <header className="debug-header">
            <h2>Debugging Dashboard</h2>
            <p>Inspect transcriptie-kwaliteit, runtime events en de nieuwste interne inzichtstaat.</p>
          </header>

          <div className="debug-grid">
            <section className="debug-panel">
              <h3>Invoer</h3>
              {/* VoiceInput is rendered above the conditional and shown here via CSS */}
              {loading && <p className="status loading">Thinking…</p>}
              {error && <p className="status error">{error}</p>}
              <div style={{ marginTop: 10 }}>
                <button onClick={handleClear} className="btn-danger">Wis canvas en sessie</button>
              </div>
            </section>

            <section className="debug-panel">
              <h3>Transcriptions</h3>
              {transcriptions.length === 0 ? (
                <p className="debug-empty">No transcriptions yet.</p>
              ) : (
                <ul className="transcription-list">
                  {transcriptions.map(item => (
                    <li key={item.id} className="transcription-item">
                      <span className="transcription-time">{item.time}</span>
                      <p>{item.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="debug-panel">
              <h3>Debug Log</h3>
              {debugLogs.length === 0 ? (
                <p className="debug-empty">No events yet.</p>
              ) : (
                <ul className="debug-log-list">
                  {debugLogs.map(item => (
                    <li key={item.id}>
                      <span className="debug-log-time">{item.time}</span>
                      <span>{item.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="debug-panel">
              <h3>Interne Inzichtstaat (Latest)</h3>
              <p className="debug-meta">
                Keywords: {latestInsights.snippets.length} | Vragen: {latestInsights.nextQuestions.length}
              </p>
              <p className="debug-summary">{latestInsights.rollingSummary || 'Nog geen samenvatting.'}</p>
              <pre className="hidden-mindmap-json">
                {JSON.stringify(latestInsights, null, 2)}
              </pre>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
