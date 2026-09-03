#!/usr/bin/env node
/**
 * Re-encode oversized JPEG/PNG files in public/images in place.
 *
 * These files stay in public/ because they are referenced by absolute URL from
 * places that cannot use the astro:assets pipeline — og:image, twitter:image and
 * the Restaurant JSON-LD image array. Dimensions and filenames are unchanged, so
 * every existing reference keeps working; only the encoding improves.
 *
 * The originals are copied to public/images/.original/ on first run, so a bad
 * result can always be restored.
 *
 *   node scripts/recompress-images.mjs            # report only, writes nothing
 *   node scripts/recompress-images.mjs --apply    # rewrite the files
 */
import { readdirSync, statSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'public', 'images');
const BACKUP = join(DIR, '.original');

const APPLY = process.argv.includes('--apply');
const MIN_BYTES = 120 * 1024;   // leave already-small files alone
const MIN_SAVING = 0.20;        // only rewrite when it saves at least 20%
const JPEG = { quality: 80, mozjpeg: true, chromaSubsampling: '4:2:0' };
const PNG = { quality: 80, compressionLevel: 9, palette: true };

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

const kb = (b) => (b / 1024).toFixed(0).padStart(6);

let before = 0;
let after = 0;
let rewritten = 0;
const rows = [];

for (const file of walk(DIR)) {
  const ext = extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

  const size = statSync(file).size;
  if (size < MIN_BYTES) continue;

  const image = sharp(file);
  const meta = await image.metadata();
  const buf = ext === '.png'
    ? await image.png(PNG).toBuffer()
    : await image.jpeg(JPEG).toBuffer();

  const saving = 1 - buf.length / size;
  before += size;

  if (saving < MIN_SAVING) {
    after += size;
    rows.push([basename(file), meta.width, meta.height, size, size, 0, 'skip']);
    continue;
  }

  after += buf.length;
  rows.push([basename(file), meta.width, meta.height, size, buf.length, saving, APPLY ? 'write' : 'would']);

  if (APPLY) {
    mkdirSync(BACKUP, { recursive: true });
    const bak = join(BACKUP, basename(file));
    if (!existsSync(bak)) copyFileSync(file, bak);
    await sharp(buf).toFile(file);
    rewritten++;
  }
}

rows.sort((a, b) => b[3] - a[3]);
console.log(`${'FILE'.padEnd(30)} ${'SIZE'.padStart(10)} ${'BEFORE'.padStart(7)} ${'AFTER'.padStart(7)}  SAVING`);
console.log('-'.repeat(72));
for (const [name, w, h, b, a, s, act] of rows) {
  const tag = act === 'skip' ? '  (already small enough)' : `  ${(s * 100).toFixed(0)}%`;
  console.log(`${name.padEnd(30)} ${`${w}x${h}`.padStart(10)} ${kb(b)} ${kb(a)}${tag}`);
}
console.log('-'.repeat(72));
console.log(`total ${kb(before)} KB -> ${kb(after)} KB  (${((1 - after / before) * 100).toFixed(1)}% smaller)`);
console.log(APPLY ? `rewrote ${rewritten} files; originals in public/images/.original/`
                  : 'dry run — pass --apply to rewrite');
