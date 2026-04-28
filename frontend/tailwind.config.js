/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f0f0f5',
          100: '#e0e0eb',
          200: '#c2c2d6',
          300: '#9494b8',
          400: '#6b6b99',
          500: '#4a4a7a',
          600: '#363660',
          700: '#252547',
          800: '#16162e',
          900: '#0a0a18',
          950: '#050510',
        },
        acid: {
          DEFAULT: '#7fff00',
          dim: '#5abf00',
        },
        coral: '#ff6b6b',
        amber: '#ffb347',
        sky: '#47b8ff',
      }
    },
  },
  plugins: [],
}
