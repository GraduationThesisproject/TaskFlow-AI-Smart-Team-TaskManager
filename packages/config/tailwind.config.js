/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  darkMode: ["class"],
  safelist: [
    {
      pattern: /^bg-\[#([0-9A-F]{6})\]$/i,
    },
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#e6f4ff",
          100: "#b3e0ff",
          200: "#80ccff",
          300: "#4db8ff",
          400: "#1aa4ff",
          500: "#007ADF",
          600: "#0066b3",
          700: "#005299",
          800: "#003d80",
          900: "#002966",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: "#e6fffa",
          100: "#b3fff0",
          200: "#80ffe6",
          300: "#4dffdc",
          400: "#1affd2",
          500: "#00E8C6",
          600: "#00c9a7",
          700: "#00aa88",
          800: "#008b6a",
          900: "#006b4b",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        neutral: {
          0: "hsl(var(--neutral-0))",
          100: "hsl(var(--neutral-100))",
          200: "hsl(var(--neutral-200))",
          1000: "hsl(var(--neutral-1000))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        error: "hsl(var(--error))",
        info: "hsl(var(--info))",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      fontSize: {
        'text-14': '0.875rem',
        'text-16': '1rem',
        'text-18': '1.125rem',
        'text-20': '1.25rem',
        'text-36': '2.25rem',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        // Rotating CSS variable-based angle for conic-gradient borders
        orbit: {
          "0%": { "--tw-glow-angle": "0deg" },
          "100%": { "--tw-glow-angle": "360deg" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        orbit: "orbit 1.2s linear infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
};
