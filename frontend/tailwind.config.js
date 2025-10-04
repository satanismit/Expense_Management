/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#C5A65B',
        secondary: '#2C2C2C',
        background: '#F4F4F4',
        textDark: '#222222',
        textLight: '#666666',
        card: '#FFFFFF',
        border: '#E0E0E0',
        borderLight: '#F0F0F0',
        accent: {
          50: '#FDF8F0',
          100: '#F9EFDC',
          200: '#F2DEB8',
          300: '#E8C889',
          400: '#DEB25A',
          500: '#C5A65B',
          600: '#A8904F',
          700: '#8B7A42',
          800: '#6E6435',
          900: '#514E28'
        },
        status: {
          draft: '#9CA3AF',
          submitted: '#D97706',
          approved: '#059669',
          rejected: '#DC2626',
          pending: '#F59E0B'
        },
        gray: {
          50: '#FAFAFA',
          100: '#F4F4F4',
          200: '#E0E0E0',
          300: '#CCCCCC',
          400: '#999999',
          500: '#666666',
          600: '#4A4A4A',
          700: '#2C2C2C',
          800: '#1A1A1A',
          900: '#0D0D0D'
        }
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'button': '0 2px 4px rgba(197, 166, 91, 0.2)',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      }
    },
  },
  plugins: [],
}