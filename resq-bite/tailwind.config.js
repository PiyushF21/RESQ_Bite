export default {
  // WHY: This tells Tailwind to only compile CSS for the files we actually use, keeping the app lightning fast.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // We will add our clean, appetizing brand colors here later!
    },
  },
  plugins: [],
}