/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // 8px grid. Odd values exist only where a hairline border needs compensating.
    spacing: {
      0: '0px', px: '1px', 0.5: '4px', 1: '8px', 1.5: '12px', 2: '16px',
      2.5: '20px', 3: '24px', 3.5: '28px', 4: '32px', 5: '40px', 6: '48px',
      7: '56px', 8: '64px', 9: '72px', 10: '80px', 12: '96px', 14: '112px',
      16: '128px', 20: '160px', 24: '192px',
    },
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        subtle: 'rgb(var(--subtle) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        'line-strong': 'rgb(var(--line-strong) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-2': 'rgb(var(--ink-2) / <alpha-value>)',
        'ink-3': 'rgb(var(--ink-3) / <alpha-value>)',
        brand: 'rgb(var(--brand) / <alpha-value>)',
        'brand-solid': 'rgb(var(--brand-solid) / <alpha-value>)',
        'brand-ink': 'rgb(var(--brand-ink) / <alpha-value>)',
        'brand-wash': 'rgb(var(--brand-wash) / <alpha-value>)',
        good: 'rgb(var(--good) / <alpha-value>)',
        warn: 'rgb(var(--warn) / <alpha-value>)',
        bad: 'rgb(var(--bad) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.08em' }],
        xs: ['11px', { lineHeight: '16px' }],
        sm: ['13px', { lineHeight: '20px' }],
        base: ['15px', { lineHeight: '24px' }],
        lg: ['17px', { lineHeight: '26px' }],
        xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        '2xl': ['26px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
        '3xl': ['34px', { lineHeight: '40px', letterSpacing: '-0.03em' }],
        '4xl': ['46px', { lineHeight: '50px', letterSpacing: '-0.035em' }],
        '5xl': ['62px', { lineHeight: '64px', letterSpacing: '-0.04em' }],
      },
      borderRadius: { xs: '6px', sm: '10px', md: '14px', lg: '18px', xl: '24px', '2xl': '32px' },
      boxShadow: {
        xs: '0 1px 2px rgb(var(--shadow) / 0.05)',
        sm: '0 1px 3px rgb(var(--shadow) / 0.06), 0 1px 2px rgb(var(--shadow) / 0.04)',
        /* Floating chrome (rail, top bar) uses md/lg/xl — lifted enough to read
           as detached from the page without turning into a drop-shadow effect. */
        md: '0 6px 20px -4px rgb(var(--shadow) / 0.14), 0 2px 6px -2px rgb(var(--shadow) / 0.08)',
        lg: '0 14px 36px -8px rgb(var(--shadow) / 0.20), 0 4px 12px -4px rgb(var(--shadow) / 0.10)',
        xl: '0 24px 60px -12px rgb(var(--shadow) / 0.28), 0 8px 20px -8px rgb(var(--shadow) / 0.12)',
        glow: '0 0 0 1px rgb(var(--brand) / 0.25), 0 8px 32px -8px rgb(var(--brand) / 0.35)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'fade-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        blink: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.15 } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        ripple: { to: { transform: 'scale(3)', opacity: 0 } },
        'pop-in': { from: { opacity: 0, transform: 'scale(0.9)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both',
        shimmer: 'shimmer 1.6s infinite',
        blink: 'blink 1s steps(2, start) infinite',
        float: 'float 6s ease-in-out infinite',
        ripple: 'ripple 0.6s ease-out forwards',
        'pop-in': 'pop-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
      },
    },
  },
  plugins: [],
};
