/**
 * TechStackResults — New-style detailed results component
 * Displays comparison table per component with Best-of summary cards
 */
export default function TechStackResults({ comparison, discovery }) {
  if (!comparison) return null;

  const { components, best_mvp, best_scale, best_budget, explanations } = comparison;

  return (
    <div className="space-y-6">
      {/* Best-of labels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Best for MVP", value: best_mvp, color: "#22a04e" },
          { label: "Best for Scale", value: best_scale, color: "#3b82f6" },
          { label: "Best for Budget", value: best_budget, color: "#eab308" },
        ].map(({ label, value, color }) => (
          <div key={label} className="saas-card-inner" style={{ padding: "0.875rem", borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color, marginBottom: "0.35rem" }}>
              {label}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--theme-text-main)", lineHeight: 1.5, fontWeight: 600 }}>
              {value || "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Discovery source info */}
      {discovery && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge-source">
            Source: {discovery.retrieval_source}
          </span>
          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--theme-text-muted)",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 500,
            }}
          >
            {(discovery.confidence_score * 100).toFixed(1)}% confidence
          </span>
        </div>
      )}

      {/* Comparison table per component */}
      {Object.entries(components).map(([key, comp]) => (
        <div key={key} style={{ marginBottom: "1.5rem" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: "0.75rem" }}>
            <h4
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--theme-accent)",
              }}
            >
              {comp.name}
            </h4>
          </div>

          <div
            style={{
              overflowX: "auto",
              borderRadius: "12px",
              border: "1px solid var(--theme-border)",
              backgroundColor: "var(--theme-bg-card-inner)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--theme-border)", backgroundColor: "var(--theme-bg-highlight)" }}>
                  {["Technology", "Pros", "Cons", "Complexity", "Est. Cost", "License"].map((h) => (
                    <th key={h} style={{
                      textAlign: "left",
                      padding: "0.625rem 0.75rem",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--theme-text-muted)",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(comp.options || []).map((opt) => (
                  <tr key={opt.name} style={{ borderBottom: "1px solid var(--theme-border)" }}>
                    <td style={{ padding: "0.625rem 0.75rem", fontWeight: 600, color: "var(--theme-text-main)", whiteSpace: "nowrap" }}>
                      {opt.name}
                    </td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "var(--theme-text-muted)", fontSize: "0.8rem" }}>
                      {(opt.pros || []).join(", ")}
                    </td>
                    <td style={{ padding: "0.625rem 0.75rem", color: "var(--theme-text-muted)", fontSize: "0.8rem" }}>
                      {(opt.cons || []).join(", ")}
                    </td>
                    <td style={{ padding: "0.625rem 0.75rem" }}>
                      <ComplexityBadge value={opt.complexity} />
                    </td>
                    <td style={{ padding: "0.625rem 0.75rem", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", color: "var(--theme-text-muted)" }}>
                      {opt.monthly_estimate_range}
                    </td>
                    <td style={{ padding: "0.625rem 0.75rem", fontSize: "0.78rem", color: "var(--theme-text-muted)" }}>
                      {opt.license}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Explanation */}
          {explanations?.[key] && (
            <p style={{
              marginTop: "0.5rem",
              padding: "0.75rem",
              background: "var(--theme-bg-card-inner)",
              borderRadius: "10px",
              fontSize: "0.82rem",
              lineHeight: 1.7,
              color: "var(--theme-text-muted)",
              borderLeft: "3px solid var(--theme-accent)",
            }}>
              {explanations[key]}
            </p>
          )}
        </div>
      ))}
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
        padding: "0.15rem 0.5rem",
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
