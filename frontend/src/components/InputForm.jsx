import { useState } from "react";
import Tooltip from "./Tooltip.jsx";

const PROJECT_TYPES = [
  // E-commerce & Marketplace
  "E-commerce Platform",
  "Multi-vendor Marketplace",
  "Grocery Delivery (Instacart-style)",
  "Fashion & Apparel Store",
  "B2B Wholesale Marketplace",
  "Auction Platform",
  "Digital Products Marketplace",
  // Transportation & Logistics
  "Ride-sharing (Uber-style)",
  "Fleet Management System",
  "Last-mile Delivery Service",
  "Logistics & Freight Platform",
  // Food & Hospitality
  "Food Delivery (Zomato-style)",
  "Restaurant POS System",
  "Cloud Kitchen Management",
  "Hotel Booking (OYO-style)",
  "Travel & Tourism Platform",
  "Event Ticketing Platform",
  // Finance & Payments
  "Fintech / Neobank",
  "Payment Gateway",
  "Expense Tracker",
  "Invoice & Billing SaaS",
  "Crypto / Trading Platform",
  "Insurance Platform",
  // Health & Fitness
  "Telemedicine / HealthTech",
  "Fitness & Wellness App",
  "Pharmacy Delivery Platform",
  // Education
  "EdTech / Online Learning (Udemy-style)",
  "School / University Management System",
  "Tutoring Marketplace",
  // Social & Communication
  "Social Media Platform",
  "Messaging / Chat App",
  "Community Forum",
  "Video Streaming (Netflix-style)",
  "Audio / Podcast Platform",
  "Live Streaming Platform",
  // Business & Productivity
  "Project Management Tool",
  "CRM System",
  "HR & Payroll System",
  "Helpdesk / Support Ticketing",
  "Document Management System",
  "Appointment Scheduling SaaS",
  "Workflow Automation Tool",
  // Real Estate
  "Real Estate Listing Platform",
  "Property Management System",
  // AI & Data
  "AI/ML Platform",
  "Data Pipeline / ETL",
  "Analytics Dashboard",
  "Chatbot / Virtual Assistant",
  // Developer & Infrastructure
  "API Service / Microservices",
  "DevOps / CI-CD Platform",
  "No-code / Low-code Builder",
  "IoT Device Management",
  // Other
  "Job Board / Recruitment Platform",
  "Subscription Box Service",
  "On-demand Services (UrbanClap-style)",
  "Parking Management System",
  "ERP System",
  "Content Management System (CMS)",
];

const SCALES = ["small", "medium", "large", "enterprise"];
const PRICING_MODELS = ["free", "freemium", "paid", "enterprise"];
const PLATFORM_OPTIONS = ["Web App", "Mobile App", "Data Pipeline", "AI/ML"];
const OUTPUT_FORMATS = [
  { value: "table", label: "Table" },
  { value: "table_explanation", label: "Table + Explanation" },
  { value: "pdf", label: "PDF" },
];
const COMMON_TECHS = [
  "React", "Vue", "Angular", "Svelte", "Next.js",
  "FastAPI", "Django", "Express",
  "PostgreSQL", "MongoDB", "Redis",
  "Docker", "Kubernetes",
  "Stripe", "Firebase", "Supabase",
  "Tailwind CSS", "TypeScript",
];

const MAX_CUSTOM_WORDS = 200;

const FIELD_HINTS = {
  project_type: "Choose a standard project type or describe your own custom idea",
  scale: "small = hobby/MVP, medium = startup, large = high-traffic, enterprise = mission-critical",
  pricing_model: "How will end-users pay (or not) for your product?",
  preferred_language: "Your team's primary language — we'll prioritise frameworks in this language",
  platform_type: "Select all target platforms for your project",
  output_format: "Choose how you'd like to see the results",
  pinned_techs: "Technologies you must use — we'll build around them",
  notes: "Any extra context: constraints, preferences, deadlines, etc.",
};

function countWords(str) {
  return str.trim() === "" ? 0 : str.trim().split(/\s+/).length;
}

const SELECT_TAB_STYLE = {
  borderRadius: "8px",
  padding: "0.45rem 1rem",
  fontSize: "0.82rem",
  fontWeight: 600,
  letterSpacing: "0.02em",
  border: "1px solid var(--theme-border)",
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  cursor: "default",
  userSelect: "none",
};

export default function InputForm({ onSubmit, isLoading }) {
  const [customIdea, setCustomIdea] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    project_type: "",
    scale: "small",
    pricing_model: "free",
    preferred_language: "",
    platform_type: ["Web App"],
    output_format: "table",
    pinned_techs: [],
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const set = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const togglePlatform = (p) =>
    set(
      "platform_type",
      form.platform_type.includes(p)
        ? form.platform_type.filter((v) => v !== p)
        : [...form.platform_type, p]
    );

  const toggleTech = (t) =>
    set(
      "pinned_techs",
      form.pinned_techs.includes(t)
        ? form.pinned_techs.filter((v) => v !== t)
        : [...form.pinned_techs, t]
    );

  const customWordCount = countWords(customIdea);

  const handleCustomIdeaChange = (e) => {
    const text = e.target.value;
    if (countWords(text) <= MAX_CUSTOM_WORDS) setCustomIdea(text);
  };

  const filteredProjectTypes = searchQuery
    ? PROJECT_TYPES.filter((pt) =>
        pt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : PROJECT_TYPES;

  const validate = () => {
    const errs = {};
    const hasCustom = customIdea.trim().length > 0;
    const hasCategory = !!form.project_type;
    if (!hasCustom && !hasCategory) {
      errs.project_type = "Please select a category or describe your idea";
    } else if (hasCustom && customWordCount < 5) {
      errs.project_type = "Please provide at least 5 words in the description";
    }
    if (form.platform_type.length === 0)
      errs.platform_type = "Select at least one platform";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const resolvedType = customIdea.trim()
      ? `Custom: ${customIdea.trim()}`
      : form.project_type;
    onSubmit({ ...form, project_type: resolvedType });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">

      {/* ── Project Type ─────────────────────────────────────── */}
      <Field label="Project Type" hint={FIELD_HINTS.project_type} error={errors.project_type}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: categories */}
          <div className="space-y-3">
            <div style={{ ...SELECT_TAB_STYLE, color: "var(--theme-text-muted)", backgroundColor: "var(--theme-bg-highlight)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Choose Category
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search project types..."
              className="saas-input"
            />
            <select
              value={form.project_type}
              onChange={(e) => set("project_type", e.target.value)}
              className="saas-input"
              size={6}
            >
              <option value="" disabled>— Select a category —</option>
              {filteredProjectTypes.map((pt) => (
                <option key={pt} value={pt}>{pt}</option>
              ))}
            </select>
            <p style={{ fontSize: "0.76rem", color: "var(--theme-text-muted)" }}>
              {PROJECT_TYPES.length} project types
              {form.project_type && (
                <>
                  {" "}·{" "}
                  <span style={{ fontWeight: 600, color: "var(--theme-text-main)" }}>
                    {form.project_type}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Right: free-text */}
          <div className="space-y-3">
            <div style={{ ...SELECT_TAB_STYLE, color: "var(--theme-text-muted)", backgroundColor: "var(--theme-bg-highlight)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Explain Your Idea
            </div>
            <textarea
              value={customIdea}
              onChange={handleCustomIdeaChange}
              rows={8}
              placeholder="Describe your project idea in detail. Example: I want to build a platform that connects local farmers directly with consumers, with real-time inventory tracking and payments…"
              className="saas-input"
              style={{ minHeight: "170px", resize: "vertical" }}
            />
            <div className="flex items-center justify-between" style={{ fontSize: "0.75rem" }}>
              <span style={{ color: "var(--theme-text-muted)", opacity: 0.75 }}>Be as descriptive as possible</span>
              <span
                style={{
                  color: customWordCount > MAX_CUSTOM_WORDS * 0.9
                    ? "var(--theme-accent)"
                    : "var(--theme-text-muted)",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 500,
                }}
              >
                {customWordCount}/{MAX_CUSTOM_WORDS}
              </span>
            </div>
          </div>
        </div>
        <p style={{ marginTop: "0.6rem", fontSize: "0.78rem", color: "var(--theme-text-muted)" }}>
          If unsure about the category, just explain your idea on the right →
        </p>
      </Field>

      {/* ── Scale ────────────────────────────────────────────── */}
      <Field label="Scale" hint={FIELD_HINTS.scale}>
        <select
          value={form.scale}
          onChange={(e) => set("scale", e.target.value)}
          className="saas-input"
          style={{ maxWidth: "260px" }}
        >
          {SCALES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </Field>

      {/* ── Pricing Model ─────────────────────────────────────── */}
      <Field label="Pricing Model" hint={FIELD_HINTS.pricing_model}>
        <select
          value={form.pricing_model}
          onChange={(e) => set("pricing_model", e.target.value)}
          className="saas-input"
          style={{ maxWidth: "260px" }}
        >
          {PRICING_MODELS.map((pm) => (
            <option key={pm} value={pm}>
              {pm.charAt(0).toUpperCase() + pm.slice(1)}
            </option>
          ))}
        </select>
      </Field>

      {/* ── Preferred Language ────────────────────────────────── */}
      <Field label="Preferred Language" hint={FIELD_HINTS.preferred_language}>
        <input
          type="text"
          value={form.preferred_language}
          onChange={(e) => set("preferred_language", e.target.value)}
          placeholder="e.g. Python, TypeScript, Go"
          className="saas-input"
          style={{ maxWidth: "360px" }}
        />
      </Field>

      {/* ── Platform Type ─────────────────────────────────────── */}
      <Field label="Platform Type" hint={FIELD_HINTS.platform_type} error={errors.platform_type}>
        <div className="flex flex-wrap gap-2">
          {PLATFORM_OPTIONS.map((p) => (
            <label
              key={p}
              className={`platform-chip${form.platform_type.includes(p) ? " active" : ""}`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={form.platform_type.includes(p)}
                onChange={() => togglePlatform(p)}
              />
              {p}
            </label>
          ))}
        </div>
      </Field>

      {/* ── Output Format ─────────────────────────────────────── */}
      <Field label="Output Format" hint={FIELD_HINTS.output_format}>
        <div className="flex gap-2 flex-wrap">
          {OUTPUT_FORMATS.map(({ value, label }) => (
            <label
              key={value}
              className={`platform-chip${form.output_format === value ? " active" : ""}`}
            >
              <input
                type="radio"
                className="sr-only"
                name="output_format"
                value={value}
                checked={form.output_format === value}
                onChange={() => set("output_format", value)}
              />
              {label}
            </label>
          ))}
        </div>
      </Field>

      {/* ── Pinned Technologies ───────────────────────────────── */}
      <Field label="Pinned Technologies" hint={FIELD_HINTS.pinned_techs}>
        <div className="flex flex-wrap gap-2">
          {COMMON_TECHS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTech(t)}
              className={`tech-chip${form.pinned_techs.includes(t) ? " active" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>

      {/* ── Notes ─────────────────────────────────────────────── */}
      <Field label="Additional Notes" hint={FIELD_HINTS.notes}>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          placeholder="Any extra context, constraints, team size, deadline, or preferences…"
          className="saas-input"
        />
      </Field>

      {/* ── Submit ────────────────────────────────────────────── */}
      <div style={{ paddingTop: "0.5rem" }}>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
          style={{ width: "100%", padding: "1rem", fontSize: "1rem", justifyContent: "center" }}
        >
          {isLoading ? (
            <>
              <svg width="17" height="17" className="animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Analyzing…
            </>
          ) : (
            <>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Analyze Requirements
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/** Form field wrapper with label + tooltip + error. */
function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="form-label">
        {label}
        {hint && (
          <Tooltip text={hint}>
            <span className="tooltip-icon">i</span>
          </Tooltip>
        )}
      </label>
      {children}
      {error && (
        <p
          style={{
            marginTop: "0.35rem",
            fontSize: "0.78rem",
            color: "var(--theme-warning-text)",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
