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
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#74C69D',
          light: '#B7E4C7',
          dark: '#40916C',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#D8F3DC',
          dark: '#95D5B2',
          foreground: '#1B4332',
        },
        neutral: {
          DEFAULT: '#E9ECEF',
          dark: '#CED4DA',
        },
        warning: '#FFD166',
        error: '#EF476F',
        destructive: {
          DEFAULT: '#EF476F',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F8F9FA',
          foreground: '#6C757D',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#212529',
        },
        background: '#FFFFFF',
        foreground: '#212529',
        border: '#E9ECEF',
        input: '#CED4DA',
        ring: '#2D6A4F',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        accent: ['Playfair Display', 'serif'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
};
