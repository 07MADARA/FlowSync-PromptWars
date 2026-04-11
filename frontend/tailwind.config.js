/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        background: '#0B0F19',
        surface: '#151C2C',
        primary: '#38BDF8', // Lighter neon blue
        primaryDark: '#0EA5E9',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marching-ants': 'marching-ants 1s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.8))' },
          '50%': { opacity: '.7', filter: 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.3))' },
        },
        'marching-ants': {
          to: { strokeDashoffset: '-14' }
        }
      }
    },
  },
  plugins: [],
}
