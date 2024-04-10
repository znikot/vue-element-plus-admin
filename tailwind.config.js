/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,ts,jsx,tsx,vue}'],
  theme: {
      extend: {
          boxShadow: {
              'all': '0 1px 5px 2px rgba(0, 0, 0, 0.3)',
          },
          colors: {
              primary: '#1BAC1A',
              'primary-active': '#27de26',
              secondary: '#4166FF',
              'secondary-active': '#417BFF',
              danger: '#E64340',
              'danger-active': '#eb6966',
          },
      },
  },
  plugins: [],
  corePlugins: {
      preflight: false,
      boxShadow: true,
  },
}
