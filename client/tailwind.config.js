/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',

  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },

      colors: {
        votora: {
          bg: '#080808',
          surface: '#111111',
          elevated: '#161616',
          card: '#1a1a1a',
          border: 'rgba(255,255,255,0.07)',
          muted: '#737373',
          subtle: '#a3a3a3',
          text: '#f5f5f5',
        },
        accent: {
          DEFAULT: '#06b6d4',
          hover: '#0891b2',
          muted: 'rgba(6,182,212,0.12)',
          border: 'rgba(6,182,212,0.28)',
          orange: '#f97316',
          amber: '#f59e0b',
          red: '#ef4444',
          green: '#10b981',
        },
        surface: {
          DEFAULT: '#111111',
          card: '#1a1a1a',
          elevated: '#161616',
          border: 'rgba(255,255,255,0.07)',
          hover: 'rgba(255,255,255,0.05)',
        },
      },

      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      boxShadow: {
        glow: '0 0 40px rgba(6,182,212,0.15)',
        'glow-lg': '0 20px 60px rgba(6,182,212,0.22)',
        card: '0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-lg': '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #080808 0%, #111111 50%, #0a0a0a 100%)',
        'accent-gradient': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
      },

      animation: {
        'fade-in': 'fadeIn 0.45s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        shimmer: 'shimmer 2s linear infinite',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },

  plugins: [],
};
