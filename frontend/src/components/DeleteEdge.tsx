// Custom bezier-curve edge with a visible × delete button when selected.

import {
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react';

export function DeleteEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  selected,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{ stroke: selected ? '#2563eb' : '#94a3b8', strokeWidth: 2 }}
      />
      {selected && (
        <EdgeLabelRenderer>
          <button
            className="edge-delete-btn"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setEdges(eds => eds.filter(edge => edge.id !== id));
            }}
          >
            ×
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
