#!/usr/bin/env node
/**
 * Library Season 1 — Production Visual Asset Generator
 *
 * Builds the production-scale visual assets required by the Library Season 1
 * Visual Asset System brief:
 *   - Library hero (3840x1600, 12:5)
 *   - Collection covers (2400x1600) + thumbnails (600x400)
 *   - Experience heroes (1600x900) + thumbnails (1200x900)
 *   - ASSET_MANIFEST.json (per-asset registry of the WHOLE system)
 *
 * This generator EXTENDS the existing illustration system rather than
 * duplicating it. It imports the parametric motif functions
 * (collectionIllustrationBody, experienceMotifBody, patternBody, ...) from
 * scripts/generate-library-season-1-assets.mjs so every production asset stays
 * visually consistent with the base asset set and the collection palettes that
 * live in src/content/assets/illustration-manifest.json (the single source of
 * truth for color, motif, and caption).
 *
 * Output root: public/assets/library/
 *   hero/library-season-1/library-hero.svg
 *   collections/{collection}/cover.svg | thumbnail.svg
 *   experiences/{experience-id}/hero.svg | thumbnail.svg
 *   ASSET_MANIFEST.json
 *
 * Run manually:
 *   node scripts/generate-library-production-assets.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  svg,
  iconBody,
  patternBody,
  collectionIllustrationBody,
  experienceMotifBody,
} from './generate-library-season-1-assets.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'src/content/assets/illustration-manifest.json');
const ASSET_ROOT = path.join(ROOT, 'public/assets/library');
const BASE_ROOT = path.join(ROOT, 'public/assets/library-season-1');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const collections = manifest.collections;
const experiences = manifest.experiences;

const COLLECTION_IDS = Object.keys(collections);

// The eight featured Season 1 experiences, using the prefixed editorial IDs
// mandated by the brief. `slug` cross-references the canonical id used across
// the rest of the platform (content + illustration manifest).
const FEATURED_EXPERIENCES = [
  { id: 'h001-dueling-accounts', slug: 'dueling-accounts', collectionPrefix: 'History' },
  { id: 'c002-constraint', slug: 'constraint', collectionPrefix: 'Creativity' },
  { id: 'e001-bridge-builder', slug: 'bridge-builder', collectionPrefix: 'Engineering' },
  { id: 'e003-optimization', slug: 'optimization', collectionPrefix: 'Engineering' },
  { id: 'x001-attention', slug: 'attention', collectionPrefix: 'Society & Mind' },
  { id: 'm005-proof', slug: 'proof', collectionPrefix: 'Mathematics' },
  { id: 'n005-watershed', slug: 'watershed', collectionPrefix: 'Nature' },
  { id: 'f003-pattern-garden', slug: 'pattern-garden', collectionPrefix: 'Foundations' },
];

const assetEntries = [];

function ensure(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(relPath, content) {
  const full = path.join(ASSET_ROOT, relPath);
  ensure(path.dirname(full));
  // Production assets must contain no <text> elements (titles/descriptions are
  // delivered via <title>/<desc>, which are unaffected here). The shared
  // mathematics motif emits diagrammatic text glyphs; strip them so every
  // production SVG complies with the "no text elements" requirement.
  const cleaned = content.replace(/<text\b[^>]*>[\s\S]*?<\/text>/g, '');
  fs.writeFileSync(full, cleaned.trim() + '\n');
  return path.relative(ROOT, full).replace(/\\/g, '/');
}

function register({ asset, type, collection, purpose, dimensions, format = 'svg', usage }) {
  assetEntries.push({ asset, type, collection, purpose, dimensions, format, usage });
}

function dims(W, H) {
  return `${W}x${H}`;
}

function titleCase(slug) {
  return slug
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/**
 * Compute a uniform (non-distorting) translate+scale that fits a design drawn
 * in `spaceW` x `spaceH` centered inside the box [boxX,boxY,boxW,boxH] with the
 * given padding. Motifs are authored in a fixed coordinate space; this keeps
 * their proportions intact across any target canvas.
 */
function fitTransform(spaceW, spaceH, boxX, boxY, boxW, boxH, pad) {
  const innerW = Math.max(1, boxW - 2 * pad);
  const innerH = Math.max(1, boxH - 2 * pad);
  const s = Math.min(innerW / spaceW, innerH / spaceH);
  const drawnW = spaceW * s;
  const drawnH = spaceH * s;
  return {
    s,
    tx: boxX + (boxW - drawnW) / 2,
    ty: boxY + (boxH - drawnH) / 2,
  };
}

// ---------------------------------------------------------------------------
// Collection cover + thumbnail
// ---------------------------------------------------------------------------

function collectionCoverBody(id, p, W, H) {
  const margin = Math.round(H * 0.06);
  // Reserve a bottom band for the collection's pattern accent.
  const bottomBand = Math.round(H * 0.16);
  // Fit the 640x420 collection illustration UNIFORMLY inside the upper area.
  const availH = H - margin - bottomBand;
  const availW = W - 2 * margin;
  const ratio = 640 / 420;
  let artScale = availH / 420;
  if (640 * artScale > availW) artScale = availW / 640;
  const artW = 640 * artScale;
  const artH = 420 * artScale;
  const ox = (W - artW) / 2;
  const oy = margin + (availH - artH) / 2;

  // Pattern band: a single centered collection-pattern motif (lightweight and
  // editorial rather than a busy tiled field), capped by a thin rule.
  const bandY = H - bottomBand + Math.round(bottomBand * 0.30);
  const bandScale = (bottomBand * 0.55) / 240;
  const motifPx = 240 * bandScale;
  const px = (W - motifPx) / 2;
  const patternAccent = `<g transform="translate(${px} ${bandY}) scale(${bandScale})" opacity="0.5">${patternBody(id, p)}</g>`;

  // Small identity badge (collection icon) bottom-left.
  const badgeFit = fitTransform(64, 64, margin, H - margin - Math.round(H * 0.10), Math.round(H * 0.10), Math.round(H * 0.10), 6);

  return `
    <rect width="${W}" height="${H}" fill="${p.surface}"/>
    <rect x="${Math.round(margin / 2)}" y="${Math.round(margin / 2)}" width="${W - margin}" height="${H - margin}" rx="${Math.round(H * 0.04)}" fill="${p.surfaceAlt}" opacity="0.34"/>
    ${collectionIllustrationBody(id, p, ox, oy, artW, artH)}
    ${patternAccent}
    <line x1="${margin}" y1="${bandY}" x2="${W - margin}" y2="${bandY}" stroke="${p.secondary}" stroke-width="${Math.max(1, Math.round(bandScale * 1.5))}" opacity="0.35"/>
    <g transform="translate(${badgeFit.tx} ${badgeFit.ty}) scale(${badgeFit.s})">
      <rect width="64" height="64" rx="16" fill="${p.surface}"/>
      ${iconBody(id, p)}
    </g>
  `;
}

// Collection icon body is the single shared 64x64 icon implementation,
// imported from the base generator (kept in sync via the shared manifest).

// ---------------------------------------------------------------------------
// Experience hero + thumbnail
// ---------------------------------------------------------------------------

function experienceArtworkBody(meta, p, W, H) {
  // Experience motifs are authored in a 320x220 design space. Leave an open
  // left zone for future text overlay; place the motif on a framed card on the
  // right, scaled UNIFORMLY so it never distorts.
  const margin = Math.round(H * 0.08);
  const cardW = Math.round(W * 0.46);
  const cardX = W - cardW - Math.round(W * 0.05);
  const cardY = margin;
  const cardH = H - 2 * margin;

  const fit = fitTransform(320, 220, cardX, cardY, cardW, cardH, Math.round(cardW * 0.08));

  return `
    <rect width="${W}" height="${H}" fill="${p.surface}"/>
    <rect x="${Math.round(margin / 2)}" y="${Math.round(margin / 2)}" width="${W - margin}" height="${H - margin}" rx="${Math.round(H * 0.05)}" fill="${p.surfaceAlt}" opacity="0.34"/>
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${Math.round(cardW * 0.06)}" fill="#ffffff" opacity="0.72" stroke="${p.secondary}" stroke-width="${Math.max(2, Math.round(W / 800))}"/>
    <g transform="translate(${fit.tx} ${fit.ty}) scale(${fit.s})">${experienceMotifBody(meta.motif, p)}</g>
    <path d="M${margin} ${H - margin} C ${Math.round(W * 0.28)} ${H - margin * 2} ${Math.round(W * 0.42)} ${H - margin} ${cardX - Math.round(W * 0.02)} ${H - margin * 1.4}" stroke="${p.accent}" stroke-width="${Math.max(3, Math.round(W / 600))}" opacity="0.5" stroke-linecap="round" fill="none"/>
    <line x1="${margin}" y1="${H - margin}" x2="${Math.round(W * 0.4)}" y2="${H - margin}" stroke="${p.secondary}" stroke-width="${Math.max(1, Math.round(W / 1600))}" opacity="0.3"/>
  `;
}

// ---------------------------------------------------------------------------
// Library hero (3840x1600, 12:5)
// ---------------------------------------------------------------------------

function libraryHeroBody() {
  const W = 3840;
  const H = 1600;
  const neutral = '#F4F1EA';
  const neutralAlt = '#E5E0D7';
  const ink = '#2E3F57';
  const accent = '#D48A3A';

  // Right-side 4x2 grid of collection pattern tiles (open left zone for text).
  const gridX0 = 2020;
  const gridY0 = 360;
  const tile = 380;
  const gap = 30;
  const cols = 4;

  let tiles = '';
  COLLECTION_IDS.forEach((id, idx) => {
    const p = collections[id].palette;
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = gridX0 + col * (tile + gap);
    const y = gridY0 + row * (tile + gap);
    const cid = `hero-clip-${id}`;
    const s = tile / 240;
    tiles += `
      <clipPath id="${cid}"><rect x="${x}" y="${y}" width="${tile}" height="${tile}" rx="${Math.round(tile * 0.18)}"/></clipPath>
      <g clip-path="url(#${cid})">
        <rect x="${x}" y="${y}" width="${tile}" height="${tile}" fill="${p.surface}"/>
        <g transform="translate(${x} ${y}) scale(${s})">${patternBody(id, p)}</g>
      </g>
      <rect x="${x}" y="${y}" width="${tile}" height="${tile}" rx="${Math.round(tile * 0.18)}" fill="none" stroke="${p.secondary}" stroke-width="3" opacity="0.8"/>`;
  });

  // Faint editorial bookmark watermark on the open left zone.
  const bkm = `
    <g transform="translate(300 360)" opacity="0.12">
      <path d="M0 0 H520 A40 40 0 0 1 560 40 V900 L280 700 L0 900 V40 A40 40 0 0 1 40 0 Z" fill="none" stroke="${ink}" stroke-width="14"/>
      <line x1="80" y1="220" x2="480" y2="220" stroke="${accent}" stroke-width="14"/>
    </g>`;

  return `
    <rect width="${W}" height="${H}" fill="${neutral}"/>
    <rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="60" fill="${neutralAlt}" opacity="0.4"/>
    ${bkm}
    <line x1="300" y1="360" x2="300" y2="1240" stroke="${ink}" stroke-width="4" opacity="0.18"/>
    <g>${tiles}</g>
    <path d="M${gridX0 - 40} ${gridY0 + tile * 2 + gap + 60} C ${gridX0 + 400} ${H - 180} ${gridX0 + 1000} ${H - 240} ${W - 120} ${H - 160}" stroke="${accent}" stroke-width="12" opacity="0.4" stroke-linecap="round" fill="none"/>
  `;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

// 1) Library hero
const heroPath = write(
  'hero/library-season-1/library-hero.svg',
  svg({
    width: 3840,
    height: 1600,
    viewBox: '0 0 3840 1600',
    title: 'ITTYBITTYBITES Library Season 1 hero',
    desc: 'Wide editorial hero banner with an open left zone for a text overlay and a grid of eight collection pattern tiles on the right.',
    body: libraryHeroBody(),
  }),
);
register({
  asset: heroPath,
  type: 'hero',
  collection: 'library-season-1',
  purpose: 'library-hero',
  dimensions: dims(3840, 1600),
  usage: 'Main website hero. Left ~45% intentionally left open for headline text overlay.',
});

// 2) Collection covers + thumbnails
for (const id of COLLECTION_IDS) {
  const meta = collections[id];
  const p = meta.palette;

  const coverPath = write(
    `collections/${id}/cover.svg`,
    svg({
      width: 2400,
      height: 1600,
      viewBox: '0 0 2400 1600',
      title: `${meta.title} collection cover`,
      desc: `${meta.direction} Collection cover artwork at master resolution.`,
      body: collectionCoverBody(id, p, 2400, 1600),
    }),
  );
  register({
    asset: coverPath,
    type: 'cover',
    collection: id,
    purpose: 'collection-cover',
    dimensions: dims(2400, 1600),
    usage: `Master cover artwork for the ${meta.title} collection. Use for collection detail headers and feature placements.`,
  });

  const thumbPath = write(
    `collections/${id}/thumbnail.svg`,
    svg({
      width: 600,
      height: 400,
      viewBox: '0 0 600 400',
      title: `${meta.title} collection thumbnail`,
      desc: `${meta.direction} Collection thumbnail artwork.`,
      body: collectionCoverBody(id, p, 600, 400),
    }),
  );
  register({
    asset: thumbPath,
    type: 'thumbnail',
    collection: id,
    purpose: 'collection-thumbnail',
    dimensions: dims(600, 400),
    usage: `Compact thumbnail for the ${meta.title} collection. Use in collection cards, shelves, and list previews.`,
  });
}

// 3) Experience heroes + thumbnails (8 featured experiences)
for (const feat of FEATURED_EXPERIENCES) {
  const expMeta = experiences[feat.slug];
  const colMeta = collections[expMeta.collection];
  const p = colMeta.palette;
  const label = titleCase(feat.slug);

  const heroP = write(
    `experiences/${feat.id}/hero.svg`,
    svg({
      width: 1600,
      height: 900,
      viewBox: '0 0 1600 900',
      title: `${label} experience hero`,
      desc: expMeta.caption,
      body: experienceArtworkBody({ ...expMeta }, p, 1600, 900),
    }),
  );
  register({
    asset: heroP,
    type: 'hero',
    collection: expMeta.collection,
    purpose: 'experience-hero',
    dimensions: dims(1600, 900),
    usage: `Hero artwork for the ${label} experience (${feat.slug}). Open left zone reserved for title/caption overlay.`,
  });

  const thumbP = write(
    `experiences/${feat.id}/thumbnail.svg`,
    svg({
      width: 1200,
      height: 900,
      viewBox: '0 0 1200 900',
      title: `${label} experience thumbnail`,
      desc: expMeta.caption,
      body: experienceArtworkBody({ ...expMeta }, p, 1200, 900),
    }),
  );
  register({
    asset: thumbP,
    type: 'thumbnail',
    collection: expMeta.collection,
    purpose: 'experience-thumbnail',
    dimensions: dims(1200, 900),
    usage: `Thumbnail artwork for the ${label} experience (${feat.slug}). Use in experience cards and index grids.`,
  });
}

// 4) Register the existing base asset set so the manifest is the single registry
//    future agents can query before creating new assets.
function readSvgDims(filePath) {
  const txt = fs.readFileSync(filePath, 'utf8');
  const m = txt.match(/<svg[^>]*\swidth="(\d+)"\s+height="(\d+)"/);
  return m ? `${m[1]}x${m[2]}` : 'svg';
}

function registerBaseAssets() {
  const typeByFolder = {
    icons: { type: 'icon', folder: 'icons' },
    'collection-badges': { type: 'badge', folder: 'collection-badges' },
    patterns: { type: 'pattern', folder: 'patterns' },
    backgrounds: { type: 'background', folder: 'backgrounds' },
  };
  const usageByType = {
    icon: 'Reusable monochrome collection icon (colored via CSS at runtime).',
    badge: 'Compact collection emblem for lists, context markers, and progress surfaces.',
    pattern: 'Low-contrast SVG pattern field used to add atmosphere without overwhelming content.',
    background: 'Large-format collection backdrop for seasonal reuse.',
    illustration: 'Diagrammatic editorial illustration explaining a concept.',
  };

  // Collection-keyed flat folders.
  for (const [folder, info] of Object.entries(typeByFolder)) {
    const dir = path.join(BASE_ROOT, info.folder);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.svg'))) {
      const id = f.replace(/\.svg$/, '');
      const full = path.join(dir, f);
      const isBookmark = id === 'bookmark';
      register({
        asset: path.relative(ROOT, full).replace(/\\/g, '/'),
        type: isBookmark ? 'icon' : info.type,
        collection: isBookmark ? 'shared' : id,
        purpose: isBookmark ? 'bookmark-icon' : `${info.type}`,
        dimensions: readSvgDims(full),
        usage: isBookmark ? 'Editorial bookmark icon used for saved items across the platform.' : usageByType[info.type],
      });
    }
  }

  // Collection illustrations.
  const colIllDir = path.join(BASE_ROOT, 'illustrations/collections');
  if (fs.existsSync(colIllDir)) {
    for (const f of fs.readdirSync(colIllDir).filter((x) => x.endsWith('.svg'))) {
      const id = f.replace(/\.svg$/, '');
      const full = path.join(colIllDir, f);
      register({
        asset: path.relative(ROOT, full).replace(/\\/g, '/'),
        type: 'illustration',
        collection: id,
        purpose: 'collection-illustration',
        dimensions: readSvgDims(full),
        usage: `Wide-format illustration for the ${collections[id]?.title || id} collection. Used in collection cards and featured sections (referenced by renderCollectionIllustration).`,
      });
    }
  }

  // Experience illustrations (legacy single small hero illustration per experience).
  const expIllDir = path.join(BASE_ROOT, 'illustrations/experiences');
  if (fs.existsSync(expIllDir)) {
    for (const f of fs.readdirSync(expIllDir).filter((x) => x.endsWith('.svg'))) {
      const slug = f.replace(/\.svg$/, '');
      const full = path.join(expIllDir, f);
      const expMeta = experiences[slug];
      register({
        asset: path.relative(ROOT, full).replace(/\\/g, '/'),
        type: 'illustration',
        collection: expMeta?.collection || 'unknown',
        purpose: 'experience-illustration',
        dimensions: readSvgDims(full),
        usage: `Diagrammatic illustration for the ${titleCase(slug)} experience. Referenced by renderExperienceArtwork/renderExperienceFigure.`,
      });
    }
  }

  // Base asset index.
  const indexFull = path.join(BASE_ROOT, 'asset-index.json');
  if (fs.existsSync(indexFull)) {
    register({
      asset: path.relative(ROOT, indexFull).replace(/\\/g, '/'),
      type: 'index',
      collection: 'library-season-1',
      purpose: 'folder-index',
      dimensions: 'n/a',
      format: 'json',
      usage: 'Folder-level index of the base asset set (collections, experiences, folders).',
    });
  }
}

registerBaseAssets();

// 5) Register the manifest itself, then write ASSET_MANIFEST.json once with
//    accurate counts (per-asset registry of the whole system).
assetEntries.sort((a, b) => a.asset.localeCompare(b.asset));

register({
  asset: path.relative(ROOT, path.join(ASSET_ROOT, 'ASSET_MANIFEST.json')).replace(/\\/g, '/'),
  type: 'manifest',
  collection: 'library-season-1',
  purpose: 'asset-registry',
  dimensions: 'n/a',
  format: 'json',
  usage: 'This file. The canonical registry of every visual asset in the system.',
});

assetEntries.sort((a, b) => a.asset.localeCompare(b.asset));

const manifestOut = {
  schemaVersion: '1.0.0',
  generatedAt: new Date().toISOString(),
  season: 'library-season-1',
  description:
    'Per-asset registry for the ITTYBITTYBITES Library Season 1 visual asset system. Query this file before creating any new asset to avoid duplicates and to follow the established naming, dimensions, and placement conventions.',
  namingConvention:
    'category-purpose-variant — e.g. collection-foundations-cover, experience-e003-optimization-thumbnail, pattern-mathematics-symmetry, icon-discovery. Production assets realize this logical name as a path: assets/library/{category}/{id}/{purpose}.svg. Legacy base assets keep their flat {id}.svg names under assets/library-season-1/ and remain referenced by live code.',
  roots: {
    production: 'public/assets/library',
    base: 'public/assets/library-season-1',
  },
  counts: {
    total: assetEntries.length,
    production: assetEntries.filter((e) => e.asset.startsWith('public/assets/library/')).length,
    base: assetEntries.filter((e) => e.asset.startsWith('public/assets/library-season-1/')).length,
  },
  fields: ['asset', 'type', 'collection', 'purpose', 'dimensions', 'format', 'usage'],
  assets: assetEntries,
};

fs.writeFileSync(path.join(ASSET_ROOT, 'ASSET_MANIFEST.json'), JSON.stringify(manifestOut, null, 2) + '\n');

const production = assetEntries.filter((e) => e.asset.startsWith('public/assets/library/')).length;
const base = assetEntries.filter((e) => e.asset.startsWith('public/assets/library-season-1/')).length;
console.log(`✅ Generated Library Season 1 production visual assets in ${path.relative(ROOT, ASSET_ROOT)}`);
console.log(`   ${production} production assets + ${base} registered base assets = ${assetEntries.length} total in ASSET_MANIFEST.json`);
