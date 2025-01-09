/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#cdaf3a',
        background: '#181a20',
        gray: '#2b3139'
      },
    },
  },
  plugins: [],
}
