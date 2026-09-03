#!/usr/bin/env node
/**
 * Pull real Google reviews into src/data/reviews.json.
 *
 * Runs before `astro build` (see the "prebuild" script in package.json) and is
 * deliberately non-fatal: if the token is missing, the network is down, or the
 * actor fails, the existing reviews.json is left untouched and the build carries
 * on. A deploy must never break because a third-party scraper had a bad day.
 *
 * Refetching is rate-limited by the age of the committed file, so an ordinary
 * deploy costs nothing; only a build that finds data older than
 * REVIEWS_MAX_AGE_DAYS pays for an actor run.
 *
 *   APIFY_TOKEN              required to fetch; without it the script no-ops
 *   REVIEWS_MAX_AGE_DAYS     default 7
 *   REVIEWS_FORCE=1          refetch regardless of age
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'data', 'reviews.json');

const ACTOR = 'compass~Google-Maps-Reviews-Scraper';
const PLACE_ID = 'ChIJAWxvnYUddkgRYDdKMNbeyTo'; // The Solo Kitchen & Bar
// Official short links from the Google Business Profile. The scraper returns a long
// maps/search URL; these are the ones the business itself hands out.
const PLACE_URL = 'https://g.page/r/CWA3SjDW3sk6EBM';
const REVIEW_URL = 'https://g.page/r/CWA3SjDW3sk6EBM/review';
// Scraping is billed per review and costs roughly $0.45 per 1,000, so pulling a
// wide window is a rounding error: the whole listing is about $0.35 a run. The
// window is wide, the kept set is what the marquee actually needs.
const MAX_SCRAPE = 400;  // pulled from Google
const KEEP = 24;         // kept in the JSON the site reads
const MIN_CHARS = 40;    // a review needs enough words to be worth a card
const MAX_CHARS = 260;

const log = (...a) => console.log('[reviews]', ...a);

/** Node does not read .env.local on its own; the build needs it locally. */
function loadEnvLocal() {
  const p = join(ROOT, '.env.local');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

function readExisting() {
  try {
    return JSON.parse(readFileSync(OUT, 'utf8'));
  } catch {
    return null;
  }
}

function isFresh(existing) {
  if (process.env.REVIEWS_FORCE === '1') return false;
  if (!existing?.fetchedAt || !existing.reviews?.length) return false;
  const days = (Date.now() - Date.parse(existing.fetchedAt)) / 86400000;
  const max = Number(process.env.REVIEWS_MAX_AGE_DAYS || 7);
  if (days < max) {
    log(`existing data is ${days.toFixed(1)} days old (limit ${max}) — skipping fetch`);
    return true;
  }
  return false;
}

/**
 * Google serves avatars at whatever size the scrape happened to capture, so the
 * size suffix is normalised to a 96px square crop. Cards then request one
 * consistent, small file instead of a mix of full-resolution portraits.
 */
function avatar(url) {
  if (!url) return null;
  // Google appends one "=" parameter block that can carry several tokens, e.g.
  // "=s1920-c-rp-mo-br100". The whole block is replaced, not just a trailing "=sNNN".
  return url.replace(/=[a-z0-9-]+$/i, '') + '=s96-c';
}

/** One review as the site needs it — nothing more is stored. */
function normalise(r) {
  const text = (r.text || r.textTranslated || '').trim().replace(/\s+/g, ' ');
  return {
    id: r.reviewId,
    name: (r.name || '').trim(),
    stars: r.stars,
    text,
    publishedAt: r.publishedAtDate || null,
    url: r.reviewUrl || null,
    photo: avatar(r.reviewerPhotoUrl),
    localGuide: Boolean(r.isLocalGuide),
    reviewCount: r.reviewerNumberOfReviews ?? null,
    ownerReply: (r.responseFromOwnerText || '').trim() || null,
  };
}

function usable(r) {
  return r.id && r.name && r.text.length >= MIN_CHARS;
}

/**
 * Newest first, and deliberately NOT filtered or sorted by star rating.
 *
 * Ranking by stars would surface only the five-star reviews, which is the
 * cherry-picking the UK CMA's review guidance describes as misleading. Taking
 * whatever Google returned most recently is defensible: the page shows a
 * genuine, unselected window onto the listing.
 */
function pick(reviews) {
  return reviews
    .filter(usable)
    .sort((a, b) => Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0))
    .slice(0, KEEP)
    .map((r) => ({
      ...r,
      text: r.text.length > MAX_CHARS ? r.text.slice(0, MAX_CHARS).replace(/\s+\S*$/, '') + '…' : r.text,
    }));
}

async function main() {
  loadEnvLocal();
  const existing = readExisting();

  if (isFresh(existing)) return;

  const token = process.env.APIFY_TOKEN;
  if (!token) {
    log('APIFY_TOKEN not set — keeping the committed reviews.json');
    return;
  }

  const input = {
    placeIds: [PLACE_ID],
    maxReviews: MAX_SCRAPE,
    reviewsSort: 'newest',
    reviewsOrigin: 'google', // Google only — the default "all" mixes in Tripadvisor
    language: 'en',
    personalData: true, // reviewer display name; nothing beyond name is stored
  };

  const url = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${token}`;
  log(`fetching up to ${MAX_SCRAPE} reviews for ${PLACE_ID} …`);

  let items;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(280_000),
    });
    if (!res.ok) throw new Error(`Apify responded ${res.status} ${res.statusText}`);
    items = await res.json();
  } catch (err) {
    log(`fetch failed (${err.message}) — keeping the committed reviews.json`);
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    log('actor returned no items — keeping the committed reviews.json');
    return;
  }

  const all = items.map(normalise);
  const kept = pick(all);

  if (kept.length === 0) {
    log(`scraped ${all.length} reviews but none met the display bar — keeping existing file`);
    return;
  }

  // The place-level rating comes back on each item; take it from the first.
  const first = items[0] || {};
  const payload = {
    fetchedAt: new Date().toISOString(),
    source: 'Google',
    placeId: PLACE_ID,
    placeUrl: PLACE_URL,
    reviewUrl: REVIEW_URL,
    totalReviewCount: first.reviewsCount ?? null,
    rating: first.totalScore ?? null,
    scraped: all.length,
    reviews: kept,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n');
  log(`wrote ${kept.length} of ${all.length} reviews · rating ${payload.rating} · total ${payload.totalReviewCount}`);
}

main().catch((err) => {
  log('unexpected error, build continues:', err.message);
});
