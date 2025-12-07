import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./modules/**/*.{js,ts,jsx,tsx,mdx}",
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
      animation: {
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        slideDown: {
          from: { opacity: '0', maxHeight: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', maxHeight: '6rem', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '1', maxHeight: '6rem', transform: 'translateY(0)' },
          to: { opacity: '0', maxHeight: '0', transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
