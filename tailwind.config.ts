import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Regulatory capital category palette — CSS variables allow easy theming
        "capital-well": "var(--color-capital-well)",
        "capital-adequate": "var(--color-capital-adequate)",
        "capital-under": "var(--color-capital-under)",
        "capital-significantly-under": "var(--color-capital-significantly-under)",
        "capital-critically-under": "var(--color-capital-critically-under)",
      },
    },
  },
  plugins: [],
};

export default config;
