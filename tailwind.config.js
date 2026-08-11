/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Darie colors - Updated to blue theme
        'brand-primary': '#1e3a5f',
        'brand-secondary': '#2B4D87',
        'brand-accent': '#3d5a8c',
        'brand-gold': '#FF9500',
        'brand-text': '#FFFFFF',
        'brand-light': '#A8B8D8',

        // Lockwood colors
        'lc-navy': '#1a2332',
        'lc-gold': '#d4a574',
        'lc-goldHover': '#c89557',
      },
    },
  },
  plugins: [],
}