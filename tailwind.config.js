/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0A1520',
          900: '#0F1C2E',
          800: '#1A3E61',
          700: '#1E4A72',
          600: '#24567F',
        },
        gold: {
          DEFAULT: '#C6A76F',
          light: '#D4B87A',
          dark: '#B8965C',
        },
        sand: '#F0E6D2',
        // Light theme surfaces
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8F9FA',
          tertiary: '#F1F3F5',
          border: '#E2E8F0',
          'border-strong': '#CBD5E0',
        },
        // Text hierarchy
        ink: {
          DEFAULT: '#1A202C',
          secondary: '#4A5568',
          tertiary: '#718096',
          muted: '#A0AEC0',
          inverted: '#FFFFFF',
        },
        status: {
          new: '#6B7280',
          contacted: '#1A75CF',
          qualified: '#C6A76F',
          closed: '#28A745',
          lost: '#DC3545',
        },
      },
      fontFamily: {
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        base: ['15px', { lineHeight: '1.6' }],
      },
      boxShadow: {
        // Light theme shadows
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-md': '0 4px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)',
        'card-lg': '0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        'sidebar': '2px 0 8px rgba(0,0,0,0.15)',
        gold: '0 0 0 2px rgba(198,167,111,0.5)',
        'gold-sm': '0 0 0 1px rgba(198,167,111,0.35)',
        floating: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.10)',
        modal: '0 24px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.12)',
      },
      spacing: {
        sidebar: '240px',
        'sidebar-sm': '64px',
        topnav: '57px',
        tabbar: '60px',
      },
      borderRadius: {
        card: '8px',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}
