#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'src/generated/registry.json');
const SITEMAP_PATH = path.join(ROOT, 'public/sitemap.xml');

function readJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf-8')); }

const registry = readJSON(REGISTRY_PATH);
const experiences = registry.experiences || [];
const collections = registry.collections || [];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ittybittybites.github.io/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://ittybittybites.github.io/experiences</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://ittybittybites.github.io/collections</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://ittybittybites.github.io/library</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;

// Add individual experiences
experiences.forEach(e => {
  xml += `  <url>
    <loc>https://ittybittybites.github.io/experience/${e.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
});

xml += `</urlset>`;

fs.writeFileSync(SITEMAP_PATH, xml);
console.log('✅ Generated sitemap.xml with ' + (4 + experiences.length) + ' URLs.');
