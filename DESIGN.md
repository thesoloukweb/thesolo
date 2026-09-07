# Design system: The Solo Kitchen & Bar

Source of truth for visual decisions on thesolo.co.uk. Tokens come from the client's Figma and live in `tailwind.config.mjs` and `src/styles/globals.css`; this file records the intent behind them and the rules that are not visible in code.

## Palette

| Token | Hex | Role |
|---|---|---|
| `brand-dark` | `#102B2A` | Page background, primary text on copper surfaces |
| `brand-dark-card` | `#0D1B1E` | Card and panel backgrounds |
| `brand-gold` | `#C49A85` | Copper accent: eyebrows, rules, primary buttons, hover states |
| `brand-accent` | `#588157` | Green accent, sparingly |
| warm cream | `#F3ECE4` | Large light text over film and photography (never pure white in big areas) |

Rules
- Copper as a background always carries `brand-dark` text (WCAG AA fails with white on copper).
- Light text on `brand-dark` may use white; over film or photos prefer warm cream.
- No gradient text, no neon, no purple or blue gradients, no glass cards.

## Typography

Self-hosted in `public/fonts/`, declared in `src/styles/fonts.css`.

| Role | Family | Weights available |
|---|---|---|
| Display and headings | Crimson Text | 400, 600, 700 (regular only, no italics exist: never use faux italic) |
| Body, labels, UI | Josefin Sans | 300, 400, 500, 600, 700 |

Rules
- Headings use Crimson Text 400 by default; 600 only for emphasis inside a heading.
- Labels and eyebrows: Josefin Sans, uppercase, tracking 0.18em to 0.24em, 11px to 13px.
- Light text on dark backgrounds gets +0.05 line-height.
- Fluid sizes use `clamp()`; steps at least 1.25x apart.

## Layout

- `container-custom`: max 1920px, padding 16 / 24 / 24 / 32px by breakpoint.
- Header is fixed: Blue Light Card banner (32px) plus nav (about 105px desktop, 100px mobile).
- Sections carry `bg-brand-dark`; photography and film provide the light.
- Left-anchored or deliberately asymmetric compositions over centred stacks.

## Motion

- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` for entrances and hovers, 500 to 1000ms. No linear, no ease-in-out, no bounce.
- Animate `transform` and `opacity` only. `backdrop-filter` only on fixed elements.
- Every autoplaying motion longer than 5s has a visible pause control.
- `prefers-reduced-motion: reduce` removes entrances and stops autoplay; the page must read fully static.

## Media

- Photos go through `astro:assets` from `src/assets/` with explicit `width` and `widths`; `public/images/` is legacy.
- Menu cards hold a 4:5 box. Seven of the eight menu photos are portrait (0.67 or 0.80) and the two poster
  designs are exactly 4:5, so this frame crops about 16% on average instead of the 55% a wide box was cutting.
- The menu grid is two columns on phones, three from 768px, four from 1280px, capped at 1400px wide, and
  lives in one component shared by the home page and /menu/ so the two cannot drift.
- Cards are all one height: `auto-rows-fr` levels the rows, the card fills its cell, and the PDF line is
  pushed to the bottom with `mt-auto` so it lines up across a row whatever the copy length.
- Film: silent, looped, encoded twice (AV1 WebM, H.264 MP4) at two sizes, loaded only after `window.load`. Poster is the LCP element.
- Stylesheets are inlined into the HTML (`build.inlineStylesheets: 'always'`) so first paint never waits on a second request.

## Facts that appear in design (identical to Google Business Profile)

- Museum Gardens, Cambridge Heath Road, London E2 9PA
- 020 8014 2656
- Open daily from 10:00 (Mon to Thu until 23:30, Fri and Sat until 00:30, Sun until 23:30)

## Hero (September 2026, third iteration)

Direction: **the whole film, uncropped**, on the client's explicit brief, referencing pink-cafe.co.uk.
The framed-print concept (second iteration) was rejected: the client wants the obvious thing.

- Solid header; beneath it the film edge to edge at width 100% and `aspect-ratio: 16/9`, so nothing is
  ever cut off the sides at any viewport, and at its full 33-second length (the 9-second loop was the
  other complaint). No overlays on the picture, no frame, no scrim.
- On a desktop this is effectively a full-height hero (1440px wide makes the film 810px tall); on a
  phone it is a 219px letterbox band, the honest cost of "never crop", with the content right below.
- Under the film: H1 ("The Solo" cream, "Kitchen & Bar" copper), one-sentence lede, the caption ledger
  (hours, address, phone, pause control), and on phones the copper "Book a table" block.
- Poster is frame 0 of the film (the Bethnal Green Underground sign), so playback takes over seamlessly.
- Encodes v3, full duration, audio stripped: 1600x900 AV1 6.6MB / H.264 7.8MB, 854x480 AV1 2.1MB /
  H.264 2.3MB. Deferred after window.load as before; poster stays the LCP element.
- `#hero { min-height: 100vh }` from globals is overridden to `auto`: the film plus the band define the height.

Measured on the built site at 1440/1920/768/390: media box ratio exactly 1.778 everywhere, video top
equals header bottom, full 33.2s duration reported, pause control visible once playing, no horizontal
overflow.
