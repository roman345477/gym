/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0f',
          secondary: '#12121a',
          card: '#1a1a26',
          elevated: '#22223a',
        },
        accent: {
          primary: '#6c63ff',
          secondary: '#ff6584',
          green: '#00d9a3',
          orange: '#ff9a3c',
        },
        text: {
          primary: '#f0f0ff',
          secondary: '#9090b8',
          muted: '#5a5a7a',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(16px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 20px rgba(108,99,255,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(108,99,255,0.6)' } },
      },
    },
  },
  plugins: [],
}
