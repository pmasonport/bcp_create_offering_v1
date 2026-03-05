/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          DEFAULT: '#2560FF',
          light: '#EEF2FF',
          bg: '#F8FAFF',
          100: '#DBEAFE',
          600: '#1E40AF',
        },
        green: '#10B981',
        amber: {
          DEFAULT: '#F59E0B',
          100: '#FEF3C7',
          600: '#92400E',
          700: '#D97706',
        },
        red: '#EF4444',
        sub: '#ECFDF5',
        'sub-dark': '#10B981',
        payg: '#FEF3C7',
        'payg-dark': '#D97706',
        g: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
