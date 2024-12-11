/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Dark mode colors
        gray: {
          900: '#121212',
          800: '#1E1E1E',
          700: '#2A2A2A',
          600: '#3A3A3A',  // Added a new, slightly lighter gray for hover effects
          500: '#4A4A4A'  // Even lighter gray for additional contrast
        },
        light: {
          background: '#f3f3f3',     // Darker gray background
          surface: '#fefefe',       // Light gray surface instead of white
          primary: '#D1D5DB',       // Medium gray primary
          secondary: '#f3f3f3',     // Same as background for consistency
          text: {
            primary: '#111827',     // Very dark gray, almost black
            secondary: '#374151',   // Dark gray for secondary text
            muted: '#4B5563'        // Medium-dark gray for muted text
          },
          border: '#eaeaea',        // Medium-dark gray border
          divider: '#eaeaea'        // Medium gray divider
        }
      }
    }
  },
  plugins: [
    require('tailwind-scrollbar')
  ]
}