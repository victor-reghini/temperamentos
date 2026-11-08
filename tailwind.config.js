/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['variant', [
    '.dark &',
    '[data-theme="dark"] &',
    '&:is(.dark, .dark *)',
    '&:is([data-theme="dark"], [data-theme="dark"] *)',
  ]],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

