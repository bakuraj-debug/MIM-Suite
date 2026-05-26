/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          600: "#005CB9",
          700: "#004B99",
        },
      },
    },
  },
  plugins: [],
};
