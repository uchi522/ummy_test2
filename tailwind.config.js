/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#10B981',
        surface: '#f8fafc',
        ink: '#1E293B',
      },
    },
  },
  plugins: [],
};
