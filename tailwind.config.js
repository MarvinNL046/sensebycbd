/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D6A4F',
          light: '#52B788',
          dark: '#1B4332',
        },
        secondary: {
          DEFAULT: '#74C69D',
          light: '#B7E4C7',
          dark: '#40916C',
        },
        accent: {
          DEFAULT: '#D8F3DC',
          dark: '#95D5B2',
        },
        neutral: {
          DEFAULT: '#E9ECEF',
          dark: '#CED4DA',
        },
        warning: '#FFD166',
        error: '#EF476F',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        accent: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};
