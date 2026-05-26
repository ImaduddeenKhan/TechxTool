/* PreClaw — Shared constants */

export const SITE_NAME = "PreClaw";
export const SITE_TAGLINE = "Idea to Code, Intelligently.";
export const SITE_DESCRIPTION =
  "AI-powered tech stack generator and development prompt builder. Describe your project idea and get tailored tech stacks, architecture diagrams, and phased prompts ready for Claude, Bolt, Lovable, Replit, Cursor, and more.";
export const SITE_URL = "https://preclaw.com";
export const SUPPORT_EMAIL = "aiwithimad@gmail.com";

/* ── Compatible AI Platforms ─────────────────────────────────────────────── */
export const AI_PLATFORMS = [
  { name: "Claude", slug: "claude" },
  { name: "Antigravity", slug: "antigravity" },
  { name: "Lovable", slug: "lovable" },
  { name: "Bolt.new", slug: "bolt" },
  { name: "Replit", slug: "replit" },
  { name: "Cursor", slug: "cursor" },
  { name: "Windsurf", slug: "windsurf" },
  { name: "v0.dev", slug: "v0" },
  { name: "GPT Engineer", slug: "gptengineer" },
  { name: "GitHub Copilot", slug: "copilot" },
];

/* ── Generation Modes ────────────────────────────────────────────────────── */
export const MODES = {
  TECH_STACK: "tech_stack",
  FULL_FLOW: "full_flow",
};

export const MODE_CONFIG = {
  [MODES.TECH_STACK]: {
    title: "Generate Tech Stack",
    description:
      "Get a tailored tech stack comparison with pros, cons, cost estimates, and architecture recommendations for your project.",
    creditCost: 1,
  },
  [MODES.FULL_FLOW]: {
    title: "Generate Tech Stack + AI-Ready Prompts",
    description:
      "Get your tech stack plus Mermaid architecture diagrams, database schema, and phased development prompts ready for any AI coding assistant.",
    creditCost: 1.5,
  },
};

/* ── Project Types ───────────────────────────────────────────────────────── */
export const PROJECT_TYPES = [
  "E-commerce Platform",
  "Multi-vendor Marketplace",
  "Grocery Delivery (Instacart-style)",
  "Fashion & Apparel Store",
  "B2B Wholesale Marketplace",
  "Auction Platform",
  "Digital Products Marketplace",
  "Ride-sharing (Uber-style)",
  "Fleet Management System",
  "Last-mile Delivery Service",
  "Logistics & Freight Platform",
  "Food Delivery (Zomato-style)",
  "Restaurant POS System",
  "Cloud Kitchen Management",
  "Hotel Booking (OYO-style)",
  "Travel & Tourism Platform",
  "Event Ticketing Platform",
  "Fintech / Neobank",
  "Payment Gateway",
  "Expense Tracker",
  "Invoice & Billing SaaS",
  "Crypto / Trading Platform",
  "Insurance Platform",
  "Telemedicine / HealthTech",
  "Fitness & Wellness App",
  "Pharmacy Delivery Platform",
  "EdTech / Online Learning (Udemy-style)",
  "School / University Management System",
  "Tutoring Marketplace",
  "Social Media Platform",
  "Messaging / Chat App",
  "Community Forum",
  "Video Streaming (Netflix-style)",
  "Audio / Podcast Platform",
  "Live Streaming Platform",
  "Project Management Tool",
  "CRM System",
  "HR & Payroll System",
  "Helpdesk / Support Ticketing",
  "Document Management System",
  "Appointment Scheduling SaaS",
  "Workflow Automation Tool",
  "Real Estate Listing Platform",
  "Property Management System",
  "AI/ML Platform",
  "Data Pipeline / ETL",
  "Analytics Dashboard",
  "Chatbot / Virtual Assistant",
  "API Service / Microservices",
  "DevOps / CI-CD Platform",
  "No-code / Low-code Builder",
  "IoT Device Management",
  "Job Board / Recruitment Platform",
  "Subscription Box Service",
  "On-demand Services (UrbanClap-style)",
  "Parking Management System",
  "ERP System",
  "Content Management System (CMS)",
];

export const SCALES = ["small", "medium", "large", "enterprise"];
export const PRICING_MODELS = ["free", "freemium", "paid", "enterprise"];
export const PLATFORM_OPTIONS = ["Web App", "Mobile App", "Data Pipeline", "AI/ML"];
export const COMMON_TECHS = [
  "React", "Vue", "Angular", "Svelte", "Next.js",
  "FastAPI", "Django", "Express",
  "PostgreSQL", "MongoDB", "Redis",
  "Docker", "Kubernetes",
  "Stripe", "Firebase", "Supabase",
  "Tailwind CSS", "TypeScript",
];

/* ── Pricing Plans ───────────────────────────────────────────────────────── */
export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    credits: 3,
    features: [
      "3 generations included",
      "Tech stack recommendations",
      "PDF export",
      "Community support",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 2,
    credits: 10,
    featured: false,
    features: [
      "10 generation credits",
      "Tech stack + AI-ready prompts",
      "Mermaid architecture diagrams",
      "PDF & DOCX export",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 8,
    credits: 50,
    featured: true,
    features: [
      "50 generation credits",
      "Tech stack + AI-ready prompts",
      "Mermaid architecture diagrams",
      "PDF & DOCX export",
      "Priority email support",
      "Generation history dashboard",
    ],
  },
];

/* ── Free tier limit ─────────────────────────────────────────────────────── */
export const FREE_CREDITS = 3;
