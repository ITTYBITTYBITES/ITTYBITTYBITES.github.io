#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'src/content/assets/illustration-manifest.json');
const ASSET_ROOT = path.join(ROOT, 'public/assets/library-season-1');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

const dirs = [
  'icons',
  'illustrations/collections',
  'illustrations/experiences',
  'patterns',
  'backgrounds',
  'collection-badges',
];

for (const dir of dirs) {
  fs.mkdirSync(path.join(ASSET_ROOT, dir), { recursive: true });
}

const collections = manifest.collections;
const experiences = manifest.experiences;

const esc = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

function write(relPath, content) {
  fs.writeFileSync(path.join(ASSET_ROOT, relPath), content.trim() + '\n');
}

export function svg({ width, height, viewBox, title, desc, defs = '', body }) {
  const titleId = title ? 'title' + Math.random().toString(36).slice(2, 8) : '';
  const descId = desc ? 'desc' + Math.random().toString(36).slice(2, 8) : '';
  const labelledby = [titleId, descId].filter(Boolean).join(' ');
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}" fill="none" role="img" aria-labelledby="${labelledby}">
  ${title ? `<title id="${titleId}">${esc(title)}</title>` : ''}
  ${desc ? `<desc id="${descId}">${esc(desc)}</desc>` : ''}
  ${defs ? `<defs>${defs}</defs>` : ''}
  ${body}
</svg>`;
}

export function panel(x, y, w, h, fill, stroke, rx = 16, extra = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
}

export function line(x1, y1, x2, y2, stroke, width = 3, extra = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" ${extra}/>`;
}

export function circle(cx, cy, r, fill, stroke = 'none', width = 0, extra = '') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
}

export function pathEl(d, stroke, width = 3, fill = 'none', extra = '') {
  return `<path d="${d}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" fill="${fill}" ${extra}/>`;
}

export function textEl(x, y, value, fill, size = 12, weight = 600, extra = '') {
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="${weight}" ${extra}>${esc(value)}</text>`;
}

export function arrowPath(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const hx = x2 - ux * 8;
  const hy = y2 - uy * 8;
  const lx = hx - uy * 5;
  const ly = hy + ux * 5;
  const rx = hx + uy * 5;
  const ry = hy - ux * 5;
  return `M ${x1} ${y1} L ${x2} ${y2} M ${lx} ${ly} L ${x2} ${y2} L ${rx} ${ry}`;
}

export function collectionVars(id) {
  return collections[id];
}

export function iconBody(id, p) {
  switch (id) {
    case 'foundations':
      return `
        ${panel(10, 10, 44, 44, 'none', p.primary, 12, 'stroke-width="3"')}
        ${line(22, 10, 22, 54, p.secondary, 2, 'opacity="0.7"')}
        ${line(42, 10, 42, 54, p.secondary, 2, 'opacity="0.7"')}
        ${line(10, 22, 54, 22, p.secondary, 2, 'opacity="0.7"')}
        ${line(10, 42, 54, 42, p.secondary, 2, 'opacity="0.7"')}
        ${pathEl('M18 46 L32 18 L46 46', p.accent, 4)}
      `;
    case 'history':
      return `
        ${panel(12, 9, 40, 46, p.surface, p.primary, 10, 'stroke-width="3"')}
        ${pathEl('M20 18 C28 14 36 14 44 18', p.secondary, 3)}
        ${line(20, 28, 44, 28, p.secondary, 2)}
        ${line(20, 36, 44, 36, p.secondary, 2)}
        ${circle(20, 46, 3, p.accent)}
        ${circle(32, 46, 3, p.secondary)}
        ${circle(44, 46, 3, p.primary)}
      `;
    case 'science':
      return `
        ${circle(24, 24, 12, 'none', p.primary, 3)}
        ${circle(24, 24, 4, p.accent)}
        ${line(36, 36, 50, 50, p.primary, 4)}
        ${panel(12, 12, 40, 40, 'none', p.secondary, 12, 'stroke-width="1.5" opacity="0.45" stroke-dasharray="4 5"')}
      `;
    case 'nature':
      return `
        ${pathEl('M18 48 C18 34 24 24 32 16 C40 24 46 34 46 48', p.primary, 3)}
        ${pathEl('M32 16 L32 50', p.secondary, 3)}
        ${pathEl('M32 28 C26 28 22 32 20 38', p.accent, 3)}
        ${pathEl('M32 34 C38 34 42 38 44 44', p.accent, 3)}
      `;
    case 'creativity':
      return `
        ${panel(10, 16, 24, 24, p.secondary, p.primary, 8, 'opacity="0.8" stroke-width="2"')}
        ${panel(24, 10, 24, 24, p.accent, p.primary, 8, 'opacity="0.8" stroke-width="2"')}
        ${panel(30, 24, 24, 24, p.surfaceAlt, p.primary, 8, 'stroke-width="2"')}
        ${pathEl('M16 48 C22 40 28 44 34 36 C38 30 44 28 50 32', p.primary, 3)}
      `;
    case 'engineering':
      return `
        ${line(10, 46, 54, 46, p.primary, 3)}
        ${line(16, 46, 24, 20, p.secondary, 3)}
        ${line(32, 46, 32, 18, p.secondary, 3)}
        ${line(48, 46, 40, 20, p.secondary, 3)}
        ${line(24, 20, 40, 20, p.accent, 3)}
        ${line(16, 36, 32, 18, p.primary, 2)}
        ${line(32, 18, 48, 36, p.primary, 2)}
      `;
    case 'mathematics':
      return `
        ${pathEl('M16 44 C18 22 30 14 42 20 C50 24 48 38 38 42 C28 46 20 40 20 32 C20 22 30 18 38 24', p.primary, 3)}
        ${line(12, 32, 52, 32, p.secondary, 2, 'opacity="0.6"')}
        ${circle(38, 24, 3, p.accent)}
        ${circle(20, 32, 3, p.accent)}
      `;
    case 'society-mind':
      return `
        ${circle(18, 22, 7, p.secondary)}
        ${circle(46, 22, 7, p.accent)}
        ${circle(32, 42, 7, p.primary)}
        ${pathEl('M25 22 L39 22 M23 27 L29 36 M41 27 L35 36', p.ink, 3)}
        ${pathEl('M12 14 h10 l4 4 h-10 z', p.primary, 2, p.surface)}
      `;
    default:
      return `${circle(32, 32, 20, p.primary, p.secondary, 2)}`;
  }
}

export function patternBody(id, p) {
  switch (id) {
    case 'foundations':
      return `
        ${line(0, 40, 240, 40, p.secondary, 1.5, 'opacity="0.35"')}
        ${line(0, 120, 240, 120, p.secondary, 1.5, 'opacity="0.35"')}
        ${line(0, 200, 240, 200, p.secondary, 1.5, 'opacity="0.35"')}
        ${line(40, 0, 40, 240, p.secondary, 1.5, 'opacity="0.35"')}
        ${line(120, 0, 120, 240, p.secondary, 1.5, 'opacity="0.35"')}
        ${line(200, 0, 200, 240, p.secondary, 1.5, 'opacity="0.35"')}
        ${pathEl('M40 200 L120 40 L200 200', p.accent, 3, 'none', 'opacity="0.5"')}
      `;
    case 'history':
      return `
        ${pathEl('M20 60 C60 30 110 30 140 70 C170 110 200 120 220 100', p.secondary, 3, 'none', 'opacity="0.4"')}
        ${line(50, 30, 50, 210, p.primary, 1.5, 'opacity="0.2" stroke-dasharray="6 8"')}
        ${line(120, 30, 120, 210, p.primary, 1.5, 'opacity="0.2" stroke-dasharray="6 8"')}
        ${line(190, 30, 190, 210, p.primary, 1.5, 'opacity="0.2" stroke-dasharray="6 8"')}
        ${circle(50, 170, 5, p.accent, 'none', 0, 'opacity="0.55"')}
        ${circle(120, 110, 5, p.secondary, 'none', 0, 'opacity="0.55"')}
        ${circle(190, 150, 5, p.primary, 'none', 0, 'opacity="0.55"')}
      `;
    case 'science':
      return `
        ${line(0, 60, 240, 60, p.secondary, 1, 'opacity="0.25"')}
        ${line(0, 120, 240, 120, p.secondary, 1, 'opacity="0.25"')}
        ${line(0, 180, 240, 180, p.secondary, 1, 'opacity="0.25"')}
        ${line(60, 0, 60, 240, p.secondary, 1, 'opacity="0.25"')}
        ${line(120, 0, 120, 240, p.secondary, 1, 'opacity="0.25"')}
        ${line(180, 0, 180, 240, p.secondary, 1, 'opacity="0.25"')}
        ${pathEl('M20 170 C60 150 80 100 120 110 C160 120 170 70 220 60', p.primary, 3, 'none', 'opacity="0.55"')}
        ${circle(80, 100, 5, p.accent, 'none', 0, 'opacity="0.7"')}
      `;
    case 'nature':
      return `
        ${pathEl('M20 30 C40 70 60 90 90 110 C130 140 150 170 160 210', p.secondary, 3, 'none', 'opacity="0.35"')}
        ${pathEl('M120 20 C110 70 130 110 170 140 C200 160 215 190 220 220', p.accent, 3, 'none', 'opacity="0.35"')}
        ${pathEl('M90 110 C70 120 55 135 40 160', p.primary, 2, 'none', 'opacity="0.35"')}
        ${pathEl('M170 140 C190 130 205 115 220 90', p.primary, 2, 'none', 'opacity="0.35"')}
      `;
    case 'creativity':
      return `
        ${panel(20, 28, 90, 58, p.secondary, p.primary, 18, 'opacity="0.3" stroke-width="1.5"')}
        ${panel(84, 62, 102, 70, p.accent, p.primary, 18, 'opacity="0.28" stroke-width="1.5"')}
        ${panel(150, 28, 70, 110, p.surfaceAlt, p.primary, 18, 'opacity="0.45" stroke-width="1.5"')}
        ${pathEl('M26 178 C54 152 84 188 118 156 C144 132 168 162 208 144', p.primary, 3, 'none', 'opacity="0.45"')}
      `;
    case 'engineering':
      return `
        ${line(20, 180, 220, 180, p.secondary, 2, 'opacity="0.4"')}
        ${line(40, 180, 90, 70, p.primary, 2, 'opacity="0.45"')}
        ${line(140, 180, 190, 70, p.primary, 2, 'opacity="0.45"')}
        ${line(90, 70, 140, 70, p.accent, 2, 'opacity="0.55"')}
        ${line(20, 40, 220, 40, p.secondary, 1, 'opacity="0.18" stroke-dasharray="6 8"')}
        ${line(20, 110, 220, 110, p.secondary, 1, 'opacity="0.18" stroke-dasharray="6 8"')}
        ${line(80, 20, 80, 220, p.secondary, 1, 'opacity="0.18" stroke-dasharray="6 8"')}
        ${line(160, 20, 160, 220, p.secondary, 1, 'opacity="0.18" stroke-dasharray="6 8"')}
      `;
    case 'mathematics':
      return `
        ${pathEl('M30 170 C30 90 90 36 152 36 C192 36 210 70 210 96 C210 130 182 152 150 152 C122 152 98 132 98 104 C98 76 120 56 146 56', p.primary, 3, 'none', 'opacity="0.45"')}
        ${line(20, 120, 220, 120, p.secondary, 1.5, 'opacity="0.22"')}
        ${line(120, 20, 120, 220, p.secondary, 1.5, 'opacity="0.22"')}
        ${circle(146, 56, 5, p.accent, 'none', 0, 'opacity="0.7"')}
      `;
    case 'society-mind':
      return `
        ${circle(60, 70, 8, p.secondary, 'none', 0, 'opacity="0.65"')}
        ${circle(180, 60, 8, p.accent, 'none', 0, 'opacity="0.65"')}
        ${circle(120, 170, 8, p.primary, 'none', 0, 'opacity="0.65"')}
        ${pathEl('M68 70 C90 60 110 70 120 90 C130 110 145 120 172 120', p.primary, 3, 'none', 'opacity="0.4"')}
        ${pathEl('M72 80 C84 120 94 134 114 162', p.accent, 2, 'none', 'opacity="0.45"')}
        ${pathEl('M170 68 C152 88 144 110 132 164', p.secondary, 2, 'none', 'opacity="0.45"')}
        ${pathEl('M24 26 h46 l12 12 h-46 z', p.primary, 2, p.surfaceAlt, 'opacity="0.7"')}
      `;
    default:
      return `${circle(120, 120, 64, p.secondary, 'none', 0, 'opacity="0.2"')}`;
  }
}

export function backgroundBody(id, p) {
  return `
    <rect width="1600" height="900" fill="${p.surface}"/>
    <rect x="30" y="30" width="1540" height="840" rx="48" fill="${p.surfaceAlt}" opacity="0.3"/>
    <g transform="translate(140 120)">${patternBody(id, { ...p, primary: p.primary, secondary: p.secondary, accent: p.accent })}</g>
    <rect x="980" y="120" width="460" height="300" rx="36" fill="#ffffff" opacity="0.68" stroke="${p.secondary}" stroke-width="2"/>
    ${collectionIllustrationBody(id, p, 1010, 145, 400, 250)}
    <path d="M90 720 C300 620 530 640 730 700 C930 760 1170 790 1510 650" stroke="${p.accent}" stroke-width="10" opacity="0.55" stroke-linecap="round"/>
    <path d="M90 770 C330 690 570 720 760 760 C990 810 1210 820 1480 730" stroke="${p.primary}" stroke-width="4" opacity="0.35" stroke-linecap="round"/>
  `;
}

export function collectionIllustrationBody(id, p, ox = 0, oy = 0, width = 640, height = 420) {
  const tx = (x) => ox + x * (width / 640);
  const ty = (y) => oy + y * (height / 420);
  const sw = (v) => v * (width / 640);
  const localPanel = (x, y, w, h, fill, stroke, rx = 18, extra = '') => panel(tx(x), ty(y), w * (width / 640), h * (height / 420), fill, stroke, rx * (width / 640), extra);
  const l = (x1, y1, x2, y2, stroke, width2 = 4, extra = '') => line(tx(x1), ty(y1), tx(x2), ty(y2), stroke, sw(width2), extra);
  const c = (cx, cy, r, fill, stroke = 'none', width2 = 0, extra = '') => circle(tx(cx), ty(cy), r * (width / 640), fill, stroke, sw(width2), extra);
  const pth = (d, stroke, width2 = 4, fill = 'none', extra = '') => pathEl(d.replace(/(\d+\.?\d*)/g, (m) => m), stroke, sw(width2), fill, extra); // path already absolute, left as-is
  switch (id) {
    case 'foundations':
      return `
        ${localPanel(44, 36, 552, 332, '#ffffff', p.secondary, 26, 'stroke-width="2.5" opacity="0.76"')}
        ${l(120, 74, 120, 330, p.secondary, 2, 'opacity="0.4"')}
        ${l(250, 74, 250, 330, p.secondary, 2, 'opacity="0.4"')}
        ${l(380, 74, 380, 330, p.secondary, 2, 'opacity="0.4"')}
        ${l(510, 74, 510, 330, p.secondary, 2, 'opacity="0.4"')}
        ${l(74, 136, 566, 136, p.secondary, 2, 'opacity="0.4"')}
        ${l(74, 220, 566, 220, p.secondary, 2, 'opacity="0.4"')}
        ${l(74, 304, 566, 304, p.secondary, 2, 'opacity="0.4"')}
        ${pathEl(`M ${tx(102)} ${ty(300)} L ${tx(236)} ${ty(110)} L ${tx(360)} ${ty(300)} L ${tx(492)} ${ty(164)} L ${tx(566)} ${ty(238)}`, p.primary, sw(10), 'none', 'stroke-linejoin="round"')}
        ${c(236, 110, 12, p.accent)}
        ${c(492, 164, 12, p.accent)}
      `;
    case 'history':
      return `
        ${localPanel(56, 44, 528, 308, '#fffaf1', p.secondary, 26, 'stroke-width="2.5" opacity="0.82"')}
        ${pathEl(`M ${tx(114)} ${ty(114)} C ${tx(180)} ${ty(80)} ${tx(260)} ${ty(92)} ${tx(304)} ${ty(142)} C ${tx(356)} ${ty(196)} ${tx(440)} ${ty(196)} ${tx(530)} ${ty(144)}`, p.primary, sw(7), 'none', 'opacity="0.55"')}
        ${l(132, 84, 132, 304, p.secondary, 2, 'opacity="0.35" stroke-dasharray="8 10"')}
        ${l(266, 84, 266, 304, p.secondary, 2, 'opacity="0.35" stroke-dasharray="8 10"')}
        ${l(400, 84, 400, 304, p.secondary, 2, 'opacity="0.35" stroke-dasharray="8 10"')}
        ${c(132, 236, 13, p.accent)}
        ${c(266, 170, 13, p.secondary)}
        ${c(400, 214, 13, p.primary)}
        ${localPanel(430, 84, 108, 92, '#ffffff', p.primary, 16, 'stroke-width="2" opacity="0.8"')}
        ${l(448, 104, 520, 104, p.secondary, 2)}
        ${l(448, 126, 520, 126, p.secondary, 2)}
        ${l(448, 148, 490, 148, p.secondary, 2)}
      `;
    case 'science':
      return `
        ${localPanel(54, 44, 532, 308, '#ffffff', p.secondary, 26, 'stroke-width="2.5" opacity="0.8"')}
        ${l(96, 84, 96, 318, p.secondary, 1.5, 'opacity="0.28"')}
        ${l(196, 84, 196, 318, p.secondary, 1.5, 'opacity="0.28"')}
        ${l(296, 84, 296, 318, p.secondary, 1.5, 'opacity="0.28"')}
        ${l(396, 84, 396, 318, p.secondary, 1.5, 'opacity="0.28"')}
        ${l(496, 84, 496, 318, p.secondary, 1.5, 'opacity="0.28"')}
        ${l(86, 128, 554, 128, p.secondary, 1.5, 'opacity="0.28"')}
        ${l(86, 208, 554, 208, p.secondary, 1.5, 'opacity="0.28"')}
        ${l(86, 288, 554, 288, p.secondary, 1.5, 'opacity="0.28"')}
        ${pathEl(`M ${tx(104)} ${ty(282)} C ${tx(160)} ${ty(264)} ${tx(200)} ${ty(174)} ${tx(266)} ${ty(194)} C ${tx(344)} ${ty(214)} ${tx(390)} ${ty(136)} ${tx(532)} ${ty(114)}`, p.primary, sw(8), 'none')}
        ${c(266, 194, 12, p.accent)}
        ${c(390, 136, 12, p.accent)}
        ${circle(tx(468), ty(278), sw(38), 'none', p.primary, sw(6))}
        ${line(tx(494), ty(306), tx(540), ty(348), p.primary, sw(8))}
      `;
    case 'nature':
      return `
        ${localPanel(48, 48, 544, 300, '#ffffff', p.secondary, 28, 'stroke-width="2.5" opacity="0.76"')}
        ${pathEl(`M ${tx(118)} ${ty(88)} C ${tx(138)} ${ty(156)} ${tx(176)} ${ty(180)} ${tx(228)} ${ty(216)} C ${tx(292)} ${ty(260)} ${tx(330)} ${ty(284)} ${tx(350)} ${ty(330)}`, p.secondary, sw(8), 'none', 'opacity="0.8"')}
        ${pathEl(`M ${tx(278)} ${ty(86)} C ${tx(262)} ${ty(132)} ${tx(278)} ${ty(180)} ${tx(336)} ${ty(214)} C ${tx(408)} ${ty(254)} ${tx(468)} ${ty(268)} ${tx(520)} ${ty(322)}`, p.accent, sw(8), 'none', 'opacity="0.7"')}
        ${pathEl(`M ${tx(228)} ${ty(216)} C ${tx(194)} ${ty(218)} ${tx(166)} ${ty(244)} ${tx(142)} ${ty(282)}`, p.primary, sw(4), 'none')}
        ${pathEl(`M ${tx(336)} ${ty(214)} C ${tx(374)} ${ty(212)} ${tx(408)} ${ty(188)} ${tx(448)} ${ty(144)}`, p.primary, sw(4), 'none')}
        ${c(142, 282, 11, p.primary)}
        ${c(448, 144, 11, p.secondary)}
        ${c(350, 330, 11, p.accent)}
      `;
    case 'creativity':
      return `
        ${localPanel(54, 44, 532, 308, '#ffffff', p.secondary, 26, 'stroke-width="2.5" opacity="0.72"')}
        ${localPanel(104, 86, 156, 112, p.secondary, p.primary, 24, 'opacity="0.45" stroke-width="2.5"')}
        ${localPanel(226, 66, 208, 132, p.accent, p.primary, 24, 'opacity="0.34" stroke-width="2.5"')}
        ${localPanel(308, 150, 182, 128, p.surfaceAlt, p.primary, 24, 'opacity="0.82" stroke-width="2.5"')}
        ${pathEl(`M ${tx(116)} ${ty(280)} C ${tx(176)} ${ty(228)} ${tx(216)} ${ty(310)} ${tx(282)} ${ty(252)} C ${tx(334)} ${ty(206)} ${tx(390)} ${ty(252)} ${tx(520)} ${ty(188)}`, p.primary, sw(9), 'none')}
        ${c(186, 138, 12, p.primary)}
        ${c(350, 212, 12, p.accent)}
      `;
    case 'engineering':
      return `
        ${localPanel(50, 48, 540, 300, '#ffffff', p.secondary, 28, 'stroke-width="2.5" opacity="0.78"')}
        ${l(96, 300, 544, 300, p.primary, 7)}
        ${l(136, 300, 214, 130, p.secondary, 7)}
        ${l(328, 300, 404, 130, p.secondary, 7)}
        ${l(214, 130, 404, 130, p.accent, 7)}
        ${l(136, 232, 214, 130, p.primary, 3)}
        ${l(214, 130, 290, 232, p.primary, 3)}
        ${l(290, 232, 404, 130, p.primary, 3)}
        ${l(404, 130, 490, 232, p.primary, 3)}
        ${l(86, 98, 554, 98, p.secondary, 1.5, 'opacity="0.28" stroke-dasharray="8 10"')}
        ${l(86, 182, 554, 182, p.secondary, 1.5, 'opacity="0.28" stroke-dasharray="8 10"')}
      `;
    case 'mathematics':
      return `
        ${localPanel(50, 48, 540, 300, '#ffffff', p.secondary, 28, 'stroke-width="2.5" opacity="0.78"')}
        ${pathEl(`M ${tx(128)} ${ty(292)} C ${tx(128)} ${ty(174)} ${tx(228)} ${ty(98)} ${tx(316)} ${ty(98)} C ${tx(394)} ${ty(98)} ${tx(454)} ${ty(150)} ${tx(454)} ${ty(214)} C ${tx(454)} ${ty(262)} ${tx(416)} ${ty(300)} ${tx(362)} ${ty(300)} C ${tx(306)} ${ty(300)} ${tx(266)} ${ty(258)} ${tx(266)} ${ty(214)} C ${tx(266)} ${ty(168)} ${tx(302)} ${ty(138)} ${tx(344)} ${ty(138)}`, p.primary, sw(8), 'none')}
        ${l(86, 214, 554, 214, p.secondary, 2, 'opacity="0.28"')}
        ${l(320, 86, 320, 324, p.secondary, 2, 'opacity="0.28"')}
        ${c(344, 138, 11, p.accent)}
        ${localPanel(402, 126, 106, 78, '#fffaf6', p.primary, 16, 'stroke-width="2" opacity="0.86"')}
        ${textEl(tx(422), ty(158), 'A', p.primary, 24, 700)}
        ${textEl(tx(462), ty(184), '→', p.accent, 20, 700)}
      `;
    case 'society-mind':
      return `
        ${localPanel(54, 44, 532, 308, '#ffffff', p.secondary, 26, 'stroke-width="2.5" opacity="0.78"')}
        ${c(148, 128, 18, p.secondary)}
        ${c(458, 120, 18, p.accent)}
        ${c(316, 276, 18, p.primary)}
        ${pathEl(`M ${tx(166)} ${ty(128)} C ${tx(238)} ${ty(104)} ${tx(266)} ${ty(160)} ${tx(314)} ${ty(258)}`, p.primary, sw(8), 'none', 'opacity="0.8"')}
        ${pathEl(`M ${tx(440)} ${ty(120)} C ${tx(392)} ${ty(148)} ${tx(362)} ${ty(188)} ${tx(332)} ${ty(258)}`, p.accent, sw(8), 'none', 'opacity="0.7"')}
        ${pathEl(`M ${tx(180)} ${ty(120)} C ${tx(246)} ${ty(82)} ${tx(354)} ${ty(84)} ${tx(424)} ${ty(118)}`, p.secondary, sw(4), 'none')}
        ${pathEl(`M ${tx(98)} ${ty(74)} h ${sw(110)} l ${sw(24)} ${sw(24)} h ${-sw(110)} z`, p.primary, sw(2), p.surfaceAlt, 'opacity="0.7"')}
        ${pathEl(`M ${tx(392)} ${ty(194)} h ${sw(102)} l ${sw(18)} ${sw(18)} h ${-sw(102)} z`, p.accent, sw(2), '#ffffff', 'opacity="0.72"')}
      `;
    default:
      return localPanel(60, 60, 520, 280, '#fff', p.secondary, 24, 'stroke-width="2.5"');
  }
}

export function experienceMotifBody(id, p) {
  switch (id) {
    case 'echo':
      return `
        ${panel(28, 48, 80, 124, '#ffffff', p.primary, 18, 'stroke-width="2.5" opacity="0.86"')}
        ${panel(212, 48, 80, 124, '#ffffff', p.primary, 18, 'stroke-width="2.5" opacity="0.86"')}
        ${pathEl('M110 110 C132 88 188 88 210 110', p.accent, 4)}
        ${pathEl('M98 110 C128 68 192 68 222 110', p.secondary, 4, 'none', 'opacity="0.72"')}
        ${pathEl('M88 110 C126 48 194 48 232 110', p.primary, 4, 'none', 'opacity="0.48"')}
      `;
    case 'signal':
      return `
        ${line(46, 150, 274, 150, p.secondary, 2, 'opacity="0.45"')}
        ${line(226, 52, 226, 170, p.accent, 3, 'opacity="0.8" stroke-dasharray="6 8"')}
        ${pathEl('M46 132 C66 152 80 108 100 132 C120 156 136 102 156 128 C176 154 192 76 214 74 C232 74 246 96 274 92', p.primary, 5)}
        ${circle(226, 74, 8, p.accent)}
      `;
    case 'pattern-garden':
      return `
        ${panel(40, 46, 240, 128, '#ffffff', p.secondary, 22, 'stroke-width="2.5" opacity="0.82"')}
        ${circle(90, 92, 10, p.secondary)}
        ${circle(128, 92, 10, p.secondary)}
        ${circle(166, 92, 10, p.secondary)}
        ${circle(90, 128, 10, p.secondary)}
        ${circle(128, 128, 10, p.accent)}
        ${circle(166, 128, 10, p.secondary)}
        ${pathEl('M192 146 C214 136 228 120 240 98 C248 84 260 78 278 74', p.primary, 4)}
      `;
    case 'memory-sequence':
      return `
        ${panel(48, 72, 48, 76, '#ffffff', p.secondary, 14, 'stroke-width="2.5" opacity="0.55"')}
        ${panel(108, 60, 48, 88, '#ffffff', p.primary, 14, 'stroke-width="2.5" opacity="0.8"')}
        ${panel(168, 48, 48, 100, '#ffffff', p.primary, 14, 'stroke-width="2.5" opacity="0.95"')}
        ${panel(228, 60, 48, 88, '#ffffff', p.secondary, 14, 'stroke-width="2.5" opacity="0.7"')}
        ${pathEl('M74 168 C112 194 154 194 194 168 C214 154 234 154 250 162', p.accent, 4)}
      `;
    case 'perspective':
      return `
        ${panel(42, 54, 102, 112, '#ffffff', p.secondary, 18, 'stroke-width="2.5" opacity="0.82"')}
        ${panel(176, 54, 102, 112, '#ffffff', p.primary, 18, 'stroke-width="2.5" opacity="0.82"')}
        ${pathEl('M64 144 L92 92 L120 144 Z', p.primary, 4)}
        ${pathEl('M196 128 L228 82 L254 144 Z', p.accent, 4)}
        ${circle(92, 78, 12, p.secondary, 'none', 3)}
        ${circle(228, 78, 12, p.secondary, 'none', 3)}
      `;
    case 'dueling-accounts':
      return `
        ${panel(54, 40, 92, 136, '#fffaf1', p.primary, 18, 'stroke-width="2.5" transform="rotate(-6 100 108)"')}
        ${panel(176, 40, 92, 136, '#ffffff', p.secondary, 18, 'stroke-width="2.5" transform="rotate(6 222 108)"')}
        ${line(74, 78, 126, 78, p.secondary, 2)}
        ${line(74, 98, 128, 98, p.secondary, 2)}
        ${line(194, 74, 246, 74, p.primary, 2)}
        ${line(194, 94, 248, 94, p.primary, 2)}
        ${circle(160, 114, 12, p.accent)}
      `;
    case 'unlabeled':
      return `
        ${panel(42, 60, 64, 92, '#ffffff', p.primary, 16, 'stroke-width="2.5"')}
        ${panel(128, 46, 64, 106, '#ffffff', p.secondary, 16, 'stroke-width="2.5"')}
        ${panel(214, 60, 64, 92, '#ffffff', p.primary, 16, 'stroke-width="2.5"')}
        ${pathEl('M58 168 h204', p.accent, 3, 'none', 'stroke-dasharray="6 8" opacity="0.8"')}
      `;
    case 'chronology':
      return `
        ${line(48, 110, 272, 110, p.primary, 5)}
        ${circle(74, 110, 10, p.secondary)}
        ${circle(156, 110, 10, p.accent)}
        ${circle(244, 110, 10, p.secondary)}
        ${panel(54, 52, 58, 34, '#ffffff', p.secondary, 10, 'stroke-width="2"')}
        ${panel(132, 142, 58, 34, '#ffffff', p.primary, 10, 'stroke-width="2"')}
        ${panel(212, 52, 58, 34, '#ffffff', p.secondary, 10, 'stroke-width="2"')}
      `;
    case 'chain-reaction':
      return `
        ${panel(58, 122, 22, 46, p.secondary, p.primary, 6, 'stroke-width="2.5" transform="rotate(-14 69 145)"')}
        ${panel(106, 110, 22, 58, p.secondary, p.primary, 6, 'stroke-width="2.5" transform="rotate(-8 117 139)"')}
        ${panel(154, 94, 22, 74, p.accent, p.primary, 6, 'stroke-width="2.5" transform="rotate(0 165 131)"')}
        ${panel(202, 74, 22, 94, p.secondary, p.primary, 6, 'stroke-width="2.5" transform="rotate(10 213 121)"')}
        ${pathEl('M52 176 C88 168 122 152 162 136 C198 122 230 96 266 56', p.primary, 4)}
      `;
    case 'witness':
      return `
        ${circle(160, 112, 18, p.accent)}
        ${pathEl('M56 56 h72 l14 14 h-72 z', p.primary, 3, '#ffffff')}
        ${pathEl('M200 48 h64 l12 12 h-64 z', p.secondary, 3, '#ffffff')}
        ${pathEl('M84 154 h64 l12 12 h-64 z', p.secondary, 3, '#ffffff')}
        ${line(128, 78, 148, 98, p.primary, 3)}
        ${line(212, 70, 176, 98, p.secondary, 3)}
        ${line(132, 166, 148, 126, p.secondary, 3)}
      `;
    case 'controlled':
      return `
        ${panel(54, 64, 84, 98, '#ffffff', p.primary, 16, 'stroke-width="2.5"')}
        ${panel(182, 64, 84, 98, '#ffffff', p.primary, 16, 'stroke-width="2.5"')}
        ${line(96, 82, 96, 144, p.secondary, 4)}
        ${line(224, 82, 224, 144, p.secondary, 4)}
        ${circle(96, 110, 10, p.accent)}
        ${circle(224, 126, 10, p.secondary)}
        ${pathEl(arrowPath(138, 110, 182, 110), p.primary, 3)}
      `;
    case 'hypothesis':
      return `
        ${panel(38, 84, 64, 52, '#ffffff', p.primary, 14, 'stroke-width="2.5"')}
        ${panel(128, 50, 64, 52, '#ffffff', p.secondary, 14, 'stroke-width="2.5"')}
        ${panel(128, 118, 64, 52, '#ffffff', p.secondary, 14, 'stroke-width="2.5"')}
        ${panel(220, 84, 64, 52, '#ffffff', p.accent, 14, 'stroke-width="2.5"')}
        ${pathEl(arrowPath(102, 110, 128, 76), p.primary, 3)}
        ${pathEl(arrowPath(102, 110, 128, 144), p.primary, 3)}
        ${pathEl(arrowPath(192, 76, 220, 110), p.secondary, 3)}
        ${pathEl(arrowPath(192, 144, 220, 110), p.secondary, 3)}
      `;
    case 'scale':
      return `
        ${panel(42, 42, 236, 136, '#ffffff', p.secondary, 24, 'stroke-width="2.5"')}
        ${panel(84, 68, 152, 84, 'none', p.primary, 18, 'stroke-width="3"')}
        ${panel(118, 86, 84, 48, 'none', p.accent, 14, 'stroke-width="3"')}
        ${circle(160, 110, 10, p.primary)}
      `;
    case 'signal-data':
      return `
        ${line(52, 164, 52, 56, p.secondary, 3)}
        ${line(52, 164, 272, 164, p.secondary, 3)}
        ${circle(88, 142, 6, p.primary)}
        ${circle(116, 132, 6, p.primary)}
        ${circle(150, 118, 6, p.primary)}
        ${circle(182, 106, 6, p.primary)}
        ${circle(224, 88, 6, p.accent)}
        ${circle(246, 82, 6, p.accent)}
        ${pathEl('M74 150 C118 136 158 120 202 100 C220 90 238 84 260 76', p.accent, 4)}
      `;
    case 'uncertainty':
      return `
        ${line(56, 150, 264, 150, p.secondary, 3, 'opacity="0.45"')}
        ${pathEl('M88 150 C124 102 156 88 202 102 C230 110 244 132 248 150', p.primary, 4)}
        ${pathEl('M88 150 C124 182 156 196 202 182 C230 174 244 162 248 150', p.primary, 4, 'none', 'opacity="0.55"')}
        ${circle(168, 142, 10, p.accent)}
      `;
    case 'ecosystem':
      return `
        ${circle(66, 146, 10, p.secondary)}
        ${circle(110, 82, 10, p.secondary)}
        ${circle(154, 140, 10, p.accent)}
        ${circle(214, 90, 10, p.primary)}
        ${circle(256, 150, 10, p.primary)}
        ${pathEl('M76 146 L102 88 L146 136 L206 96 L246 146 M110 82 L214 90 M154 140 L256 150', p.ink, 3)}
      `;
    case 'symbiosis':
      return `
        ${pathEl('M102 84 C122 54 164 54 182 84 C194 104 192 132 168 150 C148 166 124 164 106 148 C82 128 82 102 102 84 Z', p.primary, 4)}
        ${pathEl('M138 72 C158 42 200 42 218 72 C230 92 228 120 204 138 C184 154 160 152 142 136 C118 116 118 90 138 72 Z', p.accent, 4, 'none', 'opacity="0.75"')}
      `;
    case 'seasons':
      return `
        ${circle(160, 110, 62, 'none', p.primary, 4)}
        ${line(160, 48, 160, 172, p.secondary, 2)}
        ${line(98, 110, 222, 110, p.secondary, 2)}
        ${circle(160, 58, 10, p.accent)}
        ${circle(212, 110, 10, p.secondary)}
        ${circle(160, 162, 10, p.primary)}
        ${circle(108, 110, 10, p.accent)}
      `;
    case 'watershed':
      return `
        ${pathEl('M68 56 C88 90 100 110 112 130 C126 154 140 168 160 184', p.primary, 5)}
        ${pathEl('M160 184 C184 168 198 154 210 130 C222 110 234 92 252 56', p.accent, 5)}
        ${pathEl('M112 130 C96 126 82 132 68 144', p.secondary, 3)}
        ${pathEl('M210 130 C226 126 240 132 252 144', p.secondary, 3)}
        ${line(60, 48, 260, 48, p.secondary, 2, 'opacity="0.35" stroke-dasharray="6 8"')}
        ${line(160, 184, 160, 204, p.primary, 4)}
      `;
    case 'adaptation':
      return `
        ${circle(84, 86, 12, p.secondary)}
        ${circle(122, 108, 12, p.secondary)}
        ${circle(160, 86, 12, p.accent)}
        ${circle(198, 108, 12, p.secondary)}
        ${circle(236, 86, 12, p.primary)}
        ${pathEl(arrowPath(66, 152, 252, 152), p.primary, 4)}
        ${panel(70, 52, 180, 72, 'none', p.secondary, 18, 'stroke-width="2" opacity="0.28"')}
      `;
    case 'compose':
      return `
        ${panel(48, 56, 94, 84, p.secondary, p.primary, 18, 'opacity="0.55" stroke-width="2.5"')}
        ${panel(104, 42, 120, 98, p.accent, p.primary, 18, 'opacity="0.42" stroke-width="2.5"')}
        ${panel(184, 94, 86, 70, p.surfaceAlt, p.primary, 18, 'opacity="0.88" stroke-width="2.5"')}
        ${pathEl('M68 170 C110 152 136 180 174 150 C204 126 226 142 252 126', p.primary, 4)}
      `;
    case 'constraint':
      return `
        ${panel(52, 46, 216, 128, 'none', p.primary, 18, 'stroke-width="3"')}
        ${line(124, 46, 124, 174, p.secondary, 2, 'opacity="0.5"')}
        ${line(196, 46, 196, 174, p.secondary, 2, 'opacity="0.5"')}
        ${line(52, 110, 268, 110, p.secondary, 2, 'opacity="0.5"')}
        ${circle(88, 82, 10, p.accent)}
        ${circle(160, 138, 10, p.primary)}
        ${circle(232, 82, 10, p.accent)}
      `;
    case 'diverge':
      return `
        ${pathEl('M160 158 C160 130 160 108 160 76', p.primary, 5)}
        ${pathEl('M160 104 C132 92 112 72 96 50', p.secondary, 4)}
        ${pathEl('M160 104 C190 90 214 74 236 48', p.secondary, 4)}
        ${pathEl('M160 134 C132 146 112 164 98 186', p.accent, 4)}
        ${pathEl('M160 134 C190 148 214 162 236 182', p.accent, 4)}
        ${circle(96, 50, 10, p.secondary)}
        ${circle(236, 48, 10, p.secondary)}
        ${circle(98, 186, 10, p.accent)}
        ${circle(236, 182, 10, p.accent)}
      `;
    case 'iterate':
      return `
        ${panel(44, 64, 56, 92, '#ffffff', p.secondary, 12, 'stroke-width="2.5" opacity="0.45"')}
        ${panel(116, 56, 64, 100, '#ffffff', p.secondary, 12, 'stroke-width="2.5" opacity="0.68"')}
        ${panel(196, 44, 80, 112, '#ffffff', p.primary, 12, 'stroke-width="2.5" opacity="0.92"')}
        ${pathEl('M70 110 C82 98 88 98 92 122', p.accent, 3)}
        ${pathEl('M140 106 C156 86 168 88 172 126', p.accent, 3)}
        ${pathEl('M218 100 C244 70 258 80 262 132', p.accent, 3)}
      `;
    case 'remix':
      return `
        ${panel(50, 52, 86, 108, '#ffffff', p.primary, 18, 'stroke-width="2.5"')}
        ${panel(184, 52, 86, 108, '#ffffff', p.secondary, 18, 'stroke-width="2.5"')}
        ${pathEl('M88 52 L88 160 M50 106 L136 106', p.accent, 4)}
        ${pathEl('M184 52 L270 160 M270 52 L184 160', p.accent, 4)}
      `;
    case 'bridge':
      return `
        ${line(46, 154, 274, 154, p.primary, 5)}
        ${line(80, 154, 116, 88, p.secondary, 5)}
        ${line(204, 154, 240, 88, p.secondary, 5)}
        ${line(116, 88, 204, 88, p.accent, 5)}
        ${line(116, 88, 160, 126, p.primary, 3)}
        ${line(160, 126, 204, 88, p.primary, 3)}
      `;
    case 'failure':
      return `
        ${panel(54, 88, 212, 56, '#ffffff', p.primary, 12, 'stroke-width="2.5"')}
        ${pathEl('M92 90 C108 108 122 104 138 124 C150 140 164 136 178 122 C188 112 196 110 214 142', p.accent, 5)}
        ${circle(182, 122, 8, p.secondary)}
        ${line(182, 122, 244, 76, p.secondary, 3)}
        ${panel(228, 54, 44, 28, '#ffffff', p.secondary, 8, 'stroke-width="2"')}
      `;
    case 'trade-offs':
      return `
        ${line(160, 54, 160, 164, p.primary, 5)}
        ${line(96, 94, 224, 94, p.secondary, 5)}
        ${line(110, 94, 90, 150, p.primary, 3)}
        ${line(210, 94, 230, 150, p.primary, 3)}
        ${panel(64, 150, 52, 22, '#ffffff', p.accent, 8, 'stroke-width="2.5"')}
        ${panel(204, 150, 52, 22, '#ffffff', p.secondary, 8, 'stroke-width="2.5"')}
      `;
    case 'optimization':
      return `
        ${pathEl('M60 162 C82 130 108 108 138 96 C172 82 210 80 252 92', p.secondary, 3)}
        ${pathEl('M74 174 C96 142 122 120 150 108 C182 96 214 96 244 108', p.secondary, 3)}
        ${pathEl('M92 188 C112 160 136 140 162 130 C190 120 214 120 234 128', p.secondary, 3)}
        ${pathEl('M68 170 L116 146 L154 126 L204 112 L246 116', p.primary, 5)}
        ${circle(246, 116, 8, p.accent)}
      `;
    case 'feedback-loop':
      return `
        ${panel(56, 88, 58, 44, '#ffffff', p.primary, 12, 'stroke-width="2.5"')}
        ${panel(132, 88, 58, 44, '#ffffff', p.secondary, 12, 'stroke-width="2.5"')}
        ${panel(208, 88, 58, 44, '#ffffff', p.accent, 12, 'stroke-width="2.5"')}
        ${pathEl(arrowPath(114, 110, 132, 110), p.primary, 3)}
        ${pathEl(arrowPath(190, 110, 208, 110), p.primary, 3)}
        ${pathEl('M238 132 C238 168 84 168 84 132', p.secondary, 4)}
        ${pathEl('M78 140 L84 132 L90 140', p.secondary, 4)}
      `;
    case 'patterns-math':
      return `
        ${panel(54, 52, 212, 116, '#ffffff', p.secondary, 18, 'stroke-width="2.5"')}
        ${pathEl('M74 72 L114 72 L134 110 L114 148 L74 148 L54 110 Z', p.primary, 3)}
        ${pathEl('M134 72 L174 72 L194 110 L174 148 L134 148 L114 110 Z', p.primary, 3)}
        ${pathEl('M194 72 L234 72 L254 110 L234 148 L194 148 L174 110 Z', p.accent, 3)}
      `;
    case 'symmetry':
      return `
        ${line(160, 46, 160, 174, p.secondary, 3, 'stroke-dasharray="6 8"')}
        ${pathEl('M94 154 C84 126 88 88 118 74 C138 64 150 74 154 94 C158 114 148 136 128 146 C118 152 106 154 94 154 Z', p.primary, 4)}
        ${pathEl('M226 154 C236 126 232 88 202 74 C182 64 170 74 166 94 C162 114 172 136 192 146 C202 152 214 154 226 154 Z', p.primary, 4)}
        ${circle(160, 110, 8, p.accent)}
      `;
    case 'proof':
      return `
        ${panel(40, 78, 58, 40, '#ffffff', p.primary, 12, 'stroke-width="2.5"')}
        ${panel(130, 52, 58, 40, '#ffffff', p.secondary, 12, 'stroke-width="2.5"')}
        ${panel(130, 124, 58, 40, '#ffffff', p.secondary, 12, 'stroke-width="2.5"')}
        ${panel(222, 88, 58, 40, '#ffffff', p.accent, 12, 'stroke-width="2.5"')}
        ${pathEl(arrowPath(98, 98, 130, 72), p.primary, 3)}
        ${pathEl(arrowPath(98, 98, 130, 144), p.primary, 3)}
        ${pathEl(arrowPath(188, 72, 222, 108), p.secondary, 3)}
        ${pathEl(arrowPath(188, 144, 222, 108), p.secondary, 3)}
      `;
    case 'probability':
      return `
        ${line(52, 164, 268, 164, p.secondary, 3)}
        ${circle(86, 144, 5, p.primary)}${circle(98, 136, 5, p.primary)}${circle(112, 142, 5, p.primary)}
        ${circle(130, 126, 5, p.primary)}${circle(144, 116, 5, p.primary)}${circle(160, 110, 5, p.accent)}
        ${circle(178, 116, 5, p.primary)}${circle(194, 126, 5, p.primary)}${circle(208, 140, 5, p.primary)}
        ${circle(224, 148, 5, p.primary)}${circle(238, 142, 5, p.primary)}
        ${pathEl('M74 156 C112 130 132 98 160 98 C188 98 210 130 246 156', p.accent, 4)}
      `;
    case 'estimation':
      return `
        ${line(74, 96, 74, 144, p.secondary, 4)}
        ${line(246, 96, 246, 144, p.secondary, 4)}
        ${line(74, 120, 246, 120, p.primary, 5)}
        ${circle(112, 120, 8, p.accent)}
        ${circle(160, 120, 8, p.secondary)}
        ${circle(208, 120, 8, p.accent)}
        ${pathEl('M110 78 C122 62 142 54 160 54 C178 54 198 62 210 78', p.primary, 3)}
      `;
    case 'attention':
      return `
        ${panel(48, 52, 224, 116, '#ffffff', p.secondary, 20, 'stroke-width="2.5"')}
        ${circle(96, 88, 9, p.secondary)}${circle(144, 88, 9, p.secondary)}${circle(192, 88, 9, p.secondary)}${circle(240, 88, 9, p.secondary)}
        ${circle(96, 132, 9, p.secondary)}${circle(144, 132, 9, p.accent)}${circle(192, 132, 9, p.secondary)}${circle(240, 132, 9, p.secondary)}
        ${pathEl('M144 22 C118 54 114 92 124 132 C132 164 148 176 160 182 C182 168 190 150 194 122 C198 86 182 50 168 22 Z', p.primary, 4, 'rgba(91,131,200,0.14)')}
      `;
    case 'bias':
      return `
        ${panel(56, 60, 208, 108, '#ffffff', p.secondary, 20, 'stroke-width="2.5"')}
        ${pathEl('M78 84 L152 84 L196 144 L120 144 Z', p.primary, 4, 'rgba(91,131,200,0.16)')}
        ${line(120, 84, 196, 144, p.accent, 4)}
        ${circle(220, 94, 10, p.secondary)}
        ${circle(228, 136, 10, p.secondary)}
      `;
    case 'cooperation':
      return `
        ${circle(88, 136, 12, p.secondary)}
        ${circle(160, 76, 12, p.accent)}
        ${circle(232, 136, 12, p.primary)}
        ${pathEl('M100 136 C120 116 138 98 160 88 C182 98 200 116 220 136', p.primary, 4)}
        ${line(100, 136, 132, 154, p.secondary, 3)}
        ${line(220, 136, 188, 154, p.secondary, 3)}
        ${line(132, 154, 188, 154, p.accent, 3)}
      `;
    case 'memory':
      return `
        ${panel(60, 64, 80, 92, '#ffffff', p.secondary, 18, 'stroke-width="2.5" opacity="0.46"')}
        ${panel(104, 52, 92, 104, '#ffffff', p.secondary, 18, 'stroke-width="2.5" opacity="0.68"')}
        ${panel(152, 40, 108, 116, '#ffffff', p.primary, 18, 'stroke-width="2.5" opacity="0.9"')}
        ${pathEl('M82 150 C112 122 136 110 164 110 C196 110 218 122 244 150', p.accent, 4)}
      `;
    case 'decision':
      return `
        ${panel(132, 46, 56, 38, '#ffffff', p.primary, 12, 'stroke-width="2.5"')}
        ${panel(60, 120, 56, 38, '#ffffff', p.secondary, 12, 'stroke-width="2.5"')}
        ${panel(132, 120, 56, 38, '#ffffff', p.accent, 12, 'stroke-width="2.5"')}
        ${panel(204, 120, 56, 38, '#ffffff', p.secondary, 12, 'stroke-width="2.5"')}
        ${pathEl(arrowPath(160, 84, 88, 120), p.primary, 3)}
        ${pathEl(arrowPath(160, 84, 160, 120), p.primary, 3)}
        ${pathEl(arrowPath(160, 84, 232, 120), p.primary, 3)}
      `;
    default:
      return `${circle(160, 110, 42, p.primary, 'none', 0, 'opacity="0.6"')}`;
  }
}

export function experienceSvg(experienceId, meta, p) {
  const body = `
    <rect width="320" height="220" rx="24" fill="${p.surface}"/>
    <rect x="12" y="12" width="296" height="196" rx="18" fill="${p.surfaceAlt}" opacity="0.34"/>
    <rect x="24" y="26" width="272" height="168" rx="20" fill="#ffffff" opacity="0.72" stroke="${p.secondary}" stroke-width="2"/>
    <path d="M28 188 C92 172 136 178 188 186 C234 194 266 194 292 184" stroke="${p.accent}" stroke-width="4" opacity="0.45" stroke-linecap="round"/>
    ${experienceMotifBody(meta.motif, p)}
  `;
  return svg({
    width: 320,
    height: 220,
    viewBox: '0 0 320 220',
    title: meta.title,
    desc: meta.caption,
    body,
  });
}

function writeCollectionAssets(id, meta) {
  const p = meta.palette;

  write(`icons/${id}.svg`, svg({
    width: 64,
    height: 64,
    viewBox: '0 0 64 64',
    title: `${meta.title} icon`,
    desc: meta.direction,
    body: `<rect width="64" height="64" rx="16" fill="${p.surface}"/>${iconBody(id, p)}`,
  }));

  write(`collection-badges/${id}.svg`, svg({
    width: 128,
    height: 128,
    viewBox: '0 0 128 128',
    title: `${meta.title} badge`,
    desc: meta.direction,
    body: `
      <rect width="128" height="128" rx="28" fill="${p.surface}"/>
      <rect x="12" y="12" width="104" height="104" rx="22" fill="#ffffff" opacity="0.76" stroke="${p.secondary}" stroke-width="2"/>
      <g transform="translate(32 28)">${iconBody(id, p)}</g>
      <path d="M24 100 H104" stroke="${p.accent}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
    `,
  }));

  write(`patterns/${id}.svg`, svg({
    width: 240,
    height: 240,
    viewBox: '0 0 240 240',
    title: `${meta.title} pattern`,
    desc: meta.direction,
    body: `<rect width="240" height="240" fill="${p.surface}"/>${patternBody(id, p)}`,
  }));

  write(`backgrounds/${id}.svg`, svg({
    width: 1600,
    height: 900,
    viewBox: '0 0 1600 900',
    title: `${meta.title} background`,
    desc: meta.direction,
    body: backgroundBody(id, p),
  }));

  write(`illustrations/collections/${id}.svg`, svg({
    width: 640,
    height: 420,
    viewBox: '0 0 640 420',
    title: `${meta.title} illustration`,
    desc: meta.direction,
    body: `
      <rect width="640" height="420" rx="32" fill="${p.surface}"/>
      <rect x="20" y="20" width="600" height="380" rx="28" fill="${p.surfaceAlt}" opacity="0.34"/>
      ${collectionIllustrationBody(id, p)}
    `,
  }));
}

function writeExperienceAssets(id, meta) {
  const collection = collectionVars(meta.collection);
  write(`illustrations/experiences/${id}.svg`, experienceSvg(id, { ...meta, title: id }, collection.palette));
}

// Only run the base-asset build when invoked directly (not when imported as a
// reusable module by other generators). This keeps the existing `node scripts/...`
// behavior identical while letting the production-asset generator reuse the
// parametric motif functions without re-writing the base assets.
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  for (const [id, meta] of Object.entries(collections)) {
    writeCollectionAssets(id, meta);
  }

  for (const [id, meta] of Object.entries(experiences)) {
    writeExperienceAssets(id, meta);
  }

  write('icons/bookmark.svg', svg({
    width: 64,
    height: 64,
    viewBox: '0 0 64 64',
    title: 'Bookmark icon',
    desc: 'A slim editorial bookmark used for saved items.',
    body: `
      <rect width="64" height="64" rx="16" fill="#F4F1EA"/>
      <path d="M22 14 H42 A4 4 0 0 1 46 18 V50 L32 40 L18 50 V18 A4 4 0 0 1 22 14 Z" fill="#ffffff" stroke="#2E3F57" stroke-width="3" stroke-linejoin="round"/>
      <path d="M22 24 H42" stroke="#D48A3A" stroke-width="3" stroke-linecap="round"/>
    `,
  }));

  write('asset-index.json', JSON.stringify({
    generatedAt: new Date().toISOString(),
    collections: Object.keys(collections),
    experiences: Object.keys(experiences),
    folders: dirs,
  }, null, 2));

  console.log(`✅ Generated Library Season 1 visual assets in ${path.relative(ROOT, ASSET_ROOT)}`);
}
