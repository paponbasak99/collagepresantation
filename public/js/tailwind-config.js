// DocBook Global Tailwind CSS Configuration
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    darkMode: ['class', '[data-theme="dark"]'],
    theme: {
      extend: {
        colors: {
          brand: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0f766e',
            700: '#0d7a71',
            800: '#0a5c55',
            900: '#064e47',
            950: '#042f2c'
          },
          cyan: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7'
          },
          ink: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
            950: '#090e17'
          }
        },
        fontFamily: {
          display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
          sans: ['Inter', '-apple-system', 'sans-serif'],
          bangla: ['Noto Sans Bengali', 'Inter', 'sans-serif'],
          mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
        },
        boxShadow: {
          'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.35)',
          'glow-cyan': '0 0 25px -5px rgba(14, 165, 233, 0.35)',
          'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.12)'
        },
        borderRadius: {
          'xs': '4px',
          'sm': '6px',
          'md': '10px',
          'lg': '16px',
          'xl': '24px'
        }
      }
    }
  };
}
