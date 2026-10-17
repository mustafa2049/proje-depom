/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0F172A',
        surface: '#1E293B',
        accent: '#38BDF8',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        muted: '#94A3B8',
      },
    },
  },
  plugins: [],
};
