/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
  background: '#FFFFFF',
  primary: '#6D28D9',   // Rich Purple
  secondary: '#374151', // Light Gray
  accent: '#A855F7',    // Light Purple
  text: '#1F1F1F',      // Near Black
  card: '#FFFFFF',
  border: '#E5E7EB',
},
     fontFamily: {
  display: ['DM Sans', 'sans-serif'],
  body: ['Poppins', 'sans-serif'],
},
      borderRadius: {
        'card': '12px',
      },
    },
  },
  plugins: [],
}