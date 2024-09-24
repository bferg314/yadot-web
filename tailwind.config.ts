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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      gridTemplateColumns: {
        '365': 'repeat(365, minmax(0, 1fr))',
        '52': 'repeat(52, minmax(0, 1fr))',
        '10': 'repeat(10, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};
export default config;
