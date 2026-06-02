// Sidebar panel showing AI-generated brainstorm prompts as read-only chips.
// Shows at most 3 questions; no tagline.

interface BrainstormChatPanelProps {
  helpers: string[];
  disabled: boolean;
}

export function BrainstormChatPanel({
  helpers,
  disabled,
}: BrainstormChatPanelProps) {
  return (
    <div className="bcp">
      <div className="bcp-header">
        <div className="bcp-header-row">
          <span className="bcp-icon">💡</span>
          <h3 className="bcp-title">Denktips</h3>
        </div>
      </div>

      <div className="bcp-body">
        <div className="bcp-helpers">
          {helpers.length === 0 ? (
            <p className="bcp-empty">
              Vertel je idee via de microfoon. Dan verschijnen hier prikkelende denkvragen.
            </p>
          ) : (
            helpers.slice(0, 3).map((q) => (
              <div key={q} className="helper-chip helper-chip--read" aria-disabled={disabled}>
                {q}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
