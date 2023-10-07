/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'Trade-Default': '#ccc',
        'Trade-New': '#f1c40f'
      }
    },
  },
  plugins: [],
}

