/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#6C4EF6',
          600: '#5A3CE0',
        },
        accent: {
          500: '#9333EA',
        },
        bg: {
          dark: '#0F172A',
          light: '#F8FAFF',
        },
        muted: {
          500: '#6B7280',
        },
      },
      boxShadow: {
        'md': '0 10px 20px rgba(16,24,40,0.08)',
        'glow': '0 6px 30px rgba(108,78,246,0.18)',
      },
      animation: {
        'fade-in': 'fadeIn var(--anim-medium) ease-out',
        'slide-up': 'slideUp var(--anim-medium) ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 6px 30px rgba(108,78,246,0.18)' },
          '50%': { boxShadow: '0 6px 30px rgba(108,78,246,0.35)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        'fast': '150ms',
        'medium': '300ms',
        'slow': '600ms',
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
}