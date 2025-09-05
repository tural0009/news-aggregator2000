/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: { bg:'#f9fafb', card:'#ffffff', border:'#e5e7eb', text:'#111827', mutetext:'#6b7280' },
        dark: { bg:'#0b0f14', card:'#0f1520', border:'#1f2937', text:'#e5e7eb', mutetext:'#9ca3af' }
      },
      boxShadow: { soft: '0 8px 24px -12px rgba(0,0,0,0.15)' },
      borderRadius: { xl: '0.75rem', '2xl': '1rem' }
    }
  },
  plugins: []
}
