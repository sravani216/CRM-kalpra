/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#ced9fd',
          300: '#a3b8fc',
          400: '#7190f8',
          500: '#4f6ef7',
          600: '#384ee6',
          700: '#2b3ac7',
          800: '#2631a0',
          900: '#242d7e',
        },
        coral: {
          50: '#fff5f5',
          100: '#ffe6e6',
          500: '#ff6b6b',
          600: '#fa5252',
        },
        lavender: {
          50: '#f8f7ff',
          100: '#f0eeff',
          500: '#845ef7',
          600: '#7048e8',
        },
        teal: {
          50: '#e6fcf5',
          100: '#c3fae8',
          500: '#20c997',
          600: '#12b886',
        },
        sky: {
          50: '#e7f5ff',
          100: '#d0ebff',
          500: '#339af0',
          600: '#228be6',
        },
        peach: {
          50: '#fff9db',
          100: '#fff3bf',
          500: '#fcc419',
          600: '#fab005',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

