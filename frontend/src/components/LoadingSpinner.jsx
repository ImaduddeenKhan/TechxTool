/**
 * Reusable loading spinner with pulsing animation.
 */
export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="flex items-center gap-3">
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          border: "2.5px solid var(--theme-accent-light)",
          borderTopColor: "var(--theme-accent)",
          animation: "spin 0.8s linear infinite",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: "0.875rem",
          color: "var(--theme-text-on-dark-muted)",
          fontWeight: 500,
        }}
      >
        {text}
      </span>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
