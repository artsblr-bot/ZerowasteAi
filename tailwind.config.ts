import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bmw: {
          blue: "var(--color-accent)",
          "blue-active": "var(--color-accent-hover)",
          "blue-disabled": "var(--color-accent-disabled)",
          ink: "var(--color-text-primary)",
          body: "var(--color-text-secondary)",
          "body-strong": "var(--color-text-primary)",
          muted: "var(--color-text-muted)",
          "muted-soft": "var(--color-text-muted-soft)",
          hairline: "var(--color-border)",
          "hairline-strong": "var(--color-border-strong)",
          canvas: "var(--color-bg)",
          "surface-soft": "var(--color-bg-soft)",
          "surface-card": "var(--color-bg-card)",
          "surface-strong": "var(--color-bg-strong)",
          "surface-dark": "var(--color-bg-dark)",
          "surface-dark-elevated": "var(--color-bg-dark-elevated)",
          "on-primary": "var(--color-on-accent)",
          "on-dark": "var(--color-text-on-dark)",
          "on-dark-soft": "var(--color-text-on-dark-soft)",
          "m-red": "var(--color-error)",
          success: "var(--color-success)",
          warning: "var(--color-warning)",
          error: "var(--color-error)",
        },
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover": "0 10px 25px -5px rgb(0 0 0 / 0.08), 0 4px 10px -6px rgb(0 0 0 / 0.04)",
        "card-dark": "0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.2)",
        "card-hover-dark": "0 10px 25px -5px rgb(0 0 0 / 0.5), 0 4px 10px -6px rgb(0 0 0 / 0.3)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        "display-xl": ["64px", { lineHeight: "1.05", fontWeight: "700" }],
        "display-lg": ["48px", { lineHeight: "1.1", fontWeight: "700" }],
        "display-md": ["32px", { lineHeight: "1.15", fontWeight: "700" }],
        "display-sm": ["24px", { lineHeight: "1.25", fontWeight: "700" }],
        "title-lg": ["20px", { lineHeight: "1.3", fontWeight: "700" }],
        "title-md": ["18px", { lineHeight: "1.4", fontWeight: "700" }],
        "title-sm": ["16px", { lineHeight: "1.4", fontWeight: "700" }],
      },
      letterSpacing: {
        button: "0.5px",
        uppercase: "1.5px",
        nav: "0.3px",
      },
      spacing: {
        section: "80px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        counter: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        float: "float 4s ease-in-out infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}

export default config
