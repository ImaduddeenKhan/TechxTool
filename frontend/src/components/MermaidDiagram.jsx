import { useState, useEffect, useRef } from "react";

export default function MermaidDiagram({ diagrams }) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);

  const tabs = [];
  if (diagrams?.er_diagram) tabs.push({ label: "Database Schema", code: diagrams.er_diagram });
  if (diagrams?.flow_diagram) tabs.push({ label: "Application Flow", code: diagrams.flow_diagram });
  if (diagrams?.architecture_diagram) tabs.push({ label: "System Architecture", code: diagrams.architecture_diagram });

  /* Render mermaid diagram */
  useEffect(() => {
    if (tabs.length === 0 || !containerRef.current) return;

    const renderDiagram = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#E36B3A",
            primaryTextColor: "#E9DFD4",
            primaryBorderColor: "#E36B3A",
            lineColor: "#405050",
            secondaryColor: "#0A2424",
            tertiaryColor: "#0F2E2E",
            background: "#0F2E2E",
            mainBkg: "#0A2424",
            nodeBorder: "#E36B3A",
            clusterBkg: "#0A2424",
            titleColor: "#E9DFD4",
            edgeLabelBackground: "#0A2424",
            fontSize: "14px",
          },
          flowchart: { curve: "basis", padding: 20 },
          er: { layoutDirection: "TB", fontSize: 12 },
        });

        const code = tabs[activeTab]?.code;
        if (!code) return;

        const id = `mermaid-${activeTab}-${Date.now()}`;
        containerRef.current.innerHTML = "";

        const { svg } = await mermaid.render(id, code);
        containerRef.current.innerHTML = svg;
      } catch (err) {
        console.error("Mermaid render error:", err);
        containerRef.current.innerHTML = `<pre style="color: var(--theme-text-muted); font-size: 0.82rem; white-space: pre-wrap;">${tabs[activeTab]?.code || "Diagram rendering failed."}</pre>`;
      }
    };

    renderDiagram();
  }, [activeTab, diagrams]);

  const handleCopy = async () => {
    const code = tabs[activeTab]?.code;
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (tabs.length === 0) {
    return (
      <div className="saas-card" style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--theme-text-muted)" }}>No diagrams were generated for this project.</p>
      </div>
    );
  }

  return (
    <div className="diagram-container">
      {/* Tabs */}
      <div className="flex items-center justify-between flex-wrap" style={{ gap: "0.5rem" }}>
        <div className="diagram-tabs" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 0 }}>
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              className={`diagram-tab${activeTab === i ? " active" : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className={`copy-btn${copied ? " copied" : ""}`}
          style={{ position: "static" }}
        >
          {copied ? "✓ Copied" : "Copy Code"}
        </button>
      </div>

      {/* Diagram render area */}
      <div
        ref={containerRef}
        style={{
          marginTop: "1rem",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="spinner" />
      </div>
    </div>
  );
}
