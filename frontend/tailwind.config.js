/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Aurora Theme - Primary */
        'aurora-bg': '#0A0A0F',
        'aurora-surface': '#111118',
        'aurora-card': '#16161F',
        'aurora-accent': '#6C63FF',
        'aurora-secondary': '#00D4AA',
        'aurora-text': '#F0F0FF',
        'aurora-text-secondary': '#8888AA',
        
        /* Legacy colors for compatibility */
        void: '#0A0A0F',
        canvas: '#111118',
        surface: {
          DEFAULT: '#111118',
          raised: '#16161F',
          inset: '#0E0E14',
        },
        fg: {
          primary: '#F0F0FF',
          secondary: '#8888AA',
          tertiary: '#52525B',
        },
        accent: {
          DEFAULT: '#6C63FF',
          soft: 'rgba(108,99,255,0.15)',
        },
        success: {
          DEFAULT: '#10B981',
          bg: 'rgba(16,185,129,0.12)',
          border: 'rgba(16,185,129,0.25)',
        },
        danger: {
          DEFAULT: '#F43F5E',
          bg: 'rgba(244,63,94,0.12)',
          border: 'rgba(244,63,94,0.25)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: 'rgba(245,158,11,0.12)',
          border: 'rgba(245,158,11,0.25)',
        },
        info: {
          DEFAULT: '#3B82F6',
          bg: 'rgba(59,130,246,0.12)',
          border: 'rgba(59,130,246,0.25)',
        },
        'border-subtle': 'rgba(255,255,255,0.06)',
        'border-default': 'rgba(255,255,255,0.10)',
        'border-strong': 'rgba(255,255,255,0.16)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
        '3xl': '20px',
        full: '9999px',
      },
      backgroundImage: {
        'cosmic-glow': 'radial-gradient(ellipse 600px 300px at 50% -60px, rgba(108,99,255,0.18), transparent 70%)',
        'card-shine': 'linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 50%)',
        'dot-grid': 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
        'aurora-glow': 'radial-gradient(ellipse 600px 300px at 50% -60px, rgba(108,99,255,0.25), transparent 70%)',
      },
      backgroundSize: {
        'dot-grid': '24px 24px',
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(108, 99, 255, 0.4)',
        'glow-secondary': '0 0 20px rgba(0, 212, 170, 0.4)',
        'card-hover': '0 20px 40px rgba(108, 99, 255, 0.12)',
        'card-lift': '0 24px 48px rgba(0, 0, 0, 0.4)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

