/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0f0f1a',
        'bg-secondary': '#1a1a2e',
        'bg-tertiary': '#16213e',
        'accent-primary': '#10b981',
        'accent-secondary': '#f59e0b',
        'text-primary': '#e5e5e5',
        'text-secondary': '#9ca3af',
        'danger': '#ef4444',
        'success': '#22c55e',
      },
      fontFamily: {
        'mono': ['monospace'],
      },
    },
  },
  plugins: [],
}

