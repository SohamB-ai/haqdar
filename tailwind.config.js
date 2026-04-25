/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000080',
          light: '#1A1A99',
          dark: '#000066',
        },
        accent: {
          DEFAULT: '#FF9933',
          light: '#FFAD5C',
          dark: '#E67A00',
        },
        success: {
          DEFAULT: '#138808',
          light: '#1BA40B',
          dark: '#0E6B06',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '3rem',
      },
      boxShadow: {
        'premium': '0 20px 50px rgba(0, 0, 128, 0.05)',
        'premium-hover': '0 30px 60px rgba(0, 0, 128, 0.1)',
        'accent': '0 20px 50px rgba(255, 153, 51, 0.15)',
      },
      animation: {
        'spin-slow': 'spin-slow 12s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'spin-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
