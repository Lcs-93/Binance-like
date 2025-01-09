/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
      },
      colors: {
        primary: '#cdaf3a',
        background: '#181a20',
        gray: {
          lightest: '#3a3f44',
          light: '#a6a6a6',
          DEFAULT: '#23272e',
          dark: '#141519',
          darkest: '#0a0c0d',
        }
      }
    },
  },
  plugins: [],
}