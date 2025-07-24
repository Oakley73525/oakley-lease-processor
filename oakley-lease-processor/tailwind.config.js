/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'oakley-blue': '#1e40af',
        'oakley-green': '#059669',
        'oakley-gray': '#374151',
      },
    },
  },
  plugins: [],
}