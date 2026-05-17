import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17212b",
        graphite: "#27323f",
        ocean: "#0f8ba8",
        aqua: "#1bb7b4",
        mint: "#49c58d",
        signal: "#f5a524",
        danger: "#e45757"
      },
      boxShadow: {
        executive: "0 24px 70px rgba(15, 35, 52, 0.14)",
        "executive-dark": "0 24px 70px rgba(0, 0, 0, 0.32)"
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
