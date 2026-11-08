import forms from '@tailwindcss/forms'
import defaultTheme from 'tailwindcss/defaultTheme'

// "Bản vẽ kĩ thuật" design system.
// The pages use Tailwind palette names directly (blue-600, sky-50, indigo-700 ...). Instead of
// rewriting 26 pages, blue/sky/indigo are mapped onto one blueprint ink scale, violet onto plum and
// cyan/teal onto steel, so every page speaks the same colours. Semantic hues stay: emerald = đúng/hoàn thành, amber = lưu ý,
// red/rose = lỗi/sai. Orange is the single accent, like the red pencil marks on a drawing.
const ink = {
  50: '#eef3f8',
  100: '#dce6f0',
  200: '#bccbdc',
  300: '#91a9c3',
  400: '#6585a8',
  500: '#44678e',
  600: '#1f4e79',
  700: '#183f63',
  800: '#12304d',
  900: '#0c2338',
  950: '#071626',
}

// Second and third pencil colours, kept so categories (khối điều khiển, truyền lực ...) stay apart
const plum = { 50: '#f6f3f8', 100: '#ebe4f0', 200: '#d6c8e0', 300: '#b8a2c8', 400: '#9478a9', 500: '#775a8e', 600: '#604675', 700: '#4d385e', 800: '#3b2b48', 900: '#2b2035', 950: '#1c1424' }
const steel = { 50: '#eef6f7', 100: '#d5eaec', 200: '#acd4d8', 300: '#7db8bf', 400: '#4f99a2', 500: '#317d87', 600: '#24646d', 700: '#1d5058', 800: '#173f46', 900: '#112f34', 950: '#0a1d20' }

const accent = {
  50: '#fff4ec',
  100: '#ffe4d0',
  200: '#fdc59f',
  300: '#f8a06b',
  400: '#f17f3e',
  500: '#e2661f',
  600: '#c55315',
  700: '#9f4213',
  800: '#7d3514',
  900: '#652d13',
  950: '#381507',
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink,
        accent,
        blue: ink,
        sky: ink,
        indigo: ink,
        violet: plum,
        purple: plum,
        fuchsia: plum,
        cyan: steel,
        teal: steel,
        orange: accent,
        'primary': ink[600],
        'secondary': '#1d7a55',
        'danger': '#c2362b',
        'warning': '#b7791f',
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
      },
      fontWeight: {
        // Heavy weights read as shouting on a drawing sheet; keep the hierarchy, lower the volume.
        extrabold: '700',
        black: '700',
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
        lg: '5px',
        xl: '6px',
        '2xl': '8px',
        '3xl': '10px',
      },
      boxShadow: {
        sm: '0 1px 0 rgb(12 35 56 / 0.05)',
        DEFAULT: '0 1px 2px rgb(12 35 56 / 0.08)',
        md: '0 2px 0 rgb(12 35 56 / 0.05), 0 6px 14px -8px rgb(12 35 56 / 0.22)',
        lg: '0 2px 0 rgb(12 35 56 / 0.05), 0 12px 24px -14px rgb(12 35 56 / 0.3)',
        xl: '0 2px 0 rgb(12 35 56 / 0.06), 0 18px 32px -18px rgb(12 35 56 / 0.35)',
        '2xl': '0 2px 0 rgb(12 35 56 / 0.06), 0 24px 44px -22px rgb(12 35 56 / 0.4)',
      },
    },
  },
  plugins: [forms],
}
