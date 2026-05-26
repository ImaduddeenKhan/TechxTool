import { useState } from "react";
import api from "../api/client.js";

export default function ExportButtons({ comparison, diagrams, prompts, mode }) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingDocx, setLoadingDocx] = useState(false);

  const handleExport = async (format) => {
    const setLoading = format === "pdf" ? setLoadingPdf : setLoadingDocx;
    setLoading(true);

    try {
      const { data } = await api.post(`/api/export/${format}`, {
        result: comparison,
        diagrams: diagrams || null,
        prompts: prompts || null,
        mode,
      }, {
        responseType: "blob",
      });

      /* Create download link */
      const blob = new Blob([data], {
        type: format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `preclaw-blueprint.${format}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`${format.toUpperCase()} export failed:`, err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between flex-wrap" style={{ gap: "0.75rem" }}>
      <div>
        <h4
          style={{
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "var(--theme-text-main)",
            fontFamily: "'Manrope', 'Inter', sans-serif",
            marginBottom: "0.25rem",
          }}
        >
          Export Your Blueprint
        </h4>
        <p style={{ fontSize: "0.8rem", color: "var(--theme-text-muted)" }}>
          Download your complete project plan with all results.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleExport("pdf")}
          disabled={loadingPdf}
          className="btn-primary"
          style={{ fontSize: "0.85rem", padding: "0.625rem 1.25rem" }}
        >
          {loadingPdf ? (
            <><span className="spinner" style={{ width: "14px", height: "14px" }} /> Exporting…</>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              PDF
            </>
          )}
        </button>

        <button
          onClick={() => handleExport("docx")}
          disabled={loadingDocx}
          className="btn-secondary"
          style={{ fontSize: "0.85rem", padding: "0.625rem 1.25rem" }}
        >
          {loadingDocx ? (
            <><span className="spinner" style={{ width: "14px", height: "14px" }} /> Exporting…</>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              DOCX
            </>
          )}
        </button>
      </div>
    </div>
  );
}
