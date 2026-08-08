/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1C1B19',
        concrete: {
          50: '#F3F1EC',
          100: '#E7E3D9',
          200: '#D4CEBF',
          300: '#B3AA94',
        },
        graphite: {
          400: '#6B655C',
          500: '#5A544C',
          600: '#4A4640',
          700: '#332F2A',
          800: '#23211E',
        },
        rebar: {
          50: '#FFF4ED',
          100: '#FFE4D4',
          500: '#E85D04',
          600: '#C1440E',
          700: '#9E3610',
        },
        steel: {
          500: '#2B4570',
          600: '#1F3253',
        },
        signal: {
          green: '#2F6B3A',
          red: '#B3261E',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', '"Arial Black"', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(28 27 25 / 0.06), 0 1px 2px -1px rgb(28 27 25 / 0.06)',
      },
    },
  },
  plugins: [],
};
