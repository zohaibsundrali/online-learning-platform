/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#4A3F40',
        primary: '#8AA39B',
        secondary: '#C08B5C',
        accent: '#E07A5F',
        text: '#DBE2DC',
        card: '#5B4D4E',
        border: '#6D5F60',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
      },
    },
  },
  plugins: [],
}