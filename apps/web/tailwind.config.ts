import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF3E7",
        linen: "#F3E4CD",
        champagne: "#C9932F",
        maroon: {
          DEFAULT: "#6F2317",
          muted: "#6F2317",
        },
        olive: "#6B7353",
        "warm-brown": "#7A2E1C",
        sage: "#A8AD96",
        cotton: "#EFE7D8",
        ink: {
          DEFAULT: "#2B231C",
          muted: "#5C5248",
        },
        success: {
          DEFAULT: "#6B7353",
          foreground: "#FAF3E7",
          muted: "#A8AD96",
        },
        error: {
          DEFAULT: "#7A2E1C",
          foreground: "#FAF3E7",
          muted: "#9B4A38",
        },
        /* Legacy aliases — migrate in Phase 2+ */
        cream: {
          DEFAULT: "#F3E4CD",
          light: "#FAF3E7",
        },
        gold: {
          DEFAULT: "#C9932F",
          bright: "#C9932F",
        },
        charcoal: {
          DEFAULT: "#2B231C",
          muted: "#5C5248",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        /* Admin console — dark luxury palette */
        admin: {
          bg: "#0D0B09",
          surface: "#161310",
          elevated: "#1E1A16",
          border: "#2A241E",
          muted: "#6B6358",
          text: "#E8E0D4",
          accent: "#C9932F",
          "accent-dim": "#8A6520",
          success: "#4A7C59",
          danger: "#9B4A38",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        script: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-source-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
        sm: ["0.875rem", { lineHeight: "1.35rem", letterSpacing: "0.01em" }],
        base: ["1rem", { lineHeight: "1.625rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.85rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.01em" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem", letterSpacing: "-0.02em" }],
        display: [
          "clamp(2.5rem, 5vw + 1rem, 4.5rem)",
          { lineHeight: "1.1", letterSpacing: "-0.03em" },
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        fast: "200ms",
        base: "500ms",
        slow: "900ms",
      },
      animation: {
        "button-breathe": "button-breathe 4s ease-luxury infinite",
        "logo-glow": "logo-glow 1.4s ease-luxury forwards",
        "petal-bloom": "petal-bloom 0.9s ease-luxury forwards",
        "motion-demo": "motion-demo 2s ease-luxury infinite alternate",
      },
      keyframes: {
        "button-breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.015)" },
        },
        "logo-glow": {
          "0%": { filter: "drop-shadow(0 0 0 rgba(201, 147, 47, 0))" },
          "100%": {
            filter: "drop-shadow(0 0 28px rgba(201, 147, 47, 0.55))",
          },
        },
        "petal-bloom": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "motion-demo": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(1.5rem)" },
        },
      },
      boxShadow: {
        luxury: "0 4px 24px rgba(111, 35, 23, 0.08), 0 1px 3px rgba(43, 35, 28, 0.06)",
        "luxury-lg": "0 8px 40px rgba(111, 35, 23, 0.12), 0 2px 8px rgba(43, 35, 28, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
