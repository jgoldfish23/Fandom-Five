/** @type {import('tailwindcss').Config} */
export default {
  // fandom-five.tsx lives at the repo root, not under src/, so it has to be
  // listed explicitly or every class gets tree-shaken out of the build.
  content: ["./index.html", "./src/**/*.{js,jsx}", "./fandom-five.tsx"],
  theme: { extend: {} },
  plugins: [],
};
