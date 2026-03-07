import { useState, useEffect, useRef } from "react";
import api from "../api/client.js";
import InputForm from "../components/InputForm.jsx";
import RequirementsPanel from "../components/RequirementsPanel.jsx";
import ResultsTable from "../components/ResultsTable.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import PDFExportButton from "../components/PDFExportButton.jsx";

// Hero image – Vite resolves this static asset at build time
const heroImg = new URL("../../HERO IMAGE !.png", import.meta.url).href;

/* ─── Scroll-animation hook ─────────────────────────────────────────────── */
function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    const targets = document.querySelectorAll("[data-animate]");
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─── How It Works data ─────────────────────────────────────────────────── */
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Describe Your Project",
    desc: "Tell us what you're building — project type, scale, budget, platforms, and any preferred languages or pinned technologies.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "AI Discovery",
    desc: "Our engine searches a curated knowledge base and Exa AI's real-time index to find the most relevant technologies for your exact requirements.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Get Your Stack",
    desc: "Receive a tailored comparison table with pros, cons, complexity ratings, cost estimates, and detailed architecture explanations — export to PDF anytime.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function HomePage() {
  const [requirements, setRequirements] = useState(null);
  const [discovery, setDiscovery] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState({ parse: false, discover: false, generate: false });
  const [error, setError] = useState(null);

  const formSectionRef = useRef(null);

  useScrollAnimation();

  /* ── Step 1: Parse ─────────────────────────────────────────── */
  const handleParse = async (formData) => {
    setError(null);
    setRequirements(null);
    setDiscovery(null);
    setComparison(null);
    setLoading((l) => ({ ...l, parse: true }));
    try {
      const { data } = await api.post("/api/parse", formData);
      setRequirements(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((l) => ({ ...l, parse: false }));
    }
  };

  /* ── Step 2: Discover ──────────────────────────────────────── */
  const handleDiscover = async () => {
    if (!requirements) return;
    setError(null);
    setDiscovery(null);
    setComparison(null);
    setLoading((l) => ({ ...l, discover: true }));
    try {
      const { data } = await api.post("/api/discover", requirements);
      setDiscovery(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((l) => ({ ...l, discover: false }));
    }
  };

  /* ── Step 3: Generate ──────────────────────────────────────── */
  const handleGenerate = async () => {
    if (!requirements || !discovery) return;
    setError(null);
    setComparison(null);
    setLoading((l) => ({ ...l, generate: true }));
    try {
      const { data } = await api.post("/api/generate", { ...requirements, discovery });
      setComparison(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((l) => ({ ...l, generate: false }));
    }
  };

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {/* ══════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          paddingTop: "5rem",
          paddingBottom: "5rem",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Decorative glows */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "5%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(227,107,58,0.14) 0%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "10%",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(233,223,212,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(50px)",
          }}
        />

        <div
          style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "0 1.5rem" }}
          className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center"
        >
          {/* Left — Text content */}
          <div className="space-y-7" data-animate="fade-left">
            <div className="flex items-center gap-3">
              <span className="badge-dark">AI-Powered</span>
              <span className="badge-dark">Free to Use</span>
            </div>

            <h1 className="hero-heading">
              Find the Perfect
              <br />
              <span className="gradient-text">Tech Stack</span>
              <br />
              for Your Project
            </h1>

            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: 1.7,
                color: "var(--theme-text-on-dark-muted)",
                maxWidth: "480px",
              }}
            >
              Describe your project in plain English. Our AI searches a curated knowledge base and real-time tech sources to recommend the optimal stack — tailored to your scale, budget, and goals.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button className="btn-primary" style={{ fontSize: "1rem", padding: "0.875rem 2rem" }} onClick={scrollToForm}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Generate My Stack
              </button>
              <button
                className="btn-secondary"
                style={{ fontSize: "1rem", padding: "0.875rem 2rem" }}
                onClick={scrollToForm}
              >
                View Example
              </button>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8 pt-2">
              {[
                { value: "50+", label: "Project Types" },
                { value: "3-step", label: "AI Workflow" },
                { value: "PDF", label: "Export Ready" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="stat-value" style={{ fontSize: "1.5rem" }}>{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Hero image */}
          <div
            data-animate="fade-right"
            data-delay="200"
            style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
          >
            <div
              style={{
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)",
                border: "1px solid rgba(233,223,212,0.15)",
                maxWidth: "520px",
                width: "100%",
                background: "var(--theme-bg-card)",
              }}
            >
              <img
                src={heroImg}
                alt="StackAI — Tech Stack Recommender"
                style={{ width: "100%", height: "auto", display: "block" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement.style.height = "360px";
                  e.currentTarget.parentElement.style.display = "flex";
                  e.currentTarget.parentElement.style.alignItems = "center";
                  e.currentTarget.parentElement.style.justifyContent = "center";
                  e.currentTarget.parentElement.innerHTML =
                    '<span style="color:var(--theme-text-muted);font-size:0.875rem;">Hero Image</span>';
                }}
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.4rem",
            opacity: 0.45,
          }}
        >
          <span style={{ fontSize: "0.7rem", color: "var(--theme-text-on-dark)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Scroll
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: "var(--theme-text-on-dark)" }}>
            <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "5rem 1.5rem",
          borderTop: "1px solid var(--theme-border-on-dark)",
          borderBottom: "1px solid var(--theme-border-on-dark)",
          background: "var(--theme-bg-section-alt)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="text-center mb-12 space-y-3" data-animate>
            <span className="badge">How It Works</span>
            <h2 className="section-heading-on-dark" style={{ marginTop: "0.75rem" }}>
              Three steps from idea to stack
            </h2>
            <p style={{ color: "var(--theme-text-on-dark-muted)", maxWidth: "480px", margin: "0 auto", fontSize: "1rem", lineHeight: 1.7 }}>
              No expertise required — just describe what you're building.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, desc, icon }, i) => (
              <div
                key={step}
                className="saas-card saas-card-hover"
                data-animate
                data-delay={String((i + 1) * 150)}
                style={{ padding: "1.75rem" }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="step-number">{step}</div>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: "var(--theme-bg-highlight)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--theme-accent)",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                </div>
                <h3 className="card-title mb-2">{title}</h3>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--theme-text-muted)" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FORM SECTION
      ══════════════════════════════════════════════════════════ */}
      <section
        ref={formSectionRef}
        style={{ padding: "5rem 1.5rem" }}
        id="form-section"
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Section header */}
          <div className="mb-8 space-y-2" data-animate>
            <span className="badge">Step 1</span>
            <h2 className="section-heading-on-dark" style={{ marginTop: "0.6rem" }}>
              Describe Your Project
            </h2>
            <p style={{ color: "var(--theme-text-on-dark-muted)", fontSize: "1rem", lineHeight: 1.6 }}>
              Be as detailed as possible — the more context you provide, the more tailored your recommendations will be.
            </p>
          </div>

          {/* Form card */}
          <div className="saas-card" data-animate data-delay="100" style={{ padding: "2.5rem" }}>
            <InputForm onSubmit={handleParse} isLoading={loading.parse} />
            {loading.parse && (
              <div style={{ marginTop: "1.5rem" }}>
                <LoadingSpinner text="Analyzing your requirements with AI..." />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Error ─────────────────────────────────────────────── */}
      {error && (
        <div style={{ padding: "0 1.5rem", maxWidth: "900px", margin: "0 auto 2rem" }}>
          <div
            style={{
              borderRadius: "12px",
              padding: "1rem 1.25rem",
              backgroundColor: "rgba(227,107,58,0.1)",
              border: "1px solid rgba(227,107,58,0.3)",
              color: "var(--theme-accent)",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span><strong>Error:</strong> {error}</span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          STEP 2 — PARSED REQUIREMENTS
      ══════════════════════════════════════════════════════════ */}
      {requirements && (
        <section style={{ padding: "0 1.5rem 4rem", maxWidth: "900px", margin: "0 auto" }}>
          <div data-animate>
            <div className="flex items-center gap-3 mb-6">
              <span className="badge">Step 2</span>
              <span style={{ color: "var(--theme-text-on-dark-muted)", fontSize: "0.9rem" }}>Requirements parsed successfully</span>
            </div>

            <RequirementsPanel requirements={requirements} />

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleDiscover}
                disabled={loading.discover}
                className="btn-primary"
                style={{ fontSize: "1rem", padding: "0.875rem 2rem" }}
              >
                {loading.discover ? (
                  <>
                    <svg width="16" height="16" className="animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Discovering...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Run AI Discovery
                  </>
                )}
              </button>
              {loading.discover && <LoadingSpinner text="Searching knowledge base and Exa AI..." />}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          STEP 3 — DISCOVERY RESULTS
      ══════════════════════════════════════════════════════════ */}
      {discovery && (
        <section style={{ padding: "0 1.5rem 4rem", maxWidth: "900px", margin: "0 auto" }}>
          <div data-animate>
            <div className="flex items-center gap-3 mb-6">
              <span className="badge">Step 3</span>
              <span style={{ color: "var(--theme-text-on-dark-muted)", fontSize: "0.9rem" }}>AI discovery complete</span>
            </div>

            {/* Discovery summary card */}
            <div className="saas-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title">Discovery Results</h3>
                <div className="flex items-center gap-3">
                  <span className="badge-source">{discovery.retrieval_source}</span>
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
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Object.entries(discovery.candidates || {}).map(([cat, items]) => (
                  <div key={cat} className="saas-card-inner" style={{ padding: "0.875rem 1rem" }}>
                    <h4
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--theme-accent)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {cat}
                    </h4>
                    <ul className="space-y-1">
                      {items.slice(0, 3).map((c, i) => (
                        <li key={i} style={{ fontSize: "0.82rem", color: "var(--theme-text-muted)" }}>
                          <strong style={{ color: "var(--theme-text-main)", fontWeight: 600 }}>{c.name}</strong>
                          {c.snippet && (
                            <span> — {c.snippet.slice(0, 70)}…</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerate}
                disabled={loading.generate}
                className="btn-primary"
                style={{ fontSize: "1rem", padding: "0.875rem 2rem" }}
              >
                {loading.generate ? (
                  <>
                    <svg width="16" height="16" className="animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Generate Comparison
                  </>
                )}
              </button>
              {loading.generate && <LoadingSpinner text="Building your tech stack comparison..." />}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          COMPARISON RESULTS
      ══════════════════════════════════════════════════════════ */}
      {comparison && (
        <section style={{ padding: "0 1.5rem 6rem", maxWidth: "900px", margin: "0 auto" }}>
          <div data-animate>
            <div className="flex items-center gap-3 mb-6">
              <span className="badge">Results</span>
              <span style={{ color: "var(--theme-text-on-dark-muted)", fontSize: "0.9rem" }}>Your personalized tech stack recommendations</span>
            </div>

            <div className="saas-card" style={{ padding: "2rem" }}>
              <ResultsTable comparisonResult={comparison} discoveryMeta={discovery} />

              <div
                style={{
                  borderTop: "1px solid var(--theme-border)",
                  marginTop: "1.75rem",
                  paddingTop: "1.5rem",
                }}
              >
                <PDFExportButton comparisonResult={comparison} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          CTA SECTION (shown when no results yet)
      ══════════════════════════════════════════════════════════ */}
      {!requirements && !comparison && (
        <section
          style={{
            padding: "5rem 1.5rem",
            borderTop: "1px solid var(--theme-border-on-dark)",
          }}
          data-animate
        >
          <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }} className="space-y-5">
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "16px",
                backgroundColor: "var(--theme-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                boxShadow: "0 8px 24px rgba(227,107,58,0.4)",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="section-heading-on-dark">
              Ready to find your stack?
            </h2>
            <p style={{ color: "var(--theme-text-on-dark-muted)", fontSize: "1.05rem", lineHeight: 1.7 }}>
              Join developers who use StackAI to make confident technology decisions — faster.
            </p>
            <button
              className="btn-primary"
              style={{ fontSize: "1rem", padding: "0.9rem 2.25rem" }}
              onClick={scrollToForm}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Start for Free
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
