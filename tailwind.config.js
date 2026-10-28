/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#0F172A',
        accent: '#F59E0B',
        success: '#16A34A',
        danger: '#DC2626',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        muted: '#64748B'
      }
    },
  },
  plugins: [],
}
