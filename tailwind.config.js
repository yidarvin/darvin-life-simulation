/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      colors: {
        bg: {
          DEFAULT: '#0d0d0d',
          elevated: '#181818',
          deep: '#060606',
        },
        phosphor: {
          DEFAULT: '#2dd4bf',
          bright: '#5eead4',
          dim: '#4a857e',
          faint: '#1d3633',
        },
        warning: '#f0c674',
        error: '#cc6666',
        success: '#a3be8c',
      },
      fontFamily: {
        display: ['VT323', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        blink: 'blink 1.1s steps(1) infinite',
        'float-up': 'floatUp 0.9s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        blink: { '50%': { opacity: '0' } },
        floatUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-50px)', opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
