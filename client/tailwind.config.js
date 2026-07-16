/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B1120',
          900: '#111827',
          800: '#1B2436',
        },
        signal: {
          DEFAULT: '#4F6BFF', // primary - "boom gate" blue
          dark: '#3B52D9',
        },
        amber: {
          DEFAULT: '#F5A524',
        },
        emerald: {
          DEFAULT: '#1FAE7A',
        },
        rose: {
          DEFAULT: '#E5484D',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
