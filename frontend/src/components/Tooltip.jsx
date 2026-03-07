import { useState } from "react";

/**
 * Tooltip — hover to show hint text.
 */
export default function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            whiteSpace: "nowrap",
            maxWidth: "280px",
            whiteSpaceCollapse: "initial",
            wordWrap: "normal",
            borderRadius: "8px",
            border: "1px solid var(--theme-border)",
            backgroundColor: "var(--theme-bg-card)",
            padding: "0.45rem 0.75rem",
            fontSize: "0.78rem",
            fontWeight: 500,
            color: "var(--theme-text-muted)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            lineHeight: 1.5,
            pointerEvents: "none",
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
