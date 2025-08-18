/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // TheSolo Brand Colors from Figma
        'brand': {
          'dark': '#102B2A',     // Main dark green
          'gold': '#C49A85',     // Brand gold/copper
          'accent': '#588157',   // Green accent
          'dark-card': '#0D1B1E' // Card backgrounds
        },
        'neutral': {
          'light': '#F5F5F5',
          'gray': '#7D7D7D'
        }
      },
      fontFamily: {
        'crimson': ['Crimson Text', 'serif'],
        'josefin': ['Josefin Sans', 'sans-serif']
      },
      fontSize: {
        'hero': ['70px', '1.14'],
        'display': ['80px', '1.6'],
        'title-xl': ['128px', '1'],
        'title-lg': ['64px', '1.16'],
        'title-md': ['32px', '1.31'],
        'title-sm': ['30px', '1.4'],
        'body-lg': ['25px', '1.4'],
        'body': ['20px', '1.5'],
        'body-sm': ['18px', '1.67'],
        'caption': ['16px', '1.5'],
        'small': ['14px', '1.43']
      },
      borderRadius: {
        'xl': '20px',
        '2xl': '30px'
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem'
      },
      maxWidth: {
        'container': '1920px'
      }
    }
  },
  plugins: []
};