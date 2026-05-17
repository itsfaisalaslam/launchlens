/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed',
        secondary: '#38bdf8',
        accent: '#22c55e',
        ink: '#f9fafb',
        mist: '#020617',
        panel: '#0b1220',
        card: '#0f172a',
        line: '#1f2937',
      },
      boxShadow: {
        soft: '0 14px 34px -20px rgba(2, 6, 23, 0.45)',
        float: '0 28px 70px -32px rgba(2, 6, 23, 0.65)',
        glass: '0 18px 48px -28px rgba(2, 6, 23, 0.4)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at 15% 15%, rgba(124, 58, 237, 0.22), transparent 22%), radial-gradient(circle at 82% 20%, rgba(56, 189, 248, 0.16), transparent 24%), radial-gradient(circle at 75% 78%, rgba(34, 197, 94, 0.12), transparent 22%), linear-gradient(180deg, rgba(2,6,23,1), rgba(11,18,32,1))',
        'premium-surface':
          'linear-gradient(180deg, rgba(15,23,42,1), rgba(11,18,32,1))',
        'dark-panel':
          'linear-gradient(180deg, rgba(11,18,32,1), rgba(11,18,32,1))',
        'cta-gradient':
          'linear-gradient(135deg, #7c3aed 0%, #38bdf8 100%)',
        'mesh-fade':
          'radial-gradient(circle at 15% 20%, rgba(124, 58, 237, 0.16), transparent 18%), radial-gradient(circle at 80% 10%, rgba(56, 189, 248, 0.12), transparent 20%), radial-gradient(circle at 70% 80%, rgba(34, 197, 94, 0.10), transparent 22%)',
      },
    },
  },
  plugins: [],
}
