import { useState } from "react";

const RECOVERY_PROMPT = `I encountered an error while building this project. Below is the error message. Please analyze it carefully, identify the root cause, and provide the exact fix.

Important instructions:
- Do NOT restart or regenerate the entire project.
- Only fix the specific error while keeping everything else intact.
- Show me the exact file(s) to modify and the exact code changes needed.
- If the error is caused by a missing dependency, tell me the exact install command.
- If it is a configuration issue, show me the exact config change.
- Explain why the error occurred in 1-2 sentences.

Error:
[PASTE YOUR ERROR HERE]

Context: This project was built following a phased development approach. The error occurred during implementation. Please provide a surgical fix.`;

export default function ErrorRecoveryPrompt() {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(RECOVERY_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="saas-card" style={{ padding: "1.25rem" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between"
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--theme-text-main)",
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.875rem",
          fontWeight: 600,
          padding: 0,
        }}
      >
        <span className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="var(--theme-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="var(--theme-accent)" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="var(--theme-accent)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Getting errors? Don't worry — use this helper prompt
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease" }}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {expanded && (
        <div style={{ marginTop: "1rem" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--theme-text-muted)", marginBottom: "0.75rem", lineHeight: 1.7 }}>
            If you run into an error while the AI is building your project, just copy the text below,
            replace <strong>[PASTE YOUR ERROR HERE]</strong> with the error message you see, and send it
            to the same AI tool. It will fix the problem without starting over.
          </p>
          <div className="prompt-block" style={{ maxHeight: "300px" }}>
            <button
              className={`copy-btn${copied ? " copied" : ""}`}
              onClick={handleCopy}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
            {RECOVERY_PROMPT}
          </div>
        </div>
      )}
    </div>
  );
}
