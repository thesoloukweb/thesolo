import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import compress from 'astro-compress';

export default defineConfig({
  site: process.env.SITE_URL || 'https://thesolo.co.uk',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  },
  integrations: [
    tailwind(),
    mdx(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      customPages: [
        'https://thesolo.co.uk/',
        'https://thesolo.co.uk/about',
        'https://thesolo.co.uk/menu',
        'https://thesolo.co.uk/gallery',
        'https://thesolo.co.uk/contact',
        'https://thesolo.co.uk/reservation',
        'https://thesolo.co.uk/blog'
      ]
    }),
    compress({
      CSS: true,
      HTML: {
        'remove-comments': false
      },
      Image: false,
      JavaScript: true,
      SVG: true
    })
  ],
  output: 'hybrid',
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro'
  },
  vite: {
    css: {
      devSourcemap: true
    },
    build: {
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    }
  }
});