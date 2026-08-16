import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../fandom-five";
import "./index.css";

// fandom-five.tsx was written to run inside a host that provides an async
// window.storage and lets it call the Anthropic API directly. Neither exists
// in a plain browser, so we fill both in here rather than editing the app.
// Both shims are conditional, so the same file still runs unmodified in its
// original host.

if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? {} : { value };
      } catch {
        return {}; // private mode / storage disabled — fall back to defaults
      }
    },
    async set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* quota or private mode — saves are best-effort */
      }
    },
  };
}

// Route API traffic through our own serverless function, which holds the key.
// Without this the app would call api.anthropic.com straight from the browser
// and fail on both CORS and authentication.
if (typeof window !== "undefined") window.__API_URL__ = "/api/anthropic";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
