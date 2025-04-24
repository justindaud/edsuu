/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      '!../shared/node_modules/**/*',
      '../shared/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        fontFamily: {
          frutiger: ['Frutiger LT Pro', 'sans-serif'],
        },
        colors: {
          'edsu-green': 'var(--edsu-green)',
          'edsu-pink': 'var(--edsu-pink)',
          'edsu-dark': 'var(--edsu-dark)',
          'edsu-light': 'var(--edsu-light)',
          'edsu-accent': 'var(--edsu-accent)',
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        },
        animation: {
          'float': 'float 6s ease-in-out infinite',
          'glitch': 'glitch 1s linear infinite',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-20px)' },
          },
          glitch: {
            '0%': { transform: 'translate(0)' },
            '20%': { transform: 'translate(-2px, 2px)' },
            '40%': { transform: 'translate(-2px, -2px)' },
            '60%': { transform: 'translate(2px, 2px)' },
            '80%': { transform: 'translate(2px, -2px)' },
            '100%': { transform: 'translate(0)' },
          },
        },
      },
    },
    plugins: [],
  }