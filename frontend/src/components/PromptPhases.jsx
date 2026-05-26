import { useState } from "react";

export default function PromptPhases({ prompts }) {
  const [activePhase, setActivePhase] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(-1);

  const phases = prompts?.phases || [];

  const handleCopy = async (text, index) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(-1), 2000);
  };

  if (phases.length === 0) {
    return (
      <div className="saas-card" style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--theme-text-muted)" }}>No prompts were generated.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Non-technical friendly intro */}
      <div
        className="saas-card-inner"
        style={{
          padding: "1rem 1.25rem",
          borderLeft: "3px solid var(--theme-accent)",
          backgroundColor: "var(--theme-accent-light)",
          marginBottom: "1rem",
        }}
      >
        <p style={{ fontSize: "0.85rem", color: "var(--theme-text-main)", lineHeight: 1.7 }}>
          <strong>How to use:</strong> Copy each instruction below in order and paste it into any AI coding tool
          (Claude, Cursor, Bolt.new, Lovable, etc.). The AI will build your project step by step.
          No coding experience needed!
        </p>
      </div>

      {phases.map((phase, i) => (
        <div
          key={i}
          className={`phase-card${activePhase === i ? " active-phase" : ""}`}
          onClick={() => setActivePhase(i)}
          style={{ cursor: "pointer" }}
        >
          <div className="flex items-start gap-3" style={{ marginBottom: "0.75rem" }}>
            <span className="phase-number">{i + 1}</span>
            <div style={{ flex: 1 }}>
              <h4
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--theme-text-main)",
                  fontFamily: "'Manrope', 'Inter', sans-serif",
                  marginBottom: "0.25rem",
                }}
              >
                {phase.title}
              </h4>
              <p style={{ fontSize: "0.8rem", color: "var(--theme-text-muted)", lineHeight: 1.5 }}>
                {phase.description}
              </p>
            </div>
          </div>

          {activePhase === i && (
            <>
              <div className="prompt-block" style={{ marginTop: "0.75rem" }}>
                <button
                  className={`copy-btn${copiedIndex === i ? " copied" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(phase.prompt, i);
                  }}
                >
                  {copiedIndex === i ? "✓ Copied" : "Copy"}
                </button>
                {phase.prompt}
              </div>

              {/* Best used with */}
              {phase.platforms && phase.platforms.length > 0 && (
                <div style={{ marginTop: "0.75rem" }}>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 600,
                      color: "var(--theme-text-muted)",
                      marginRight: "0.5rem",
                    }}
                  >
                    Best used with:
                  </span>
                  {phase.platforms.map((p) => (
                    <span
                      key={p}
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "var(--theme-text-muted)",
                        background: "var(--theme-bg-card-inner)",
                        border: "1px solid var(--theme-border)",
                        borderRadius: "6px",
                        padding: "0.15rem 0.4rem",
                        marginRight: "0.35rem",
                      }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
