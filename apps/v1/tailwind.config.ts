import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors
        'ski-blue': '#1E40AF',
        'powder-blue': '#60A5FA',
        'mountain-gray': '#6B7280',
        'snow-white': '#FFFFFF',
        // Accent colors
        'epic-red': '#DC2626',
        'ikon-orange': '#F59E0B',
        'success-green': '#10B981',
        // Backgrounds
        'bg-light': '#F9FAFB',
        'bg-dark': '#111827',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        'container': '1280px',
      },
    },
  },
  plugins: [],
};

export default config;
