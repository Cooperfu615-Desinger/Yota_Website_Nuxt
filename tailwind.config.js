/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        // 主題色（對應 CSS 變數）
        'bg':           '#0F0020',
        'bg-card':      '#1C0A3A',
        'bg-card2':     '#250D48',
        'purple-dark':  '#3B0764',
        'purple':       '#6B21A8',
        'purple-mid':   '#7C3AED',
        'purple-light': '#A855F7',
        'purple-glow':  '#C084FC',
        'gold':         '#F5C842',
        'gold-light':   '#FDE68A',
        'gold-dark':    '#D97706',
        'app-text':     '#F3E8FF',
        'app-muted':    '#C4B5D5',
      },
      fontFamily: {
        sans: ['Noto Sans TC', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      height: {
        'top-nav':    '60px',
        'bottom-nav': '64px',
      },
    },
  },
  plugins: [],
}
