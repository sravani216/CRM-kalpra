/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#FFF9FB', // App Background
          100: '#FCE7F3', // Soft Accent / Hover / Active Pill
          200: '#FBCFE8',
          300: '#F9A8D4', // Pastel pink accent
          400: '#F472B6', // Primary Button / Highlight
          500: '#EC4899', // Primary Button Hover
          600: '#DB2777',
          700: '#BE185D',
        },
        pastel: {
          pink: '#F9A8D4',
          lavender: '#C4B5FD',
          mint: '#6EE7B7',
          amber: '#FCD34D',
          sky: '#BAE6FD',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(244, 114, 182, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'soft-lg': '0 10px 25px -3px rgba(244, 114, 182, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

