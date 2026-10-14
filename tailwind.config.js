/** @type {import('tailwindcss').Config} */
const withAlpha = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        term: {
          bg: withAlpha('term-bg'),
          'bg-2': withAlpha('term-bg-2'),
          fg: withAlpha('term-fg'),
          dim: withAlpha('term-dim'),
          accent: withAlpha('term-accent'),
          link: withAlpha('term-link'),
          ok: withAlpha('term-ok'),
          error: withAlpha('term-error'),
        },
      },
    },
  },
  plugins: [],
}
