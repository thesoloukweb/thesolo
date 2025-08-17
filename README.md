# TheSolo Kitchen & Bar Website

A lightning-fast, SEO-friendly, fully responsive static restaurant website built with Astro, TypeScript, and Tailwind CSS.

## 🎯 Project Overview

**TheSolo Kitchen & Bar** is a Mediterranean restaurant website featuring:
- Modern, elegant design based on Figma specifications
- Static site generation (SSG) for optimal performance
- Fully responsive design for all devices
- SEO optimized with structured data
- Accessibility compliant (WCAG guidelines)

## 🛠 Tech Stack

- **Astro 4+** - Static Site Generator
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first styling
- **Vanilla JavaScript** - Minimal client-side interactivity
- **Google Fonts** - Crimson Text & Josefin Sans typography

## 📄 Pages

- **Home** (`/`) - Hero slider, about, menu preview, events, gallery
- **About** (`/about`) - Restaurant story and team information
- **Menu** (`/menu`) - Full dining menu with categories
- **Gallery** (`/gallery`) - Restaurant photos and ambiance
- **Contact** (`/contact`) - Location, hours, contact form
- **Blog** (`/blog`) - Latest news and updates (optional)

## ✨ Key Features

### Performance
- Lighthouse Performance Score: 95+
- Zero JavaScript by default (islands only where needed)
- Optimized images with modern formats
- Critical CSS inlined

### SEO & Accessibility
- Semantic HTML structure
- Structured data (JSON-LD) for search engines
- Open Graph and Twitter Card meta tags
- WCAG 2.1 AA compliant
- Screen reader friendly

### Interactivity
- Smooth scroll navigation
- Image galleries with lightbox
- Reservation form with email integration
- Menu category filtering
- Mobile-responsive navigation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Add your images**
   - Place restaurant photos in `public/images/`
   - See `public/images/README.md` for required images list
   - Add your custom fonts to `public/fonts/`

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your site details
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.astro
│   ├── Footer.astro
│   ├── HeroSlider.astro
│   ├── AboutSection.astro
│   ├── MenuSection.astro
│   └── ...
├── layouts/             # Page layouts
│   └── BaseLayout.astro
├── pages/               # Route pages
│   ├── index.astro
│   ├── about.astro
│   ├── menu.astro
│   └── ...
├── styles/              # Global styles
│   └── globals.css
└── utils/               # Utility functions
    └── seo.ts

public/
├── fonts/               # Custom font files
├── images/              # Restaurant photos
└── favicon.svg
```

## 🎨 Design System

### Colors
- **Brand Dark**: `#001223` - Primary dark navy
- **Brand Gold**: `#C49A85` - Signature gold/copper accent  
- **Brand Accent**: `#588157` - Supporting green
- **Dark Card**: `#0D1B1E` - Card backgrounds

### Typography
- **Headings**: Crimson Text (serif)
- **Body**: Josefin Sans (sans-serif)
- **Sizes**: Responsive type scale from 14px to 128px

### Components
- Consistent spacing with Tailwind scale
- Rounded corners (20px, 30px standard)
- Smooth hover transitions (300ms)
- Focus states for accessibility

## 📞 Contact Integration

### Reservation System
- Email-based reservations via mailto:
- Prefilled reservation email template
- Form validation and user feedback
- Integration with `bookings@thesolo.co.uk`

### Contact Information
- **Address**: Museum Gardens, Cambridge Heath Road, London E2 9PA
- **Phone**: 0208 0142656
- **Email**: info@thesolo.co.uk
- **Reservations**: bookings@thesolo.co.uk

## 🌐 Deployment

### Recommended Platforms
- **Vercel** (recommended) - Automatic deployments
- **Netlify** - JAMstack optimized
- **GitHub Pages** - Free static hosting

### Build Commands
```bash
# Build command
npm run build

# Output directory
dist/
```

### Environment Variables
```bash
SITE_URL=https://thesolo.co.uk
CONTACT_EMAIL=info@thesolo.co.uk
```

## 🔧 Development

### Custom Fonts
1. Place font files in `public/fonts/`
2. Update `src/styles/globals.css` font-face declarations
3. Reference in `tailwind.config.mjs`

### Adding Images  
1. Add optimized images to `public/images/`
2. Use descriptive filenames
3. Include alt text for accessibility
4. Compress images for web performance

### SEO Configuration
- Update meta tags in `BaseLayout.astro`
- Modify structured data in layout
- Add sitemap entries for new pages
- Configure robots.txt rules

## 📈 Performance Optimization

- **Images**: WebP/AVIF formats with fallbacks
- **CSS**: Critical CSS inlined, non-critical deferred
- **JavaScript**: Islands architecture for minimal client-side code
- **Fonts**: Preloaded critical fonts, swap display
- **Caching**: Aggressive caching headers for static assets

## 🎯 Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)  
- Safari (last 2 versions)
- iOS Safari (last 2 versions)
- Android Chrome (last 2 versions)

## 📋 Todo

- [ ] Add custom font files to `/public/fonts/`
- [ ] Replace placeholder images with actual restaurant photos
- [ ] Configure blog CMS integration (optional)
- [ ] Set up analytics tracking
- [ ] Add OpenTable widget integration
- [ ] Implement PWA features

## 📄 License

This project is built for TheSolo Kitchen & Bar. All rights reserved.

## 🤝 Support

For development support or questions:
- Review component documentation in `/src/components/`
- Check Astro documentation: https://docs.astro.build/
- Tailwind CSS reference: https://tailwindcss.com/docs