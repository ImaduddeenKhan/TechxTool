import { useState } from "react";

export default function ResultsTable({ comparisonResult, discoveryMeta }) {
  const [showExplanations, setShowExplanations] = useState(false);

  if (!comparisonResult) return null;

  const { components, best_mvp, best_scale, best_budget, explanations } = comparisonResult;

  return (
    <div className="space-y-6">
      {/* ── Header row ──────────────────────────────────────── */}
      {discoveryMeta && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge-source">
            Source: {discoveryMeta.retrieval_source}
          </span>
          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--theme-text-muted)",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 500,
            }}
          >
            {(discoveryMeta.confidence_score * 100).toFixed(1)}% confidence
          </span>
        </div>
      )}

      {/* ── Summary highlight cards ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SummaryCard
          label="Best MVP"
          value={best_mvp}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          accent
        />
        <SummaryCard
          label="Best for Scale"
          value={best_scale}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="17 6 23 6 23 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <SummaryCard
          label="Best Budget"
          value={best_budget}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      </div>

      {/* ── Comparison table ───────────────────────────────── */}
      <div
        style={{
          overflowX: "auto",
          borderRadius: "12px",
          border: "1px solid var(--theme-border)",
          backgroundColor: "var(--theme-bg-card-inner)",
        }}
      >
        <table style={{ minWidth: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--theme-border)",
                backgroundColor: "var(--theme-bg-highlight)",
              }}
            >
              {["Component", "Options", "Complexity", "Est. Cost / mo"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "0.875rem 1rem",
                    textAlign: "left",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--theme-text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(components).map(([key, comp], idx) => (
              <tr
                key={key}
                style={{
                  borderBottom: "1px solid var(--theme-border)",
                  backgroundColor:
                    idx % 2 === 0
                      ? "transparent"
                      : "rgba(14,31,31,0.02)",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--theme-bg-highlight)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    idx % 2 === 0 ? "transparent" : "rgba(14,31,31,0.02)")
                }
              >
                {/* Component name */}
                <td
                  style={{
                    padding: "0.875rem 1rem",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "var(--theme-text-main)",
                    verticalAlign: "top",
                    whiteSpace: "nowrap",
                  }}
                >
                  {comp.name}
                </td>

                {/* Options */}
                <td style={{ padding: "0.875rem 1rem", verticalAlign: "top" }}>
                  <div className="space-y-3">
                    {comp.options?.map((opt) => (
                      <div key={opt.name}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span style={{ fontWeight: 600, color: "var(--theme-text-main)", fontSize: "0.875rem" }}>
                            {opt.name}
                          </span>
                          {opt.license && (
                            <span
                              style={{
                                borderRadius: "6px",
                                padding: "0.1rem 0.45rem",
                                fontSize: "0.66rem",
                                fontWeight: 600,
                                border: "1px solid var(--theme-border)",
                                color: "var(--theme-text-muted)",
                                letterSpacing: "0.02em",
                              }}
                            >
                              {opt.license}
                            </span>
                          )}
                        </div>
                        {opt.pros?.length > 0 && (
                          <div className="flex items-start gap-1.5 mt-0.5">
                            <span style={{ color: "#22a04e", fontWeight: 700, fontSize: "0.75rem", marginTop: "1px", flexShrink: 0 }}>+</span>
                            <p style={{ fontSize: "0.78rem", color: "var(--theme-text-muted)", lineHeight: 1.5 }}>
                              {opt.pros.slice(0, 2).join(", ")}
                            </p>
                          </div>
                        )}
                        {opt.cons?.length > 0 && (
                          <div className="flex items-start gap-1.5 mt-0.5">
                            <span style={{ color: "var(--theme-accent)", fontWeight: 700, fontSize: "0.75rem", marginTop: "1px", flexShrink: 0 }}>−</span>
                            <p style={{ fontSize: "0.78rem", color: "var(--theme-text-muted)", lineHeight: 1.5 }}>
                              {opt.cons.slice(0, 2).join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </td>

                {/* Complexity */}
                <td style={{ padding: "0.875rem 1rem", verticalAlign: "top" }}>
                  <ComplexityBadge value={comp.options?.[0]?.complexity} />
                </td>

                {/* Cost */}
                <td
                  style={{
                    padding: "0.875rem 1rem",
                    verticalAlign: "top",
                    fontSize: "0.82rem",
                    color: "var(--theme-text-muted)",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {comp.options?.[0]?.monthly_estimate_range || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Explanations toggle ──────────────────────────────── */}
      <div>
        <button
          onClick={() => setShowExplanations((v) => !v)}
          className="btn-ghost"
          style={{ fontSize: "0.875rem" }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            style={{ transition: "transform 0.2s", transform: showExplanations ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {showExplanations ? "Hide" : "Show"} detailed explanations
        </button>
      </div>

      {showExplanations && explanations && (
        <div
          className="saas-card-inner"
          style={{ padding: "1.5rem" }}
        >
          <div className="space-y-5">
            {Object.entries(explanations).map(([cat, text]) => (
              <div key={cat}>
                <h4
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--theme-accent)",
                    marginBottom: "0.4rem",
                  }}
                >
                  {cat}
                </h4>
                <p style={{ fontSize: "0.875rem", color: "var(--theme-text-muted)", lineHeight: 1.7 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon, accent }) {
  return (
    <div
      className="saas-card-inner"
      style={{
        padding: "1rem 1.125rem",
        borderLeft: accent ? "3px solid var(--theme-accent)" : "3px solid var(--theme-border)",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color: accent ? "var(--theme-accent)" : "var(--theme-text-muted)" }}>
          {icon}
        </span>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--theme-text-muted)",
          }}
        >
          {label}
        </span>
      </div>
      <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--theme-text-main)" }}>
        {value || "—"}
      </p>
    </div>
  );
}

function ComplexityBadge({ value }) {
  if (!value) return <span style={{ color: "var(--theme-text-muted)", fontSize: "0.78rem" }}>—</span>;

  const level = value.toLowerCase();
  const colors = {
    low: { bg: "rgba(34,160,78,0.1)", text: "#22a04e", border: "rgba(34,160,78,0.25)" },
    medium: { bg: "rgba(227,107,58,0.1)", text: "var(--theme-accent)", border: "rgba(227,107,58,0.25)" },
    high: { bg: "rgba(220,38,38,0.08)", text: "#dc2626", border: "rgba(220,38,38,0.2)" },
  };

  const c = colors[level] || colors.medium;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "99px",
        padding: "0.18rem 0.6rem",
        fontSize: "0.72rem",
        fontWeight: 700,
        textTransform: "capitalize",
        letterSpacing: "0.03em",
        backgroundColor: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
      }}
    >
      {value}
    </span>
  );
}
