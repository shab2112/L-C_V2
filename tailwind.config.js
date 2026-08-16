/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lockwood & Carter design.md colour tokens
        'brand-primary': '#122238',
        'brand-secondary': '#1D334E',
        'brand-accent': '#1D334E',
        'brand-gold': '#B49A68',
        'brand-text': '#FFFFFF',
        'brand-light': '#E6DED0',

        // Lockwood colors
        'lc-navy': '#122238',
        'lc-gold': '#B49A68',
        'lc-goldHover': '#6F5A35',
      },
      fontFamily: {
        sans: ['Manrope', 'Arial', 'sans-serif'],
        serif: ['"Libre Baskerville"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
