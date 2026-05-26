import axios from "axios";

/**
 * Axios instance pre-configured for the backend API.
 * In dev mode, Vite proxies /api → http://localhost:8000.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/",
  headers: { "Content-Type": "application/json" },
  timeout: 120_000, // 120 s for full pipeline
});

// ── Response interceptor — surface error messages ────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Unknown error";
    console.error("[API]", msg);
    return Promise.reject(new Error(msg));
  }
);

export default api;
