import { MODES, MODE_CONFIG, AI_PLATFORMS } from "../lib/constants.js";

export default function ModeSelector({ onSelect }) {
  const modes = [
    {
      id: MODES.TECH_STACK,
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: MODES.FULL_FLOW,
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {modes.map(({ id, icon }) => {
        const config = MODE_CONFIG[id];

        return (
          <button
            key={id}
            className="saas-card saas-card-hover mode-card"
            onClick={() => onSelect(id)}
            style={{
              textAlign: "left",
              cursor: "pointer",
              border: "1px solid var(--theme-border)",
            }}
          >
            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="mode-icon">{icon}</div>
              <div className="flex items-center gap-2" style={{ marginBottom: "0.75rem" }}>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "var(--theme-text-main)",
                    fontFamily: "'Manrope', 'Inter', sans-serif",
                    letterSpacing: "-0.015em",
                  }}
                >
                  {config.title}
                </h3>
                <span className="badge" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem" }}>
                  {config.creditCost} {config.creditCost === 1 ? "credit" : "credits"}
                </span>
              </div>
              <p style={{ fontSize: "0.875rem", color: "var(--theme-text-muted)", lineHeight: 1.6, marginBottom: id === MODES.FULL_FLOW ? "1.25rem" : 0 }}>
                {config.description}
              </p>

              {/* Platform logos for full flow */}
              {id === MODES.FULL_FLOW && (
                <div style={{ marginTop: "1rem", borderTop: "1px solid var(--theme-border)", paddingTop: "1rem" }}>
                  <p style={{ fontSize: "0.72rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--theme-text-muted)", fontWeight: 600 }}>
                    Compatible with
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AI_PLATFORMS.map((p) => (
                      <span
                        key={p.slug}
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: "var(--theme-text-muted)",
                          background: "var(--theme-bg-card-inner)",
                          border: "1px solid var(--theme-border)",
                          borderRadius: "6px",
                          padding: "0.2rem 0.45rem",
                        }}
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
