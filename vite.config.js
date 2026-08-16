import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // `npm run dev` alone can't reach the Anthropic API — the browser would
    // send no key and get blocked by CORS. Run `vercel dev` instead to get
    // the /api/anthropic function locally, or point this proxy at a deployed
    // instance to develop the UI against real data.
    proxy: {
      "/api": {
        target: process.env.API_ORIGIN || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
