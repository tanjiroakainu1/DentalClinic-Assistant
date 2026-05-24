/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        candy: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        galaxy: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#1e0b3d',
        },
        cosmic: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
      },
      boxShadow: {
        glow: '0 0 24px rgba(217, 70, 239, 0.35)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.45)',
        candy: '0 8px 32px rgba(192, 38, 211, 0.25)',
        glass: '0 8px 32px rgba(15, 10, 30, 0.4)',
      },
      backgroundImage: {
        'galaxy-gradient': 'linear-gradient(135deg, #1e0b3d 0%, #312e81 40%, #4c1d95 70%, #701a75 100%)',
        'candy-gradient': 'linear-gradient(135deg, #f0abfc 0%, #d946ef 50%, #8b5cf6 100%)',
        'hero-gradient': 'linear-gradient(160deg, #0f0a1e 0%, #1e0b3d 25%, #4c1d95 55%, #6d28d9 80%, #5b21b6 100%)',
        'hero-glow': 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(192, 38, 211, 0.35), transparent)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'home-fade-in 0.8s ease-out both',
        twinkle: 'twinkle 3s ease-in-out infinite',
        shimmer: 'shimmer 2.5s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)' },
          '100%': { transform: 'translateX(220%) skewX(-12deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(217, 70, 239, 0.35)' },
          '50%': { boxShadow: '0 0 36px rgba(192, 38, 211, 0.55), 0 0 48px rgba(139, 92, 246, 0.35)' },
        },
      },
    },
  },
  plugins: [],
};
