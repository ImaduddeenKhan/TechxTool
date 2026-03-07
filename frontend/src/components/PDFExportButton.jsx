import LoadingSpinner from "./LoadingSpinner.jsx";
import api from "../api/client.js";
import { useState } from "react";

/**
 * Button that calls /api/export-pdf and triggers a file download.
 */
export default function PDFExportButton({ comparisonResult, projectId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    if (!comparisonResult) return;
    setLoading(true);
    setError(null);

    try {
      const resp = await api.post(
        "/api/export-pdf",
        { result: comparisonResult, project_id: projectId || null },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "tech_stack_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleExport}
          disabled={loading || !comparisonResult}
          className="btn-primary"
          style={{ fontSize: "0.9rem", padding: "0.7rem 1.5rem" }}
        >
          {loading ? (
            <>
              <svg width="16" height="16" style={{ animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Exporting…
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="18" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <polyline points="9 15 12 18 15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export Report as PDF
            </>
          )}
        </button>

        {loading && <LoadingSpinner text="Generating PDF report…" />}
      </div>

      {error && (
        <p style={{ fontSize: "0.82rem", color: "var(--theme-warning-text)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
