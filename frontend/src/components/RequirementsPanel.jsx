/**
 * Displays parsed requirements and the generated search queries.
 */
export default function RequirementsPanel({ requirements }) {
  if (!requirements) return null;

  return (
    <div
      className="saas-card"
      style={{ padding: "1.75rem" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="card-title">Parsed Requirements</h3>
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--theme-accent)",
            backgroundColor: "var(--theme-accent-light)",
            border: "1px solid rgba(227,107,58,0.25)",
            padding: "0.2rem 0.65rem",
            borderRadius: "99px",
          }}
        >
          Ready
        </span>
      </div>

      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0.6rem 2rem",
          fontSize: "0.875rem",
        }}
      >
        {[
          { label: "Project Type", value: requirements.project_type },
          { label: "Scale", value: requirements.scale, capitalize: true },
          { label: "Pricing Model", value: requirements.pricing_model, capitalize: true },
          { label: "Language", value: requirements.preferred_language || "—" },
          { label: "Platforms", value: requirements.platform_type?.join(", ") || "—" },
        ].map(({ label, value, capitalize }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--theme-text-muted)" }}>
              {label}
            </dt>
            <dd style={{ fontWeight: 500, color: "var(--theme-text-main)", textTransform: capitalize ? "capitalize" : undefined }}>
              {value}
            </dd>
          </div>
        ))}

        {/* Pinned techs spans full width */}
        {requirements.pinned_techs?.length > 0 && (
          <div className="col-span-2 flex flex-col gap-1.5">
            <dt style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--theme-text-muted)" }}>
              Pinned Technologies
            </dt>
            <dd className="flex flex-wrap gap-1.5">
              {requirements.pinned_techs.map((t) => (
                <span
                  key={t}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: "8px",
                    padding: "0.2rem 0.6rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: "var(--theme-accent)",
                    color: "white",
                    letterSpacing: "0.01em",
                  }}
                >
                  {t}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>

      {requirements.notes && (
        <div
          style={{
            marginTop: "1.25rem",
            borderLeft: "3px solid var(--theme-accent)",
            paddingLeft: "0.875rem",
            fontSize: "0.875rem",
            fontStyle: "italic",
            color: "var(--theme-text-muted)",
            lineHeight: 1.6,
          }}
        >
          {requirements.notes}
        </div>
      )}

      {/* Generated search queries */}
      {requirements.search_queries?.length > 0 && (
        <div
          style={{
            marginTop: "1.5rem",
            borderTop: "1px solid var(--theme-border)",
            paddingTop: "1.25rem",
          }}
        >
          <h4
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--theme-text-muted)",
              marginBottom: "0.75rem",
            }}
          >
            Generated Search Queries
          </h4>
          <ol className="space-y-1.5">
            {requirements.search_queries.map((q, i) => (
              <li
                key={i}
                style={{
                  fontSize: "0.85rem",
                  color: "var(--theme-text-muted)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.6rem",
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    minWidth: "1.4rem",
                    height: "1.4rem",
                    borderRadius: "50%",
                    backgroundColor: "var(--theme-bg-card-inner)",
                    border: "1px solid var(--theme-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "var(--theme-accent)",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" }}>{q}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
