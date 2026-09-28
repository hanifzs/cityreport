/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { navy: '#123B65', navy2: '#0d2c4d', emerald2: '#10B981', mist: '#F8FAFC' },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], poppins: ['Poppins', 'Inter', 'sans-serif'] },
    },
  },
  plugins: [],
};
