/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#0d1117',
          card:    '#161b22',
        },
      },
      borderColor: {
        DEFAULT: 'rgba(255, 255, 255, 0.06)',
      },
      animation: {
        fadein: 'fadein 0.45s ease-out forwards',
      },
      keyframes: {
        fadein: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
