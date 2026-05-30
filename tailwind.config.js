/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#050505',
          charcoal: '#121212',
          plum: '#1A0A1C',
          magenta: '#FF00FF',
          violet: '#8A2BE2',
          gold: '#E5A93B',
        }
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
        display: ['var(--font-syne)', 'sans-serif'],
        bebas: ['var(--font-bebas)', 'sans-serif'],
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
      },
      boxShadow: {
        'magenta-glow': '0 0 15px rgba(255, 0, 255, 0.4)',
        'violet-glow': '0 0 15px rgba(138, 43, 226, 0.4)',
      }
    },
  },
  plugins: [],
};
