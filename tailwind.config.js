/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'jumhuriya-red': '#973030',
        'primary-accent': '#006070',
        'accent-hover': '#007A8C',
        'accent-deep': '#012E35',
      },
      fontFamily: {
        'jomhuria': ['Jomhuria', 'serif'],
        'almarai': ['Almarai', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
