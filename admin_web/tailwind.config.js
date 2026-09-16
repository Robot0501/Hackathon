/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        richPurple: "#2B193D",
        delftBlue: "#2C365E",
        ultraViolet: "#484D6D",
        darkCyan: "#4B8F8C",
        rosyBrown: "#C5979D",
        navy: "#0F172A",
        royal: "#1E3A8A",
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}

