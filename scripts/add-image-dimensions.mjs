#!/usr/bin/env node
/**
 * Add width and height to <img> tags that declare a literal /images/… source.
 *
 * A browser cannot reserve space for an image whose size it does not know, so
 * the page reflows once each one arrives — the layout shift users see as content
 * jumping. The values are read from the actual files, so they always match the
 * real aspect ratio; CSS keeps controlling the displayed size.
 *
 * Tags whose src is a template expression are skipped: the file behind them is
 * only known at runtime.
 *
 *   node scripts/add-image-dimensions.mjs            # report only
 *   node scripts/add-image-dimensions.mjs --apply    # rewrite the files
 */
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const PUBLIC = join(ROOT, 'public');
const APPLY = process.argv.includes('--apply');

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith('.astro')) yield p;
  }
}

const dims = new Map();
async function sizeOf(webPath) {
  if (dims.has(webPath)) return dims.get(webPath);
  const file = join(PUBLIC, webPath.replace(/^\//, ''));
  let value = null;
  if (existsSync(file)) {
    try {
      const { width, height } = await sharp(file).metadata();
      if (width && height) value = { width, height };
    } catch { /* unreadable — leave the tag alone */ }
  }
  dims.set(webPath, value);
  return value;
}

let added = 0;
const skipped = [];
const missingFiles = new Set();

for (const file of walk(SRC)) {
  const original = readFileSync(file, 'utf8');
  let out = '';
  let last = 0;

  for (const m of original.matchAll(/<img\b[^>]*?>/gs)) {
    const tag = m.group ?? m[0];
    if (/\bwidth=/.test(tag) && /\bheight=/.test(tag)) continue;

    const src = tag.match(/src="(\/images\/[^"]+)"/);
    if (!src) {
      if (/src=\{/.test(tag)) skipped.push([file, 'dynamic src']);
      continue;
    }

    const size = await sizeOf(src[1]);
    if (!size) {
      missingFiles.add(src[1]);
      continue;
    }

    // Insert straight after "<img" so the attributes read naturally.
    const replaced = tag.replace(/^<img/, `<img width="${size.width}" height="${size.height}"`);
    out += original.slice(last, m.index) + replaced;
    last = m.index + tag.length;
    added++;
  }

  out += original.slice(last);
  if (APPLY && out !== original) writeFileSync(file, out);
}

console.log(`${APPLY ? 'added' : 'would add'} dimensions to ${added} <img> tags`);
if (missingFiles.size) {
  console.log(`\n${missingFiles.size} referenced files do not exist in public/:`);
  for (const f of missingFiles) console.log(`  ${f}`);
}
if (skipped.length) console.log(`\n${skipped.length} tags skipped (src is an expression)`);
if (!APPLY) console.log('\ndry run — pass --apply to write');
