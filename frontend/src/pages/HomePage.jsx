import { useState, useEffect, useRef, useCallback } from "react";
import api from "../api/client.js";
import InputForm from "../components/InputForm.jsx";
import RequirementsPanel from "../components/RequirementsPanel.jsx";
import ResultsTable from "../components/ResultsTable.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import PDFExportButton from "../components/PDFExportButton.jsx";
import ModeSelector from "../components/ModeSelector.jsx";
import TechStackResults from "../components/TechStackResults.jsx";
import MermaidDiagram from "../components/MermaidDiagram.jsx";
import PromptPhases from "../components/PromptPhases.jsx";
import ErrorRecoveryPrompt from "../components/ErrorRecoveryPrompt.jsx";
import ExportButtons from "../components/ExportButtons.jsx";
import { SITE_NAME, AI_PLATFORMS, MODES, MODE_CONFIG } from "../lib/constants.js";

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
    title: "AI Generates Everything",
    desc: "Our engine builds your tech stack, creates database schemas, maps application flows, and crafts phased development prompts.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Copy, Build, Ship",
    desc: "Copy your phased prompts into any AI coding assistant. Build your project step by step with confidence. Export everything to PDF or DOCX.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/* ─── Why PreClaw data ──────────────────────────────────────────────────── */
const WHY_PRECLAW = [
  {
    title: "Always Up-to-Date",
    desc: "Even if a new tool or framework launched just this morning, our AI discovers it in real time. You'll never miss the latest and best technology for your project.",
    color: "#22a04e",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Tailored to YOUR Requirements",
    desc: "No generic blog-style recommendations. Our AI analyzes your specific scale, budget, team, and constraints to give you a stack that actually fits your project.",
    color: "#3b82f6",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Save Money & Time",
    desc: "Stop wasting hours researching which technologies to use. Get expert-level recommendations in seconds — not days. Make confident decisions that save thousands in development costs.",
    color: "#eab308",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Non-Technical Friendly",
    desc: "Just describe your idea like you're telling a friend. No coding jargon needed. We give you simple, ready-to-use instructions that any AI tool can understand and build.",
    color: "#E36B3A",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/* ─── Features data ─────────────────────────────────────────────────────── */
const FEATURES = [
  {
    title: "AI-Powered Tech Stacks",
    desc: "Get tailored technology recommendations with pros, cons, cost estimates, and complexity ratings based on your specific project requirements.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Architecture Diagrams",
    desc: "Automatically generated Mermaid diagrams showing your database schema, entity relationships, and full application flow — rendered right in the browser.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: "AI Building Instructions",
    desc: "Your project broken into 3-4 development phases with ready-to-use instructions. Copy them into Claude, Cursor, Bolt, or any AI assistant and start building — no coding experience needed.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Export to PDF & DOCX",
    desc: "Download your complete project blueprint — tech stack, diagrams, and all prompts — as a professional PDF or DOCX document for your team.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

/* ─── FAQ data ──────────────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: "What is a tech stack generator?",
    a: "A tech stack generator analyzes your project requirements and recommends the best combination of technologies — frontend frameworks, backend languages, databases, hosting, and more — tailored to your specific needs, budget, and scale.",
  },
  {
    q: "How do the AI-ready building instructions work?",
    a: "After generating your tech stack, PreClaw creates 3-4 phased building instructions. Each instruction is designed to be copied directly into AI coding assistants like Claude, Cursor, Bolt.new, Lovable, or Replit. Just paste and the AI builds your project step by step — no coding experience required.",
  },
  {
    q: "What AI platforms are the instructions compatible with?",
    a: "PreClaw instructions work with all major AI coding assistants: Claude, Antigravity, Lovable, Bolt.new, Replit, Cursor, Windsurf, v0.dev, GPT Engineer, and GitHub Copilot. They're designed to work with any AI-based coding tool.",
  },
  {
    q: "What are the architecture diagrams?",
    a: "PreClaw generates visual architecture diagrams using Mermaid syntax. These include an Entity-Relationship diagram showing your database schema, and a flowchart showing the complete user journey through your application. The diagrams render directly in your browser.",
  },
  {
    q: "Is PreClaw free to use?",
    a: "Yes! Every user gets 3 free generation credits. Tech stack-only generation costs 1 credit, and the full flow (tech stack + diagrams + instructions) costs 1.5 credits. After that, you can purchase more credits starting at just $2 for 10 credits.",
  },
  {
    q: "What if I get errors when using the instructions?",
    a: "PreClaw includes a built-in error recovery prompt. If you encounter errors while building with the generated instructions, simply copy the error, paste our recovery prompt along with it, and send it back to your AI assistant. It will fix the issue without starting over.",
  },
];

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function HomePage() {
  /* ── Generation state ───────────────────────────── */
  const [mode, setMode] = useState(null);
  const [step, setStep] = useState("hero"); // hero | mode | form | processing | results
  const [requirements, setRequirements] = useState(null);
  const [discovery, setDiscovery] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [diagrams, setDiagrams] = useState(null);
  const [prompts, setPrompts] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState("");

  const formSectionRef = useRef(null);
  const resultsRef = useRef(null);

  useScrollAnimation();

  /* ── Scroll helpers ─────────────────────────────── */
  const scrollToForm = () => {
    setStep("mode");
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  /* ── Mode selection ─────────────────────────────── */
  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    setStep("form");
    setError(null);
  };

  /* ── Full generation pipeline ───────────────────── */
  const handleGenerate = useCallback(async (formData) => {
    setError(null);
    setStep("processing");
    setComparison(null);
    setDiagrams(null);
    setPrompts(null);

    try {
      /* Step 1: Parse */
      setProgress("Analyzing your project requirements...");
      const { data: parsed } = await api.post("/api/parse", formData);
      setRequirements(parsed);

      /* Step 2: Discover */
      setProgress("Searching knowledge base for best technologies...");
      const { data: disc } = await api.post("/api/discover", parsed);
      setDiscovery(disc);

      /* Step 3: Generate comparison */
      setProgress("Building your tech stack comparison...");
      const { data: comp } = await api.post("/api/generate", { ...parsed, discovery: disc });
      setComparison(comp);

      /* Steps 4-5: If full flow, generate diagrams + prompts */
      if (mode === MODES.FULL_FLOW) {
        setProgress("Generating architecture diagrams...");
        try {
          const { data: diag } = await api.post("/api/generate-diagrams", {
            requirements: parsed,
            tech_stack: comp,
          });
          setDiagrams(diag);
        } catch (diagErr) {
          console.error("Diagram generation failed:", diagErr);
          /* Non-fatal — continue without diagrams */
        }

        setProgress("Crafting your AI building instructions...");
        try {
          const { data: prm } = await api.post("/api/generate-prompts", {
            requirements: parsed,
            tech_stack: comp,
          });
          setPrompts(prm);
        } catch (promptErr) {
          console.error("Prompt generation failed:", promptErr);
        }
      }

      setStep("results");
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err) {
      setError(err.message || "Generation failed. Please try again.");
      setStep("form");
    }
  }, [mode]);

  /* ── Reset ──────────────────────────────────────── */
  const handleReset = () => {
    setStep("mode");
    setMode(null);
    setRequirements(null);
    setDiscovery(null);
    setComparison(null);
    setDiagrams(null);
    setPrompts(null);
    setError(null);
    setProgress("");
    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {/* ══════════════════════════════════════════════════════════
          HERO SECTION — UNTOUCHED
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
                { value: "4-Phase", label: "AI Prompts" },
                { value: "PDF/DOCX", label: "Export Ready" },
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
                alt="PreClaw — Tech Stack Recommender"
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
          HOW IT WORKS — UNTOUCHED
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
          WHY PRECLAW — NEW SECTION
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="text-center mb-12 space-y-3" data-animate>
            <span className="badge">Why {SITE_NAME}</span>
            <h2 className="section-heading-on-dark" style={{ marginTop: "0.75rem" }}>
              The smartest way to plan your project
            </h2>
            <p style={{ color: "var(--theme-text-on-dark-muted)", maxWidth: "520px", margin: "0 auto", fontSize: "1rem", lineHeight: 1.7 }}>
              In the era of innovation, new tools launch every day. {SITE_NAME} keeps you ahead of the curve.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {WHY_PRECLAW.map(({ title, desc, color, icon }, i) => (
              <div
                key={title}
                className="saas-card saas-card-hover"
                data-animate
                data-delay={String((i + 1) * 100)}
                style={{ padding: "1.75rem" }}
              >
                <div
                  className="benefit-icon"
                  style={{
                    backgroundColor: `${color}15`,
                    border: `1px solid ${color}30`,
                    color: color,
                  }}
                >
                  {icon}
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
          FEATURES — NEW SECTION
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
            <span className="badge">Features</span>
            <h2 className="section-heading-on-dark" style={{ marginTop: "0.75rem" }}>
              Everything you need to go from idea to code
            </h2>
            <p style={{ color: "var(--theme-text-on-dark-muted)", maxWidth: "520px", margin: "0 auto", fontSize: "1rem", lineHeight: 1.7 }}>
              A complete toolkit that transforms your project concept into actionable development blueprints.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {FEATURES.map(({ title, desc, icon }, i) => (
              <div
                key={title}
                className="saas-card saas-card-hover"
                data-animate
                data-delay={String((i + 1) * 100)}
                style={{ padding: "1.75rem" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    backgroundColor: "var(--theme-bg-highlight)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--theme-accent)",
                    marginBottom: "1rem",
                  }}
                >
                  {icon}
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
          AI PLATFORMS STRIP — NEW
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "3rem 1.5rem" }} data-animate>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--theme-text-on-dark-muted)", marginBottom: "1rem", fontWeight: 600 }}>
            Instructions compatible with
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {AI_PLATFORMS.map((p) => (
              <span
                key={p.slug}
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--theme-text-on-dark-muted)",
                  letterSpacing: "0.01em",
                  opacity: 0.55,
                  transition: "opacity 0.2s ease, color 0.2s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.color = "var(--theme-text-on-dark)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.55";
                  e.currentTarget.style.color = "var(--theme-text-on-dark-muted)";
                }}
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          GENERATION FLOW — MODE SELECTION
      ══════════════════════════════════════════════════════════ */}
      <section
        ref={formSectionRef}
        style={{ padding: "5rem 1.5rem", borderTop: "1px solid var(--theme-border-on-dark)" }}
        id="generate"
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* ── MODE SELECTION ─── */}
          {(step === "hero" || step === "mode") && (
            <div data-animate>
              <div className="mb-8 space-y-2">
                <span className="badge">Get Started</span>
                <h2 className="section-heading-on-dark" style={{ marginTop: "0.6rem" }}>
                  What would you like to generate?
                </h2>
                <p style={{ color: "var(--theme-text-on-dark-muted)", fontSize: "1rem", lineHeight: 1.6 }}>
                  Choose a generation mode based on your needs. You can always generate again with a different mode.
                </p>
              </div>
              <ModeSelector onSelect={handleModeSelect} />
            </div>
          )}

          {/* ── INPUT FORM ─── */}
          {step === "form" && (
            <div data-animate>
              <div className="mb-4">
                <button
                  onClick={() => setStep("mode")}
                  className="btn-ghost"
                  style={{ marginBottom: "1rem" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back to mode selection
                </button>
              </div>
              <div className="mb-8 space-y-2">
                <span className="badge">{MODE_CONFIG[mode]?.title}</span>
                <h2 className="section-heading-on-dark" style={{ marginTop: "0.6rem" }}>
                  Describe Your Project
                </h2>
                <p style={{ color: "var(--theme-text-on-dark-muted)", fontSize: "1rem", lineHeight: 1.6 }}>
                  Be as detailed as possible — the more context you provide, the more tailored your recommendations will be.
                </p>
              </div>

              {error && (
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
                    marginBottom: "1.5rem",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span><strong>Error:</strong> {error}</span>
                </div>
              )}

              <div className="saas-card" style={{ padding: "2.5rem" }}>
                <InputForm onSubmit={handleGenerate} isLoading={false} />
              </div>
            </div>
          )}

          {/* ── PROCESSING ─── */}
          {step === "processing" && (
            <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center", maxWidth: "400px" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    margin: "0 auto 1.5rem",
                    borderRadius: "50%",
                    border: "3px solid var(--theme-border-on-dark)",
                    borderTopColor: "var(--theme-accent)",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <h2 className="section-heading-on-dark" style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>
                  Generating your blueprint...
                </h2>
                <p style={{ fontSize: "0.9rem", color: "var(--theme-text-on-dark-muted)", lineHeight: 1.6 }}>
                  {progress}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          RESULTS
      ══════════════════════════════════════════════════════════ */}
      {step === "results" && comparison && (
        <section ref={resultsRef} style={{ padding: "0 1.5rem 6rem" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            {/* Header */}
            <div data-animate style={{ marginBottom: "2rem" }}>
              <div className="flex items-center justify-between flex-wrap" style={{ gap: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <span className="badge" style={{ marginBottom: "0.5rem", display: "inline-flex" }}>Results</span>
                  <h2 className="section-heading-on-dark">Your Project Blueprint</h2>
                </div>
                <button onClick={handleReset} className="btn-secondary" style={{ fontSize: "0.85rem", padding: "0.625rem 1.25rem" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  New Generation
                </button>
              </div>
            </div>

            {/* Tech Stack */}
            <div style={{ marginBottom: "2.5rem" }}>
              <h3 className="section-heading-on-dark" style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ display: "inline", verticalAlign: "middle", marginRight: "0.5rem" }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Tech Stack Comparison
              </h3>
              <div className="saas-card" style={{ padding: "1.75rem" }}>
                <TechStackResults comparison={comparison} discovery={discovery} />
              </div>
            </div>

            {/* Mermaid Diagrams (full flow only) */}
            {mode === MODES.FULL_FLOW && diagrams && (
              <div style={{ marginBottom: "2.5rem" }}>
                <h3 className="section-heading-on-dark" style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ display: "inline", verticalAlign: "middle", marginRight: "0.5rem" }}>
                    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <rect x="8" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Architecture Diagrams
                </h3>
                <MermaidDiagram diagrams={diagrams} />
              </div>
            )}

            {/* Prompts (full flow only) */}
            {mode === MODES.FULL_FLOW && prompts && (
              <div style={{ marginBottom: "2.5rem" }}>
                <h3 className="section-heading-on-dark" style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ display: "inline", verticalAlign: "middle", marginRight: "0.5rem" }}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Your AI Building Instructions
                </h3>
                <p style={{ color: "var(--theme-text-on-dark-muted)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Copy each instruction in order and paste it into your AI coding assistant. Work through the phases sequentially. No coding experience needed.
                </p>
                <PromptPhases prompts={prompts} />
              </div>
            )}

            {/* Error Recovery */}
            {mode === MODES.FULL_FLOW && (
              <div style={{ marginBottom: "2.5rem" }}>
                <ErrorRecoveryPrompt />
              </div>
            )}

            {/* Export */}
            <div className="saas-card" style={{ padding: "1.75rem" }}>
              <ExportButtons
                comparison={comparison}
                diagrams={diagrams}
                prompts={prompts}
                mode={mode}
              />
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          FAQ — NEW SECTION
      ══════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "5rem 1.5rem",
          borderTop: "1px solid var(--theme-border-on-dark)",
          background: "var(--theme-bg-section-alt)",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="text-center mb-12 space-y-3" data-animate>
            <span className="badge">FAQ</span>
            <h2 className="section-heading-on-dark" style={{ marginTop: "0.75rem" }}>
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3" data-animate data-delay="100">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="faq-item">
                <h3 className="card-title" style={{ marginBottom: "0.5rem", fontSize: "1rem" }}>{q}</h3>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "var(--theme-text-muted)" }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════════════════════ */}
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
            Ready to build something great?
          </h2>
          <p style={{ color: "var(--theme-text-on-dark-muted)", fontSize: "1.05rem", lineHeight: 1.7 }}>
            Join developers who use {SITE_NAME} to ship projects faster with AI-powered planning.
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
