// Custom React Flow node — sticky note card with inline editing and connection handles.

import { memo, useState, useEffect, useRef } from 'react';
import { type NodeProps, type Node, Handle, Position, useReactFlow } from '@xyflow/react';
import type { SnippetNodeData } from '../types/mindmap';

type SnippetNodeType = Node<SnippetNodeData, 'snippet'>;

export const STICKY_PALETTE = {
  yellow: { bg: 'linear-gradient(165deg, #ffe892 0%, #ffd768 100%)', border: '#e0b949', text: '#47370c', flat: '#ffd768' },
  pink:   { bg: 'linear-gradient(165deg, #ffd6e0 0%, #ffb3c1 100%)', border: '#f0889a', text: '#5a1a28', flat: '#ffb3c1' },
  blue:   { bg: 'linear-gradient(165deg, #d6eaff 0%, #b3d4ff 100%)', border: '#6aadee', text: '#1a3a5a', flat: '#b3d4ff' },
  green:  { bg: 'linear-gradient(165deg, #c9f4db 0%, #9be3bc 100%)', border: '#6ab78f', text: '#15442e', flat: '#9be3bc' },
} as const;

export const KeywordNode = memo(function KeywordNode({
  data,
  selected,
  id,
}: NodeProps<SnippetNodeType>) {
  const { updateNodeData } = useReactFlow();
  const [editText, setEditText] = useState(data.label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const palette = STICKY_PALETTE[data.color ?? 'yellow'];

  // When editing mode activates, sync text and focus
  useEffect(() => {
    if (data.editing) {
      setEditText(data.label);
      // Use setTimeout so the textarea is guaranteed to be in the DOM
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 30);
    }
  }, [data.editing, data.label]);

  const commitEdit = () => {
    const trimmed = editText.trim() || data.label || 'Nieuw idee';
    updateNodeData(id, { label: trimmed, editing: false });
  };

  const startEdit = () => {
    setEditText(data.label);
    updateNodeData(id, { editing: true });
  };

  return (
    <div
      className={`snippet-card${selected ? ' selected' : ''}${data.editing ? ' editing nodrag nowheel' : ''}`}
      style={{ background: palette.bg, borderColor: palette.border, color: palette.text }}
      onDoubleClick={data.editing ? undefined : startEdit}
    >
      {/* Connection handles — visible on hover via CSS */}
      <Handle type="target" position={Position.Left}  className="snippet-handle" />
      <Handle type="source" position={Position.Right} className="snippet-handle" />
      <Handle type="target" position={Position.Top}   className="snippet-handle" />
      <Handle type="source" position={Position.Bottom} className="snippet-handle" />

      {data.editing ? (
        <textarea
          ref={textareaRef}
          className="snippet-edit-input nodrag nowheel"
          value={editText}
          style={{ color: palette.text }}
          onChange={e => setEditText(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); }
            e.stopPropagation(); // prevent ReactFlow key shortcuts while typing
          }}
        />
      ) : (
        <p>{data.label || <em>Dubbelklik om te bewerken</em>}</p>
      )}
    </div>
  );
});

