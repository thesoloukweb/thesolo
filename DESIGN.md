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
- The menu grid is two columns on phones, three from 1024px, and lives in one component shared by the home
  page and /menu/ so the two cannot drift.
- Film: silent, looped, encoded twice (AV1 WebM, H.264 MP4) at two sizes, loaded only after `window.load`. Poster is the LCP element.
- Stylesheets are inlined into the HTML (`build.inlineStylesheets: 'always'`) so first paint never waits on a second request.

## Facts that appear in design (identical to Google Business Profile)

- Museum Gardens, Cambridge Heath Road, London E2 9PA
- 020 8014 2656
- Open daily from 10:00 (Mon to Thu until 23:30, Fri and Sat until 00:30, Sun until 23:30)

## Hero (September 2026)

Direction: **the film as a mounted print**, not a background. Chosen by a design panel that scored four
independent concepts under three lenses (brand, guest, engineering).

- The film hangs inside a copper hairline mount (`--line: rgba(196,154,133,.62)`, 8px gap) on the green page.
  Legibility comes from geometry, not from darkening the film: text sits on the green mat, outside the print.
- The only scrim is a fixed-size radial corner floor under the word "Solo" (460x210px), so it never grows
  with the viewport and never washes the picture.
- The name rises out of the print's lower edge; the mount rule passes through the word space between
  "The" and "Solo". Left margin `--mL` scales with the H1 so the straddle holds from 1024px up.
- Under it a caption line, set like the foot of a printed menu: hours, address, phone, and the pause control
  as its last cell.
- Entrance: the four mount hairlines draw themselves clockwise, the type rises, the caption rule draws and
  its cells fade in, then the film wakes 1.1s after load and crossfades over the poster.
- Mobile: the print becomes a portrait card taking 46% of the screen; "The Solo" notches into it as a solid
  green tab. Copper CTA and a Menu link sit in thumb reach.

Header: `<Header overlay />` on the homepage only. Transparent on the mat at the top, solid
(`rgba(16,43,42,.9)` plus 12px blur) past 24px of scroll or whenever the mobile menu is open. Every other
page renders the solid bar server-side, so there is no transparent flash. The header publishes its own
height as `--site-header-h`, which the hero's first grid row reserves.

Measured on the built site: LCP is the poster image (mobile 112ms, desktop 108ms), CLS 0.0000, contrast of
the ground under "Solo" 5.59 / 5.00 / 6.37 across three scenes of the film, film requested 1.1s after load,
zero video bytes under `prefers-reduced-motion`, Save-Data or 2G.
