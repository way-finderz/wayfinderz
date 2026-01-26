/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6f2aec",
          dark: "#2d005d",
          secondary: "#603cba",
        },
        accent: {
          pink: "#ea4678",
          yellow: "#F5C842",
        },
        background: {
          DEFAULT: "#FDF8F3",
          cream: "#FFF8F0",
        },
      },
      fontFamily: {
        display: ['"Alegreya Sans"', 'sans-serif'],
        sans: ['"Open Sans"', 'sans-serif'],
        ui: ['Karla', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
