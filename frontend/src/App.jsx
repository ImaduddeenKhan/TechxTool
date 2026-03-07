import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import { useState, useEffect } from "react";

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      return true;
    }
    return false;
  });

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [darkMode]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--theme-bg-app)" }}>
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: scrolled
            ? "1px solid var(--theme-border-on-dark)"
            : "1px solid transparent",
          backgroundColor: scrolled
            ? "var(--nav-scrolled-bg)"
            : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          transition: "background-color 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease",
        }}
        className="dark:border-b dark:bg-black/80"
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto" }}
          className="flex items-center justify-between px-6 py-4"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "var(--theme-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(227, 107, 58, 0.4)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "var(--theme-text-on-dark)",
                  letterSpacing: "-0.02em",
                }}
              >
                StackAI
              </span>
              <span
                style={{
                  borderRadius: "99px",
                  padding: "0.15rem 0.55rem",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  backgroundColor: "var(--theme-accent-light)",
                  color: "var(--theme-accent)",
                  border: "1px solid rgba(227, 107, 58, 0.3)",
                }}
              >
                Beta
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                borderRadius: "8px",
                border: "1.5px solid var(--theme-border-on-dark)",
                backgroundColor: "transparent",
                color: "var(--theme-text-on-dark-muted)",
                padding: "0.4rem 0.75rem",
                fontSize: "0.8rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "border-color 0.2s, color 0.2s",
                fontFamily: "var(--font-sans)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--theme-accent)";
                e.currentTarget.style.color = "var(--theme-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--theme-border-on-dark)";
                e.currentTarget.style.color = "var(--theme-text-on-dark-muted)";
              }}
            >
              {darkMode ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {darkMode ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Page Content ─────────────────────────────────────────────────── */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--theme-border-on-dark)",
          padding: "2rem 1.5rem",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto" }}
          className="flex flex-col items-center justify-between gap-3 sm:flex-row"
        >
          <div className="flex items-center gap-2">
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "6px",
                backgroundColor: "var(--theme-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ color: "var(--theme-text-on-dark-muted)", fontSize: "0.8rem" }}>
              StackAI — AI-powered tech stack recommendations
            </span>
          </div>
          <span style={{ color: "var(--theme-text-on-dark-muted)", fontSize: "0.75rem" }}>
            Built with FastAPI + React + Exa AI
          </span>
        </div>
      </footer>
    </div>
  );
}
