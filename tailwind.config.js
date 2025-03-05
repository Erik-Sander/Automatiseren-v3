/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'snow': '#f0f5ff',
        'ice': '#e0ebff',
        'sky-blue': '#87ceeb',
        'mountain': '#3a4b5c',
        'pine': '#2d5540',
        'gold': '#ffd700',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'ski': 'ski 5s ease-in-out infinite',
        'jump': 'jump 1s ease-out',
        'coin-spin': 'spin 1s linear infinite',
      },
      keyframes: {
        ski: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '50%': { transform: 'translateX(20px) translateY(10px)' },
        },
        jump: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-50px)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} 