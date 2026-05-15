/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',

  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      colors: {
       
        brand: {
          50:  '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252', 
          600: '#404040',
          700: '#2e2e2e',
          800: '#1f1f1f',
          900: '#141414',
        },

       
        accent: {
          orange: '#f97316',
          amber: '#f59e0b',
          red: '#ef4444',
          green: '#10b981',
        },

        
        surface: {
          DEFAULT: '#121212',
          card: '#1a1a1a',  
          border: 'rgba(255, 255, 255, 0.06)',
          hover: 'rgba(255, 255, 255, 0.08)',
        },
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',

      
        'hero-gradient':
          'linear-gradient(135deg, #0f0f0f 0%, #141414 50%, #0d0d0d 100%)',

      
        'glow-gradient':
          'radial-gradient(circle at top, rgba(249,115,22,0.12), transparent 60%)',
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },

  plugins: [],
};