# Google Fonts Used

This project uses Google Fonts for optimal performance and reliability:

## Primary Typography
- **Crimson Text** - Serif font for headings and elegant text
  - Weights: 400, 600, 700 (regular and italic)
  - URL: https://fonts.google.com/specimen/Crimson+Text
  
- **Josefin Sans** - Sans-serif font for body text and UI elements
  - Weights: 100-700 (all weights, regular and italic)
  - URL: https://fonts.google.com/specimen/Josefin+Sans

## Implementation
- Fonts are loaded via Google Fonts CDN
- Preloaded in BaseLayout.astro for performance
- Configured in Tailwind as `font-crimson` and `font-josefin`
- Font-display: swap for optimal loading

## Custom Fonts (Optional)
If you need to add custom brand fonts in the future, place them in this folder and update:
1. `src/styles/globals.css` - Add @font-face declarations
2. `tailwind.config.mjs` - Add to fontFamily configuration