import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import compress from 'astro-compress';
export default defineConfig({
  site: process.env.SITE_URL || 'https://www.thesolo.co.uk',
  /*
   * prefetchAll with the default strategy pulls every internal link on the page
   * while it is still loading. On the homepage that is a dozen documents, and
   * the trace showed /menu/ and /reservation/ arriving before the first paint,
   * competing with the hero for bandwidth on a phone.
   *
   * Prefetch on intent instead: the visitor hovers on a desktop or starts a tap
   * on a phone, and only then is the next page fetched. The navigation still
   * feels instant, and nothing is downloaded before the current page is drawn.
   */
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    tailwind(),
    mdx(),
    // Every route is generated from src/pages, so the sitemap is complete without
    // customPages. The previous customPages list re-declared each page a second
    // time on the bare domain and without a trailing slash, putting two URL forms
    // for the same page into the sitemap.
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date()
    }),
    compress({
      CSS: true,
      HTML: {
        // astro-compress re-minifies the body of every <script> whose type is in
        // processScripts — application/ld+json included. That collapses runs of
        // whitespace inside JSON string values, so structured data can silently
        // drift from the source it was generated from. Nothing here relies on
        // script minification, so the list is emptied.
        // Comments stay stripped, as they already were: the previous
        // 'remove-comments' key was never a recognised option, so it silently
        // did nothing and the minifier default applied.
        'html-minifier-terser': {
          processScripts: [],
          removeComments: true
        }
      },
      Image: false,
      JavaScript: true,
      SVG: true
    })
  ],
  output: 'static',
  // Every page used to answer on two URLs — /about and /about/ both returned 200
  // with no redirect between them, so each page competed with itself.
  //
  // The trailing-slash form is the one kept, because Astro's directory build
  // already emits it and the canonical tags, sitemap and breadcrumbs are all
  // built from it. vercel.json redirects the slash-less form to it, and the
  // internal links were updated to match so no click pays for a redirect.
  //
  // build.format 'file' was tried first and rejected: it puts ".html" into
  // Astro.url.pathname, which then leaks into every canonical tag.
  trailingSlash: 'always',
  build: {
    /*
     * The stylesheet is one render-blocking round trip on every first visit:
     * about 12 KB over the wire, but the browser cannot paint until it lands.
     * 'always' folds it into the HTML, which brotli already compresses along
     * with the markup, so first paint no longer waits for a second request.
     * The trade is that the CSS is not cached across page navigations; on a
     * site this small, and with most visitors arriving on one page, the earlier
     * paint is worth more.
     */
    inlineStylesheets: 'always',
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