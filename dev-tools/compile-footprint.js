const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUTPUT_DIR = path.join(ROOT, 'library');
const MANIFEST_PATH = path.join(ROOT, 'core-data', 'manifest.json');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'template.html');
const LIBRARY_PATH = path.join(ROOT, 'library.html');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');

// 1. Extract affiliate tag from existing source code
function extractAffiliateTag() {
  const candidates = ['index.html', 'library.html', 'stroop-effect.html'];
  for (const file of candidates) {
    const filePath = path.join(ROOT, file);
    if (!fs.existsSync(filePath)) continue;
    const html = fs.readFileSync(filePath, 'utf-8');
    const match = html.match(/[?&]tag=([a-zA-Z0-9\-]+)/);
    if (match && match[1]) {
      console.log(`Extracted affiliate tag '${match[1]}' from ${file}`);
      return match[1];
    }
  }
  throw new Error('Could not extract Amazon affiliate tag from source files.');
}

// 2. Read source layouts
function readBuildInputs() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  return { manifest, template };
}

// 3. Directory provisioning
function ensureOutputDirectory() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  } else {
    // Clean existing generated files to avoid stale footprint
    const existing = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.html'));
    for (const f of existing) {
      fs.unlinkSync(path.join(OUTPUT_DIR, f));
    }
    console.log(`Cleaned ${existing.length} existing files from ${OUTPUT_DIR}`);
  }
}

// 4. Generation loop
function generatePages(manifest, template, tag) {
  const generated = [];
  for (const item of manifest.catalog) {
    const affiliateLink = `https://www.amazon.com/dp/${item.asin}/?tag=${tag}`;
    const pageTitle = `${item.title} — ${item.category} Analysis | The 2-Second Witness`;
    const metaDescription = item.summary;
    const keywords = item.targetKeywords.join(', ');
    const keywordTags = item.targetKeywords.map(kw =>
      `<span class="text-[10px] text-slate-400 border border-slate-700 px-2 py-1 rounded">${kw}</span>`
    ).join('');
    const deepDiveText = item.deepDiveBriefing
      .split('\n\n')
      .map(p => `<p>${p.replace(/\n/g, ' ')}</p>`)
      .join('\n');

    let html = template
      .replace(/\{\{PAGE_TITLE\}\}/g, pageTitle)
      .replace(/\{\{META_DESCRIPTION\}\}/g, metaDescription)
      .replace(/\{\{CONTENT_BADGE\}\}/g, item.category.toUpperCase() + ' // FIELD ANALYSIS')
      .replace(/\{\{DEEP_DIVE_TEXT\}\}/g, deepDiveText)
      .replace(/\{\{AFFILIATE_LINK\}\}/g, affiliateLink)
      .replace(/\{\{TITLE\}\}/g, item.title)
      .replace(/\{\{AUTHOR\}\}/g, item.author)
      .replace(/\{\{CATEGORY\}\}/g, item.category)
      .replace(/\{\{TARGET_KEYWORDS\}\}/g, keywords)
      .replace(/\{\{SLUG\}\}/g, item.slug)
      .replace(/\{\{KEYWORD_TAGS\}\}/g, keywordTags);

    const outFile = path.join(OUTPUT_DIR, `${item.slug}.html`);
    fs.writeFileSync(outFile, html, 'utf-8');
    generated.push({ ...item, file: outFile, affiliateLink });
  }
  console.log(`Generated ${generated.length} pages in ${OUTPUT_DIR}`);
  return generated;
}

// 5a. Update library.html dynamic catalog
function updateLibraryHub(generated) {
  let html = fs.readFileSync(LIBRARY_PATH, 'utf-8');
  const cards = generated.map(item => {
    return `
    <a href="library/${item.slug}.html" class="block bg-slate-900/50 border border-slate-800 rounded-lg p-5 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all">
      <span class="text-[9px] tracking-[2px] text-cyan-400 uppercase border border-cyan-400/30 px-2 py-0.5 inline-block mb-2">${item.category}</span>
      <h3 class="font-display text-sm text-slate-50 mb-1 leading-snug">${item.title}</h3>
      <p class="text-slate-500 text-xs mb-3">${item.author}</p>
      <p class="text-slate-400 text-xs leading-relaxed line-clamp-3">${item.summary}</p>
    </a>`;
  }).join('\n');

  const gridContent = `
<section class="py-16 md:py-24 relative bg-zinc-950">
  <div class="max-w-[1200px] mx-auto px-5 relative z-10">
    <div class="flex items-center gap-3 mb-10">
      <span class="text-[10px] tracking-[2px] text-slate-950 bg-emerald-400 px-3 py-1 uppercase font-bold">EXPANDED CATALOG</span>
      <h2 class="font-display text-lg md:text-xl text-cyan-400 tracking-[2px]">PROGRAMMATIC FIELD RESOURCES</h2>
      <span class="flex-1 h-px bg-gradient-to-r from-cyan-400/20 to-transparent"></span>
    </div>
    <div id="programmatic-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
${cards}
    </div>
  </div>
</section>`;

  const startMarker = '<!-- PROGRAMMATIC_CATALOG_START -->';
  const endMarker = '<!-- PROGRAMMATIC_CATALOG_END -->';
  const startIdx = html.indexOf(startMarker);
  const endIdx = html.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error('library.html markers not found. Cannot inject dynamic catalog.');
  }
  html = html.slice(0, startIdx) + startMarker + '\n' + gridContent + '\n' + endMarker + html.slice(endIdx + endMarker.length);
  fs.writeFileSync(LIBRARY_PATH, html, 'utf-8');
  console.log(`Updated library.html with ${generated.length} generated links.`);
}

// 5b. Update sitemap.xml idempotently
function updateSitemap(generated) {
  let sitemap = fs.readFileSync(SITEMAP_PATH, 'utf-8');
  const closeTag = '</urlset>';
  if (!sitemap.includes(closeTag)) {
    throw new Error('sitemap.xml does not contain closing </urlset> tag.');
  }

  // Remove any existing library/ URLs to keep the sitemap idempotent
  const lines = sitemap.split('\n');
  const filtered = lines.filter(line => !line.includes('/library/'));
  let cleaned = filtered.join('\n');

  const newUrls = generated.map(item =>
    `  <url><loc>https://ittybittybites.github.io/library/${item.slug}.html</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`
  ).join('\n');

  cleaned = cleaned.replace(closeTag, newUrls + '\n' + closeTag);
  fs.writeFileSync(SITEMAP_PATH, cleaned, 'utf-8');
  console.log(`Updated sitemap.xml with ${generated.length} library URLs (idempotent).`);
}

// Main execution
function main() {
  try {
    const tag = extractAffiliateTag();
    const { manifest, template } = readBuildInputs();
    ensureOutputDirectory();
    const generated = generatePages(manifest, template, tag);
    updateLibraryHub(generated);
    updateSitemap(generated);
    console.log('\n✅ Programmatic footprint compilation complete.');
  } catch (err) {
    console.error('\n❌ Compilation failed:', err.message);
    process.exit(1);
  }
}

main();
