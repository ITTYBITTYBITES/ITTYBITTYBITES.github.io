/**
 * BUILD ENGINE — Autonomous Programmatic SEO Static Site Generator
 * ==================================================================
 * Server-side only. Runs on GitHub Actions.
 *
 * Three autonomous engines:
 *  1. SEMANTIC EXPANSION — Discovers new cognitive topics via Wikipedia/Wikidata
 *  2. PERSONA MINING     — Auto-generates new personas from industry + modifier combos
 *  3. AFFILIATE CURATION — Validates ASINs, pulls fresh books via Open Library
 *
 * All discoveries are written back to source JSON files so the sitemap
 * and all downstream systems track them automatically.
 *
 * Usage: node build-engine.js [--section=all|library|intel|feeds|expand|curate] [--dry-run]
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ─── Project Paths ─────────────────────────────────────────────────────────────
const ROOT = __dirname;
const OUTPUT_DIR   = path.join(ROOT, 'library');
const INTEL_DIR    = path.join(ROOT, 'intel');
const TOPICS_PATH  = path.join(ROOT, 'pipeline-data', 'topics.json');
const PERSONAS_PATH = path.join(ROOT, 'pipeline-data', 'personas.json');
const MANIFEST_PATH = path.join(ROOT, 'core-data', 'manifest.json');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'template.html');
const LIBRARY_PATH  = path.join(ROOT, 'library.html');
const SITEMAP_PATH  = path.join(ROOT, 'sitemap.xml');
const BASE_URL      = 'https://ittybittybites.github.io';

// ─── Configuration ─────────────────────────────────────────────────────────────
const CONFIG = {
  affiliateTag: 'ittybittybite-20',
  feedThrottleMs: 1200,
  feedTimeoutMs: 8000,
  maxLiveProducts: 4,
  asinValidationTimeout: 5000,
  maxNewTopicsPerRun: 3,      // Cap new topics discovered per run
  maxNewPersonasPerRun: 2,    // Cap new personas discovered per run
  buildTimestamp: new Date().toISOString(),
};

// ─── Utility Functions ─────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchUrl(url, timeoutMs = CONFIG.feedTimeoutMs) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, {
      headers: { 'User-Agent': 'ITTYBITTYBITES-SSG/1.0 (+https://ittybittybites.github.io)' }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location, timeoutMs).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function amazonizeUrl(url, tag = CONFIG.affiliateTag) {
  try {
    const u = new URL(url);
    const strip = ['tag', 'ref', 'linkId', 'smid', 'ascsubtag', 'camp', 'creative', 'keywords', 'subid', 'ie', 'linkCode'];
    strip.forEach(p => u.searchParams.delete(p));
    u.searchParams.set('tag', tag);
    return u.toString();
  } catch {
    return url;
  }
}

function toTitleCase(str) {
  return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
}

async function fetchFeedItems(feedUrl, maxItems = 8) {
  try {
    const raw = await fetchUrl(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
    const data = JSON.parse(raw);
    if (!data.items || data.items.length === 0) return [];
    return data.items.slice(0, maxItems).map(item => ({
      title: item.title || '',
      link: item.link || '',
      description: (item.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200),
      pubDate: item.pubDate || '',
    }));
  } catch (err) {
    console.warn(`  ⚠ Feed failed: ${feedUrl} — ${err.message}`);
    return [];
  }
}

// ─── Step 0: Extract Affiliate Tag ─────────────────────────────────────────────

function extractAffiliateTag() {
  const candidates = ['index.html', 'library.html', 'stroop-effect.html'];
  for (const file of candidates) {
    const filePath = path.join(ROOT, file);
    if (!fs.existsSync(filePath)) continue;
    const html = fs.readFileSync(filePath, 'utf-8');
    const match = html.match(/[?&]tag=([a-zA-Z0-9\-]+)/);
    if (match && match[1]) { CONFIG.affiliateTag = match[1]; return; }
  }
  console.warn('⚠ Using default affiliate tag.');
}

// ─── Step 1: SEMANTIC EXPANSION ENGINE ─────────────────────────────────────────

/**
 * Queries Wikidata SPARQL API for cognitive/neuroscience sub-topics and
 * discovers new topic entries that don't already exist in topics.json.
 * Completely autonomous — no manual entry needed.
 */
async function semanticExpansionEngine(currentTopics) {
  console.log('\n🧠 [ENGINE 1] Semantic Expansion — discovering new cognitive topics...');

  const wikidataQuery = encodeURIComponent(`
    SELECT DISTINCT ?item ?itemLabel WHERE {
      { ?item wdt:P279 wd:Q420867 } UNION   # subcategory of Cognitive neuroscience
      { ?item wdt:P279 wd:Q728929 } UNION   # subcategory of Cognitive psychology
      { ?item wdt:P279 wd:Q494695 }         # subcategory of Decision making
      ?item wdt:P31 wd:Q12136.              # instance of Mental process
      FILTER(LANG(?itemLabel) = "en")
    }
    LIMIT 30
  `);

  const url = `https://query.wikidata.org/sparql?format=json&query=${wikidataQuery}`;

  let discovered = [];
  try {
    const raw = await fetchUrl(url, 15000);
    const data = JSON.parse(raw);
    const results = data.results?.bindings || [];

    console.log(`  ✓ Wikidata returned ${results.length} cognitive concepts`);

    for (const row of results) {
      const rawLabel = row.itemLabel?.value || '';
      const wikidataId = row.item?.value?.split('/').pop() || '';

      // Skip short labels, very long labels, and anything too generic
      if (rawLabel.length < 5 || rawLabel.length > 80) continue;
      if (/[0-9]{4,}/.test(rawLabel)) continue; // Skip years
      if (['list', 'overview', 'guide', 'introduction', 'theory'].some(b => rawLabel.toLowerCase().includes(b))) continue;

      const slug = slugify(rawLabel);

      // Skip if already exists
      if (currentTopics.some(t => t.slug === slug)) continue;

      // Pick an icon and color based on keyword patterns
      let icon = '◉', color = '#22d3ee';
      const lower = rawLabel.toLowerCase();
      if (lower.includes('memory'))      { icon = '🧠'; color = '#a78bfa'; }
      else if (lower.includes('attention')) { icon = '👁'; color = '#34d399'; }
      else if (lower.includes('decision')) { icon = '⚖'; color = '#facc15'; }
      else if (lower.includes('bias'))   { icon = '⚠'; color = '#f87171'; }
      else if (lower.includes('emotion') || lower.includes('stress')) { icon = '🔥'; color = '#fb923c'; }
      else if (lower.includes('sleep') || lower.includes('fatigue')) { icon = '🌙'; color = '#818cf8'; }
      else if (lower.includes('learning') || lower.includes('skill')) { icon = '📈'; color = '#22d3ee'; }

      discovered.push({
        slug,
        title: rawLabel,
        focus: `dynamically discovered via Wikidata — cognitive process analysis`,
        icon,
        color,
        universe: 'science',
        relatedBooks: [],
        source: 'wikidata',
        wikidataId,
        discoveredAt: CONFIG.buildTimestamp,
      });

      if (discovered.length >= CONFIG.maxNewTopicsPerRun) break;
    }
  } catch (err) {
    console.warn(`  ⚠ Wikidata query failed: ${err.message} — continuing with existing topics`);
  }

  // Also scrape trending science terms from ScienceDaily
  const scienceFeeds = [
    'https://www.sciencedaily.com/rss/mind_brain/behavior.xml',
    'https://www.sciencedaily.com/rss/mind_brain/psychology.xml',
  ];
  const scienceItems = [];
  for (const feed of scienceFeeds) {
    await sleep(CONFIG.feedThrottleMs);
    const items = await fetchFeedItems(feed, 10);
    scienceItems.push(...items);
  }

  // Extract technical phrases from ScienceDaily titles
  const techPatterns = [
    /([A-Z][a-z]+(?:ing|tion|ness|ment|ity|ics|ology)\b)/g,
    /([a-z]+\s+bias)/gi,
    /([a-z]+\s+effect)/gi,
    /([a-z]+\s+deficit)/gi,
    /([a-z]+\s+dysfunction)/gi,
  ];

  const existingSlugs = new Set(currentTopics.map(t => t.slug));
  for (const item of scienceItems) {
    for (const pattern of techPatterns) {
      const matches = item.title.matchAll(pattern);
      for (const match of matches) {
        const phrase = (match[1] || '').trim();
        if (phrase.length < 6 || phrase.length > 60) continue;
        const slug = slugify(phrase);
        if (existingSlugs.has(slug)) continue;
        if (discovered.some(d => d.slug === slug)) continue;

        discovered.push({
          slug,
          title: toTitleCase(phrase),
          focus: `discovered from live ScienceDaily feed — ${item.title.slice(0, 60)}`,
          icon: '📡',
          color: '#22d3ee',
          universe: 'science',
          relatedBooks: [],
          source: 'sciencedaily',
          discoveredAt: CONFIG.buildTimestamp,
        });
        if (discovered.length >= CONFIG.maxNewTopicsPerRun) break;
      }
      if (discovered.length >= CONFIG.maxNewTopicsPerRun) break;
    }
    if (discovered.length >= CONFIG.maxNewTopicsPerRun) break;
  }

  if (discovered.length > 0) {
    console.log(`  ✓ Discovered ${discovered.length} new topics:`);
    discovered.forEach(t => console.log(`    → ${t.title} (${t.source})`));

    // Write discovered topics back to topics.json so sitemap tracks them
    const existing = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
    const updated = { ...existing, topics: [...existing.topics, ...discovered] };
    fs.writeFileSync(TOPICS_PATH, JSON.stringify(updated, null, 2), 'utf-8');
    console.log(`  ✓ topics.json updated — total topics now: ${updated.topics.length}`);
    return updated.topics;
  } else {
    console.log(`  ✓ No new topics discovered — existing matrix is current`);
    return currentTopics;
  }
}

// ─── Step 2: PERSONA MINING ENGINE ────────────────────────────────────────────

/**
 * Reads industry list, combines with cognitive context modifiers,
 * and auto-generates new persona entries that don't exist yet.
 * Completely autonomous.
 */
function personaMiningEngine(currentPersonas) {
  console.log('\n👥 [ENGINE 2] Persona Mining — discovering new target personas...');

  const industryModifiers = [
    'Remote', 'Field', 'Senior', 'Junior', 'Supervisory',
    'Sleep-Deprived', 'High-Stress', 'Multi-Project', 'Cross-Functional',
    'High-Volume', 'Time-Critical', 'Decentralized',
  ];

  const industryBases = [
    { name: 'Software Engineers', slug: 'software-engineers', universe: 'tech' },
    { name: 'Data Scientists', slug: 'data-scientists', universe: 'tech' },
    { name: 'Nurses', slug: 'nurses', universe: 'life' },
    { name: 'Pharmacists', slug: 'pharmacists', universe: 'life' },
    { name: 'Pilots', slug: 'pilots', universe: 'frontier' },
    { name: 'Police Officers', slug: 'police-officers', universe: 'frontier' },
    { name: 'Teachers', slug: 'teachers', universe: 'society' },
    { name: 'Financial Advisors', slug: 'financial-advisors', universe: 'society' },
    { name: 'Journalists', slug: 'journalists', universe: 'society' },
    { name: 'Athletic Coaches', slug: 'athletic-coaches', universe: 'life' },
    { name: 'HR Managers', slug: 'hr-managers', universe: 'society' },
    { name: 'Research Scientists', slug: 'research-scientists', universe: 'science' },
  ];

  const existingSlugs = new Set(currentPersonas.map(p => p.slug));
  const discovered = [];

  for (const base of industryBases) {
    for (const mod of industryModifiers) {
      const combinedName = `${mod} ${base.name}`;
      const slug = slugify(combinedName);

      if (existingSlugs.has(slug)) continue;
      if (discovered.some(d => d.slug === slug)) continue;

      const tags = [base.slug, mod.toLowerCase(), 'high-pressure', 'cognitive-load'];
      const commonTags = ['split-second decisions', 'attention management', 'decision accuracy'];
      const allTags = [...new Set([...tags, ...commonTags])];

      discovered.push({
        slug,
        name: combinedName,
        description: `${combinedName} — high-pressure operational environment requiring cognitive optimization under stress, time pressure, and information overload.`,
        tags: allTags,
        universe: base.universe,
        source: 'auto-generated',
        discoveredAt: CONFIG.buildTimestamp,
      });

      if (discovered.length >= CONFIG.maxNewPersonasPerRun) break;
    }
    if (discovered.length >= CONFIG.maxNewPersonasPerRun) break;
  }

  if (discovered.length > 0) {
    console.log(`  ✓ Discovered ${discovered.length} new personas:`);
    discovered.forEach(p => console.log(`    → ${p.name}`));

    const existing = JSON.parse(fs.readFileSync(PERSONAS_PATH, 'utf-8'));
    const updated = { ...existing, personas: [...existing.personas, ...discovered] };
    fs.writeFileSync(PERSONAS_PATH, JSON.stringify(updated, null, 2), 'utf-8');
    console.log(`  ✓ personas.json updated — total personas now: ${updated.personas.length}`);
    return updated.personas;
  } else {
    console.log(`  ✓ No new personas needed — existing matrix is current`);
    return currentPersonas;
  }
}

// ─── Step 3: AFFILIATE CURATION ENGINE ────────────────────────────────────────

/**
 * Validates existing ASINs via HTTP HEAD check against Amazon.
 * Pulls replacement books via Open Library API based on topic keywords.
 * Auto-updates manifest.json with fresh, validated entries.
 */
async function affiliateCurationEngine(manifest) {
  console.log('\n💰 [ENGINE 3] Affiliate Curation — validating and refreshing ASINs...');

  const curated = [];

  for (const item of manifest.catalog) {
    const validated = await validateAsin(item.asin);

    if (validated) {
      curated.push(item);
      console.log(`  ✓ ${item.asin} — VALID: ${item.title}`);
    } else {
      console.log(`  ✗ ${item.asin} — DEAD LINK: ${item.title}`);

      // Attempt automatic replacement via Open Library
      const replacement = await findReplacementViaOpenLibrary(item.title, item.category);
      if (replacement) {
        console.log(`  ↳ Auto-replaced with: ${replacement.title} (${replacement.asin})`);
        curated.push(replacement);
      } else {
        console.log(`  ↳ No replacement found — item removed from catalog`);
      }
    }
  }

  // Also check for books in the topic-related context and auto-add new candidates
  // for any topics that have empty or sparse relatedBooks arrays
  const topicsData = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
  const newCandidates = await discoverBooksViaOpenLibrary(topicsData.topics);
  console.log(`  ✓ Open Library found ${newCandidates.length} candidate book entries`);

  const merged = [...curated, ...newCandidates.filter(n => !curated.some(c => c.asin === n.asin))];
  const finalManifest = { ...manifest, catalog: merged };

  // Write updated manifest so next build uses validated data
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(finalManifest, null, 2), 'utf-8');
  console.log(`  ✓ manifest.json curated — ${curated.length} validated, ${newCandidates.length} new additions`);

  return finalManifest;
}

/**
 * Validate an ASIN by sending a HEAD request to its Amazon page.
 * Returns true if the page is reachable (not 404), false otherwise.
 */
async function validateAsin(asin) {
  const url = `https://www.amazon.com/dp/${asin}/?tag=${CONFIG.affiliateTag}`;
  return new Promise(resolve => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SSG-Validator/1.0)' },
      method: 'HEAD',
    }, res => {
      // Amazon redirects 404s to a search/category page — check for that
      const isDead = res.statusCode === 404 || (res.statusCode === 302 && res.headers.location?.includes('search'));
      resolve(!isDead);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.setTimeout(CONFIG.asinValidationTimeout);
  });
}

/**
 * Query Open Library Search API to find a replacement book matching the title/category.
 * Open Library ISBN-10 values map directly to Amazon ASINs in most cases.
 */
async function findReplacementViaOpenLibrary(title, category) {
  try {
    const query = encodeURIComponent(title.split(' ').slice(0, 4).join(' '));
    await sleep(CONFIG.feedThrottleMs);
    const raw = await fetchUrl(`https://openlibrary.org/search.json?q=${query}&fields=title,author_name,isbn,subject&limit=5`);
    const data = JSON.parse(raw);

    if (!data.docs || data.docs.length === 0) return null;

    for (const doc of data.docs) {
      // ISBN-10 is the Amazon ASIN for most global book editions
      const isbn10 = (doc.isbn || []).find(i => i.length === 10);

      if (!isbn10) continue;

      // Validate the replacement ASIN before adding
      const isValid = await validateAsin(isbn10);
      if (isValid) {
        const keywords = [
          slugify(title),
          ...(doc.subject || []).slice(0, 4).map(s => slugify(s)),
        ];
        return {
          asin: isbn10,
          slug: slugify(doc.title),
          category: category || 'Cognitive Processing',
          title: doc.title,
          author: (doc.author_name || ['Unknown Author'])[0],
          targetKeywords: keywords,
          summary: `Dynamically discovered via Open Library — ${doc.title} by ${(doc.author_name || ['Unknown'])[0]}. Related to: ${category}.`,
          deepDiveBriefing: `This resource was automatically sourced and validated from Open Library as a replacement for an unavailable listing. It relates to the ${category} domain and supports cognitive processing training protocols.\n\nTitle: ${doc.title}\nAuthor: ${(doc.author_name || ['Unknown'])[0]}\nOpen Library subjects: ${(doc.subject || []).slice(0, 5).join(', ')}`,
        };
      }
    }
    return null;
  } catch (err) {
    console.warn(`  ⚠ Open Library lookup failed for "${title}": ${err.message}`);
    return null;
  }
}

/**
 * For each topic in the matrix, query Open Library for relevant books
 * that aren't already in the manifest. Auto-add high-quality candidates.
 */
async function discoverBooksViaOpenLibrary(topics) {
  const candidates = [];
  const existingAsins = new Set();

  for (const topic of topics.slice(0, 8)) { // Cap at 8 topic queries
    await sleep(CONFIG.feedThrottleMs);
    try {
      const query = encodeURIComponent(topic.title);
      const raw = await fetchUrl(`https://openlibrary.org/search.json?q=${query}&fields=title,author_name,isbn,subject&limit=3&sort=rating`);
      const data = JSON.parse(raw);

      if (!data.docs) continue;

      for (const doc of data.docs) {
        const isbn10 = (doc.isbn || []).find(i => i.length === 10);
        if (!isbn10 || existingAsins.has(isbn10)) continue;

        // Validate before adding
        const isValid = await validateAsin(isbn10);
        if (!isValid) continue;

        existingAsins.add(isbn10);
        candidates.push({
          asin: isbn10,
          slug: slugify(doc.title),
          category: toTitleCase(topic.universe) || 'Cognitive Processing',
          title: doc.title,
          author: (doc.author_name || ['Unknown Author'])[0],
          targetKeywords: [
            slugify(topic.title),
            ...(doc.subject || []).slice(0, 3).map(s => slugify(s)),
          ],
          summary: `Auto-discovered via Open Library — ${doc.title} by ${(doc.author_name || ['Unknown'])[0]}. Related to: ${topic.title}.`,
          deepDiveBriefing: `This entry was autonomously discovered and validated during a nightly build cycle. The resource "${doc.title}" by ${(doc.author_name || ['Unknown'])[0]} relates directly to the "${topic.title}" cognitive training protocol.\n\nSubject tags: ${(doc.subject || []).slice(0, 5).join(', ')}\nSource: Open Library API\nDiscovery date: ${CONFIG.buildTimestamp}`,
        });
        console.log(`  → Auto-added: ${doc.title} (ASIN: ${isbn10})`);
      }
    } catch (err) {
      console.warn(`  ⚠ Book discovery failed for "${topic.title}": ${err.message}`);
    }
  }

  return candidates;
}

// ─── Step 4: Fetch Live Feed Data ─────────────────────────────────────────────

async function fetchLiveFeedData() {
  console.log('\n🌐 Fetching live feed data (server-side)...');
  const feeds = [
    { name: 'ScienceDaily Mind & Brain', url: 'https://www.sciencedaily.com/rss/mind_brain/behavior.xml', max: 8 },
    { name: 'NPR Books', url: 'https://feeds.npr.org/1006/rss.xml', max: 6 },
    { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', max: 5 },
  ];

  const liveData = { scienceItems: [], bookItems: [], techItems: [] };

  for (const feed of feeds) {
    await sleep(CONFIG.feedThrottleMs);
    const items = await fetchFeedItems(feed.url, feed.max);
    console.log(`  ✓ Fetched ${items.length} items from ${feed.name}`);
    if (feed.name.includes('Science')) liveData.scienceItems.push(...items);
    else if (feed.name.includes('Books')) liveData.bookItems.push(...items);
    else liveData.techItems.push(...items);
  }

  console.log(`  Total live items: ${liveData.scienceItems.length + liveData.bookItems.length + liveData.techItems.length}`);
  return liveData;
}

// ─── Step 5: Generate Library Pages ──────────────────────────────────────────

function generateLibraryPages(manifest, template, liveData) {
  console.log('\n📚 Generating library pages...');
  ensureDir(OUTPUT_DIR);

  const existing = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.html'));
  for (const f of existing) fs.unlinkSync(path.join(OUTPUT_DIR, f));
  console.log(`  ✓ Cleaned ${existing.length} existing library pages`);

  const generated = [];

  for (const item of manifest.catalog) {
    const affiliateLink = `https://www.amazon.com/dp/${item.asin}/?tag=${CONFIG.affiliateTag}`;
    const pageTitle = `${item.title} — ${item.category} Analysis | The 2-Second Witness`;
    const metaDescription = item.summary.slice(0, 160);
    const keywords = item.targetKeywords.join(', ');
    const keywordTags = item.targetKeywords.map(kw =>
      `<span class="text-[10px] text-slate-400 border border-slate-700 px-2 py-1 rounded">${kw}</span>`
    ).join('');

    const deepDiveText = item.deepDiveBriefing
      .split('\n\n')
      .map(p => `<p>${p.replace(/\n/g, ' ')}</p>`)
      .join('\n');

    const liveProducts = (liveData.bookItems || []).slice(0, CONFIG.maxLiveProducts).map(p => `
      <div class="border-l-2 border-emerald-500 pl-4 my-3">
        <h4 class="font-bold text-sm text-slate-200 mb-1">${p.title}</h4>
        <p class="text-slate-400 text-xs mb-2">${p.description}</p>
        <a href="${amazonizeUrl(p.link || `https://www.amazon.com/s?k=${encodeURIComponent(p.title)}&tag=${CONFIG.affiliateTag}`)}"
           target="_blank" rel="noopener noreferrer"
           class="text-cyan-400 text-xs hover:text-emerald-400 transition-colors">
          ACQUIRE RESOURCE &gt;&gt;
        </a>
      </div>`).join('');

    let html = template
      .replace(/\{\{PAGE_TITLE\}\}/g, pageTitle)
      .replace(/\{\{META_DESCRIPTION\}\}/g, metaDescription)
      .replace(/\{\{CONTENT_BADGE\}\}/g, (item.category || 'General').toUpperCase() + ' // FIELD ANALYSIS')
      .replace(/\{\{DEEP_DIVE_TEXT\}\}/g, deepDiveText + (liveProducts ? `\n\n<div class="mt-8 pt-6 border-t border-cyan-400/10">\n  <h3 class="text-lg font-bold text-cyan-300 mb-4">Live Contextual Resources</h3>\n  ${liveProducts}\n</div>` : ''))
      .replace(/\{\{AFFILIATE_LINK\}\}/g, affiliateLink)
      .replace(/\{\{TITLE\}\}/g, item.title)
      .replace(/\{\{AUTHOR\}\}/g, item.author || 'Unknown')
      .replace(/\{\{CATEGORY\}\}/g, item.category || 'General')
      .replace(/\{\{TARGET_KEYWORDS\}\}/g, keywords)
      .replace(/\{\{SLUG\}\}/g, item.slug)
      .replace(/\{\{KEYWORD_TAGS\}\}/g, keywordTags);

    const outFile = path.join(OUTPUT_DIR, `${item.slug}.html`);
    fs.writeFileSync(outFile, html, 'utf-8');
    generated.push({ ...item, file: outFile, affiliateLink });
  }

  console.log(`✓ Generated ${generated.length} library pages`);
  return generated;
}

// ─── Step 6: Generate Intel Pages ─────────────────────────────────────────────

function generateIntelPages(topics, personas, liveData) {
  console.log(`\n⚡ Generating intel pages (${topics.length} topics × ${personas.length} personas)...`);
  ensureDir(INTEL_DIR);

  const existing = fs.readdirSync(INTEL_DIR).filter(f => f.endsWith('.html'));
  for (const f of existing) fs.unlinkSync(path.join(INTEL_DIR, f));
  console.log(`  ✓ Cleaned ${existing.length} existing intel pages`);

  const pageTemplate = buildIntelPageTemplate();
  const generated = [];
  const total = topics.length * personas.length;
  let count = 0;

  for (const topic of topics) {
    for (const persona of personas) {
      const pageSlug = `${topic.slug}-for-${persona.slug}`;
      const pageTitle = `${topic.title} Optimization for ${persona.name}`;
      const canonicalUrl = `${BASE_URL}/intel/${pageSlug}.html`;

      const scienceCards = (liveData.scienceItems || []).slice(0, 4).map(item => {
        const date = item.pubDate ? new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
        return `
          <article class="bg-slate-900/50 border border-slate-800 rounded-lg p-4 border-l-2 border-emerald-500 hover:border-cyan-400 transition-all">
            <span class="text-[9px] tracking-[2px] text-emerald-400 uppercase mb-1 block">SCIENCE WIRE</span>
            <h4 class="font-display text-xs text-slate-50 mb-1 leading-snug">${item.title}</h4>
            <time class="text-slate-500 text-[9px] uppercase tracking-[1px] mb-2 block">${date}</time>
            <a href="${amazonizeUrl(item.link, CONFIG.affiliateTag)}" target="_blank" rel="noopener noreferrer"
               class="text-cyan-400 text-[10px] hover:text-emerald-400 transition-colors">READ BRIEFING &gt;&gt;</a>
          </article>`;
      }).join('');

      const personaTagList = persona.tags.map(t =>
        `<span class="text-[10px] text-slate-400 border border-slate-700 px-2 py-1 rounded">${t}</span>`
      ).join('');

      // Build related books section from topic.relatedBooks
      const relatedBooks = (topic.relatedBooks || []).slice(0, 4).map(slug =>
        `<a href="../library/${slug}.html" class="article-card p-4 hover:border-cyan-400 transition-all text-center">
           <span class="text-[9px] tracking-[2px] text-cyan-400 uppercase block mb-1">RESOURCE</span>
           <span class="font-display text-xs text-slate-50">${toTitleCase(slug.replace(/-/g, ' '))}</span>
         </a>`
      ).join('');

      let html = pageTemplate
        .replace(/\{\{PAGE_TITLE\}\}/g, pageTitle)
        .replace(/\{\{PAGE_HEADER\}\}/g, topic.title)
        .replace(/\{\{TOPIC_FOCUS\}\}/g, topic.focus)
        .replace(/\{\{TARGET_PERSONA\}\}/g, persona.name)
        .replace(/\{\{PERSONA_TAGS\}\}/g, personaTagList)
        .replace(/\{\{TOPIC_ICON\}\}/g, topic.icon || '◉')
        .replace(/\{\{TOPIC_COLOR\}\}/g, topic.color || '#22d3ee')
        .replace(/\{\{SCIENCE_CARDS\}\}/g, scienceCards)
        .replace(/\{\{SLUG\}\}/g, pageSlug)
        .replace(/\{\{CANONICAL_URL\}\}/g, canonicalUrl)
        .replace(/\{\{RELATED_BOOKS\}\}/g, relatedBooks);

      fs.writeFileSync(path.join(INTEL_DIR, `${pageSlug}.html`), html, 'utf-8');
      generated.push({ slug: pageSlug, topic: topic.slug, persona: persona.slug, title: pageTitle });
      count++;
      if (count % 50 === 0) console.log(`  ↳ Progress: ${count}/${total}`);
    }
  }

  console.log(`✓ Generated ${count} intel pages`);
  return generated;
}

function buildIntelPageTemplate() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{PAGE_TITLE}} | The 2-Second Witness</title>
<meta name="description" content="Cognitive training protocol for {{TARGET_PERSONA}}: optimizing {{TOPIC_FOCUS}} with evidence-based field techniques.">
<meta name="keywords" content="{{TOPIC_FOCUS}}, cognitive training, {{TARGET_PERSONA}}, decision speed, attention training">
<link rel="canonical" href="{{CANONICAL_URL}}">
<meta property="og:type" content="article">
<meta property="og:url" content="{{CANONICAL_URL}}">
<meta property="og:title" content="{{PAGE_TITLE}}">
<meta property="og:description" content="Cognitive training protocol for {{TARGET_PERSONA}}: optimizing {{TOPIC_FOCUS}}.">
<meta property="og:site_name" content="The 2-Second Witness">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Orbitron:wght@400;700;900&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script>
tailwind.config = {
  theme: {
    extend: {
      colors: {
        gold: { 400: '#facc15', 500: '#eab308' },
        slate: { 950: '#020617', 900: '#0f172a', 800: '#1e293b' },
        zinc: { 950: '#09090b', 900: '#18181b' },
        emerald: { 400: '#34d399', 500: '#10b981', 950: '#022c22' },
        cyan: { 400: '#22d3ee', 500: '#06b6d4', 950: '#083344' }
      },
      fontFamily: { mono: ['JetBrains Mono', 'monospace'], display: ['Orbitron', 'sans-serif'], body: ['Inter', 'sans-serif'] }
    }
  }
}
</script>
<style>
:root { --bg: #020617; --bg-alt: #09090b; --text: #f8fafc; --muted: #94a3b8; --cyan: #22d3ee; --emerald: #34d399; --gold: #facc15; --border: rgba(34,211,238,0.12); }
body::before { content: ''; position: fixed; inset: 0; background: linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px); background-size: 60px 60px; pointer-events: none; z-index: -1; }
.nav-node { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 12px; border: 1px solid var(--border); color: var(--muted); transition: all 0.2s ease; background: rgba(15,23,42,0.6); }
.nav-node:hover { color: var(--cyan); border-color: var(--cyan); box-shadow: 0 4px 14px rgba(34,211,238,0.18); transform: translateY(-1px); }
.badge { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--emerald); color: var(--emerald); padding: 8px 16px; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; box-shadow: 0 0 12px rgba(52,211,153,0.15); background: rgba(52,211,153,0.04); }
.article-card { background: rgba(15,23,42,0.85); border: 1px solid var(--border); border-radius: 10px; transition: border-color 0.3s, box-shadow 0.3s; }
.article-card:hover { border-color: var(--cyan); box-shadow: 0 0 24px rgba(34,211,238,0.1); }
.article-body p { margin-bottom: 1.25rem; color: #94a3b8; line-height: 1.75; }
.article-body strong { color: #f8fafc; }
.cta-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 16px 32px; font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 1px; border: 2px solid var(--gold); color: var(--gold); background: transparent; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; font-weight: 700; }
.cta-btn:hover { background: var(--gold); color: var(--bg); box-shadow: 0 0 28px rgba(250,204,21,0.35); }
.footer-link { color: var(--muted); transition: color 0.2s; }
.footer-link:hover { color: var(--cyan); }
</style>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{PAGE_TITLE}}",
  "description": "Cognitive training protocol for {{TARGET_PERSONA}}",
  "author": { "@type": "Organization", "name": "ITTY BITTY BITES" },
  "publisher": { "@type": "Organization", "name": "ITTY BITTY BITES" },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "{{CANONICAL_URL}}" }
}
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-6P6NPFW4FZ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-6P6NPFW4FZ');
</script>
<!-- Google AdSense Universal Publisher Tag -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1566091161594729" crossorigin="anonymous"></script>
</head>
<body class="bg-slate-950 text-slate-50 font-mono leading-relaxed overflow-x-hidden relative antialiased">
<nav class="bg-slate-950 border-b border-cyan-400/20 py-3 sticky top-0 z-50 backdrop-blur-md shadow-2xl select-none font-mono">
  <div class="max-w-[1200px] mx-auto px-4 flex justify-center gap-2 sm:gap-4 flex-wrap items-center font-bold">
    <a href="../index.html" class="nav-node">HQ</a>
    <a href="../arcade.html" class="nav-node">TACTICAL ARCADE</a>
    <a href="./" class="nav-node" style="color:var(--cyan);border-color:var(--cyan)">INTEL MATRIX</a>
    <a href="../feed.html" class="nav-node">INTEL FEED</a>
    <a href="../library.html" class="nav-node">GEAR LOCKER</a>
  </div>
</nav>
<section class="relative min-h-[35vh] flex flex-col justify-center items-center py-16 bg-zinc-950">
  <div class="max-w-[1100px] mx-auto px-5 text-center">
    <div style="border-color:{{TOPIC_COLOR}};color:{{TOPIC_COLOR}}" class="badge mb-4">{{TOPIC_ICON}} COGNITIVE PROTOCOL</div>
    <h1 class="font-display text-2xl md:text-3xl lg:text-4xl tracking-[3px] md:tracking-[5px] font-black uppercase mb-3" style="color:{{TOPIC_COLOR}}">{{PAGE_HEADER}}</h1>
    <p class="text-slate-400 text-sm">Operational Log Matrix for <strong class="text-slate-200">{{TARGET_PERSONA}}</strong></p>
  </div>
</section>
<section class="py-12 md:py-20 bg-slate-950">
  <div class="max-w-[900px] mx-auto px-5">
    <div class="article-card p-8 mb-8">
      <div class="flex flex-wrap gap-3 mb-6">
        <span class="text-[10px] tracking-[2px] px-3 py-1 uppercase font-bold" style="background:{{TOPIC_COLOR}};color:#020617">PROTOCOL</span>
        <span class="text-[10px] tracking-[2px] text-cyan-400 uppercase border border-cyan-400/30 px-3 py-1">{{TARGET_PERSONA}}</span>
      </div>
      <div class="article-body font-body text-sm md:text-base">
        <p>Optimizing for <strong>{{TOPIC_FOCUS}}</strong> demands unique tactical protocols when applied directly to the real-world operational challenges faced by <strong>{{TARGET_PERSONA}}</strong>. This log documents structural diagnostic solutions and field-tested methodology.</p>
        <p>The cognitive training protocols housed here are designed to be domain-agnostic — meaning the same attentional, perceptual, and decision-making principles that apply to competitive gaming apply equally to surgical environments, trading floors, and tactical field operations. The variable is context; the invariant is cognitive architecture.</p>
      </div>
      <div class="flex flex-wrap gap-2 mt-6">{{PERSONA_TAGS}}</div>
    </div>
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-8 text-center">
      <div class="aspect-video w-full mb-6 border border-slate-700 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
        <div class="text-center">
          <span class="text-4xl block mb-2">{{TOPIC_ICON}}</span>
          <p class="text-slate-500 text-xs uppercase tracking-[1px]">[ Interactive Training Simulator — Itch.io Embed ]</p>
        </div>
      </div>
      <a href="https://ittybittybites.itch.io/" target="_blank" rel="noopener noreferrer" class="cta-btn">Deploy Training Module >></a>
    </div>
    {{SCIENCE_CARDS}}
    <div class="mt-8 pt-8 border-t border-cyan-400/10">
      <h3 class="text-lg font-bold text-cyan-300 mb-4">Vetted Field Resources</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">{{RELATED_BOOKS}}</div>
    </div>
    <div class="text-center mt-12">
      <a href="./" class="inline-flex items-center justify-center gap-2 px-6 py-3 border border-cyan-400 text-cyan-400 font-mono text-xs tracking-[1px] uppercase hover:bg-cyan-400 hover:text-slate-950 transition-all">&lt;&lt; Return to Intel Matrix</a>
    </div>
  </div>
</section>
    <!-- UNIFIED LEGAL & MISSION FOOTER -->
    <footer class="border-t border-slate-900 bg-slate-950 py-16 px-6 mt-auto text-slate-500 font-mono text-xs leading-relaxed select-none">
        <div class="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-16 border-b border-slate-900 pb-16">
            <div>
                <h4 class="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-4 font-['Orbitron'] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> Tactical Briefings</h4>
                <div class="space-y-2.5 flex flex-col text-xs font-mono font-medium text-slate-300">
                    <a href="../stroop-effect.html" class="hover:text-gold transition-colors py-1 block">◈ The Stroop Effect</a>
                    <a href="../cognitive-biases.html" class="hover:text-gold transition-colors py-1 block">◈ 25 Cognitive Biases</a>
                    <a href="../decision-making.html" class="hover:text-gold transition-colors py-1 block">◈ System 1 vs System 2</a>
                    <a href="../rapid-thinking.html" class="hover:text-gold transition-colors py-1 block">◈ Rapid Thinking Protocols</a>
                    <a href="../dunning-kruger.html" class="hover:text-gold transition-colors py-1 block">◈ Dunning-Kruger Analysis</a>
                    <a href="../flow-state.html" class="hover:text-gold transition-colors py-1 block">◈ Flow State Triggers</a>
                </div>
            </div>

            <div>
                <h4 class="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-4 font-['Orbitron'] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Research Hub</h4>
                <div class="space-y-2.5 flex flex-col text-xs font-mono font-medium text-slate-300">
                    <a href="../social-engineering.html" class="hover:text-gold transition-colors py-1 block">◈ 10 Social Engineering Defenses</a>
                    <a href="../how-doctors-think.html" class="hover:text-gold transition-colors py-1 block">◈ How Doctors Think (Pattern Rec)</a>
                    <a href="../logical-fallacies.html" class="hover:text-gold transition-colors py-1 block">◈ 15 Logical Fallacies</a>
                    <a href="../pattern-recognition.html" class="hover:text-gold transition-colors py-1 block">◈ Pattern Recognition in Ops</a>
                    <a href="../priming-effect.html" class="hover:text-gold transition-colors py-1 block">◈ Cognitive Priming Override</a>
                    <a href="../false-memory.html" class="hover:text-gold transition-colors py-1 block">◈ The False Memory Problem</a>
                </div>
            </div>

            <div>
                <h4 class="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-4 font-['Orbitron'] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-gold"></span> Field Manuals</h4>
                <div class="space-y-2.5 flex flex-col text-xs font-mono font-medium text-slate-300">
                    <a href="../survival-skills.html" class="hover:text-gold transition-colors py-1 block">◈ 10 Wilderness Survival Skills</a>
                    <a href="../first-aid-basics.html" class="hover:text-gold transition-colors py-1 block">◈ First Aid Operational Basics</a>
                    <a href="../food-safety.html" class="hover:text-gold transition-colors py-1 block">◈ Food Safety Defenses</a>
                    <a href="../cybersecurity-beginners.html" class="hover:text-gold transition-colors py-1 block">◈ Cybersecurity for Beginners</a>
                    <a href="../best-brain-games.html" class="hover:text-gold transition-colors py-1 block">◈ Best Diagnostic Brain Games</a>
                    <a href="../brain-training-tips.html" class="hover:text-gold transition-colors py-1 block">◈ Brain Training Optimization</a>
                </div>
            </div>

            <div>
                <h4 class="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-4 font-['Orbitron'] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> Active Theaters</h4>
                <div class="flex flex-col space-y-3 mt-2">
                    <a href="https://play.google.com/store/apps/details?id=com.ittybittybites.the2secondwitness" target="_blank" rel="noopener" class="px-5 py-3.5 bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-cyan-400/30 rounded-xl font-bold transition-all flex items-center justify-between text-xs shadow-lg tracking-wider">
                        <span>🚀 ANDROID APP</span> <span>&rarr;</span>
                    </a>
                    <a href="https://ittybittybites.itch.io/2-second-witness" target="_blank" rel="noopener" class="px-5 py-3.5 bg-gold/10 hover:bg-gold hover:text-slate-950 text-gold border border-gold/30 rounded-xl font-bold transition-all flex items-center justify-between text-xs shadow-lg tracking-wider">
                        <span>⚡ WEB SIMULATION</span> <span>&rarr;</span>
                    </a>
                    <p class="text-[11px] text-slate-500 leading-relaxed pt-3">
                        All interactive sandbox execution mechanics across our portal operate entirely locally within your secure client sandbox. Zero background telemetry or path tracking data is collected.
                    </p>
                </div>
            </div>
        </div>

        <div class="max-w-[1400px] mx-auto text-center text-xs text-slate-500 tracking-widest uppercase flex flex-col sm:flex-row items-center justify-between gap-6 font-mono font-bold">
            <div class="text-slate-400">© 2026 ITTY BITTY BITES // CLASSIFIED COGNITIVE TRAINING DIVISION</div>
            <div class="flex flex-wrap justify-center gap-6 text-slate-400">
                <a href="../privacy_policy.html" class="hover:text-cyan-400 transition-colors">Privacy Policy</a>
                <a href="../terms_of_service.html" class="hover:text-cyan-400 transition-colors">Terms of Service</a>
                <a href="../sitemap.xml" class="hover:text-cyan-400 transition-colors">Sitemap XML</a>
                <a href="../feed.html" class="hover:text-cyan-400 transition-colors">RSS Database</a>
            </div>
        </div>
    </footer>
</body>
</html>`;
}

// ─── Step 7: Generate Intel Hub ───────────────────────────────────────────────

function generateIntelHub(topics, personas, intelPages) {
  console.log('\n📊 Generating intel hub index...');

  const topicCards = topics.map(topic => {
    const pagesForTopic = intelPages.filter(p => p.topic === topic.slug);
    const pageLinks = pagesForTopic.map(p => {
      const persona = personas.find(per => per.slug === p.persona);
      return `<a href="${p.slug}.html" class="block text-slate-400 text-xs hover:text-cyan-400 transition-colors py-1">→ ${persona?.name || p.persona}</a>`;
    }).join('');
    return `
    <div class="bg-slate-900/60 border border-slate-800 rounded-lg p-5 hover:border-cyan-400/50 transition-all">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-lg">${topic.icon || '◉'}</span>
        <h3 class="font-display text-sm text-slate-50">${topic.title}</h3>
      </div>
      <p class="text-slate-500 text-xs mb-3">${topic.focus || ''}</p>
      <div class="space-y-0">${pageLinks}</div>
    </div>`;
  }).join('');

  const hubHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-6P6NPFW4FZ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-6P6NPFW4FZ');
</script>
<!-- Google AdSense Universal Publisher Tag -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1566091161594729" crossorigin="anonymous"></script>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Intel Matrix | The 2-Second Witness</title>
<meta name="description" content="Programmatic cognitive training protocol matrix — ${intelPages.length} pages across ${topics.length} topics and ${personas.length} personas. Auto-generated ${CONFIG.buildTimestamp}.">
<link rel="canonical" href="${BASE_URL}/intel/">
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Orbitron:wght@700;900&display=swap" rel="stylesheet">
<style>
:root { --bg: #020617; --cyan: #22d3ee; --emerald: #34d399; --gold: #facc15; --border: rgba(34,211,238,0.15); }
body::before { content: ''; position: fixed; inset: 0; background: linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px); background-size: 60px 60px; pointer-events: none; z-index: -1; }
.nav-node { font-size: 13px; font-family: 'Orbitron', sans-serif; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; padding: 8px 18px; border: 1px solid #1e293b; border-radius: 8px; color: #94a3b8; transition: all 0.2s ease; text-decoration: none; display: inline-block; background: #0b0f19; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
.nav-node:hover { color: #22d3ee; border-color: #22d3ee; background: rgba(34,211,238,0.1); transform: translateY(-1px); }
.nav-node.active { color: #22d3ee; border-color: #22d3ee; font-weight: 900; background: rgba(34,211,238,0.15); box-shadow: 0 0 20px rgba(34,211,238,0.4); }
</style>
</head>
<body class="bg-slate-950 text-slate-50 font-mono antialiased">
<nav class="bg-slate-950 border-b border-cyan-400/20 py-3 sticky top-0 z-50 backdrop-blur-md shadow-2xl select-none font-mono">
  <div class="max-w-[1200px] mx-auto px-4 flex justify-center gap-2 sm:gap-4 flex-wrap items-center font-bold">
    <a href="../index.html" class="nav-node">HQ</a>
    <a href="../arcade.html" class="nav-node">TACTICAL ARCADE</a>
    <a href="./" class="nav-node active" style="color:var(--cyan);border-color:var(--cyan)">INTEL MATRIX</a>
    <a href="../feed.html" class="nav-node">INTEL FEED</a>
    <a href="../library.html" class="nav-node">GEAR LOCKER</a>
  </div>
</nav>
<section class="py-16 text-center bg-zinc-950">
  <div class="max-w-[1100px] mx-auto px-5 font-mono">
    <span class="text-[10px] tracking-widest text-emerald-400 uppercase font-bold mb-4 block">◈ ELITE COGNITIVE PROTOCOL THEATER ◈</span>
    <h1 class="font-display text-3xl md:text-5xl text-cyan-400 tracking-wider font-black uppercase mb-4 font-['Orbitron']">OPERATIONAL BRIEFINGS</h1>
    <p class="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-mono">
        A systematic, highly structured database of tactical cognitive override protocols vetted for real-world high-pressure environments. Select your designated operational sector below to access specific neural defenses.
    </p>
  </div>
</section>
<section class="py-12 max-w-[1200px] mx-auto px-5">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
${topicCards}
  </div>
</section>
    <!-- UNIFIED LEGAL & MISSION FOOTER -->
    <footer class="border-t border-slate-900 bg-slate-950 py-16 px-6 mt-auto text-slate-500 font-mono text-xs leading-relaxed select-none">
        <div class="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-16 border-b border-slate-900 pb-16">
            <div>
                <h4 class="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-4 font-['Orbitron'] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> Tactical Briefings</h4>
                <div class="space-y-2.5 flex flex-col text-xs font-mono font-medium text-slate-300">
                    <a href="../stroop-effect.html" class="hover:text-gold transition-colors py-1 block">◈ The Stroop Effect</a>
                    <a href="../cognitive-biases.html" class="hover:text-gold transition-colors py-1 block">◈ 25 Cognitive Biases</a>
                    <a href="../decision-making.html" class="hover:text-gold transition-colors py-1 block">◈ System 1 vs System 2</a>
                    <a href="../rapid-thinking.html" class="hover:text-gold transition-colors py-1 block">◈ Rapid Thinking Protocols</a>
                    <a href="../dunning-kruger.html" class="hover:text-gold transition-colors py-1 block">◈ Dunning-Kruger Analysis</a>
                    <a href="../flow-state.html" class="hover:text-gold transition-colors py-1 block">◈ Flow State Triggers</a>
                </div>
            </div>

            <div>
                <h4 class="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-4 font-['Orbitron'] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Research Hub</h4>
                <div class="space-y-2.5 flex flex-col text-xs font-mono font-medium text-slate-300">
                    <a href="../social-engineering.html" class="hover:text-gold transition-colors py-1 block">◈ 10 Social Engineering Defenses</a>
                    <a href="../how-doctors-think.html" class="hover:text-gold transition-colors py-1 block">◈ How Doctors Think (Pattern Rec)</a>
                    <a href="../logical-fallacies.html" class="hover:text-gold transition-colors py-1 block">◈ 15 Logical Fallacies</a>
                    <a href="../pattern-recognition.html" class="hover:text-gold transition-colors py-1 block">◈ Pattern Recognition in Ops</a>
                    <a href="../priming-effect.html" class="hover:text-gold transition-colors py-1 block">◈ Cognitive Priming Override</a>
                    <a href="../false-memory.html" class="hover:text-gold transition-colors py-1 block">◈ The False Memory Problem</a>
                </div>
            </div>

            <div>
                <h4 class="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-4 font-['Orbitron'] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-gold"></span> Field Manuals</h4>
                <div class="space-y-2.5 flex flex-col text-xs font-mono font-medium text-slate-300">
                    <a href="../survival-skills.html" class="hover:text-gold transition-colors py-1 block">◈ 10 Wilderness Survival Skills</a>
                    <a href="../first-aid-basics.html" class="hover:text-gold transition-colors py-1 block">◈ First Aid Operational Basics</a>
                    <a href="../food-safety.html" class="hover:text-gold transition-colors py-1 block">◈ Food Safety Defenses</a>
                    <a href="../cybersecurity-beginners.html" class="hover:text-gold transition-colors py-1 block">◈ Cybersecurity for Beginners</a>
                    <a href="../best-brain-games.html" class="hover:text-gold transition-colors py-1 block">◈ Best Diagnostic Brain Games</a>
                    <a href="../brain-training-tips.html" class="hover:text-gold transition-colors py-1 block">◈ Brain Training Optimization</a>
                </div>
            </div>

            <div>
                <h4 class="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-4 font-['Orbitron'] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> Active Theaters</h4>
                <div class="flex flex-col space-y-3 mt-2">
                    <a href="https://play.google.com/store/apps/details?id=com.ittybittybites.the2secondwitness" target="_blank" rel="noopener" class="px-5 py-3.5 bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-cyan-400/30 rounded-xl font-bold transition-all flex items-center justify-between text-xs shadow-lg tracking-wider">
                        <span>🚀 ANDROID APP</span> <span>&rarr;</span>
                    </a>
                    <a href="https://ittybittybites.itch.io/2-second-witness" target="_blank" rel="noopener" class="px-5 py-3.5 bg-gold/10 hover:bg-gold hover:text-slate-950 text-gold border border-gold/30 rounded-xl font-bold transition-all flex items-center justify-between text-xs shadow-lg tracking-wider">
                        <span>⚡ WEB SIMULATION</span> <span>&rarr;</span>
                    </a>
                    <p class="text-[11px] text-slate-500 leading-relaxed pt-3">
                        All interactive sandbox execution mechanics across our portal operate entirely locally within your secure client sandbox. Zero background telemetry or path tracking data is collected.
                    </p>
                </div>
            </div>
        </div>

        <div class="max-w-[1400px] mx-auto text-center text-xs text-slate-500 tracking-widest uppercase flex flex-col sm:flex-row items-center justify-between gap-6 font-mono font-bold">
            <div class="text-slate-400">© 2026 ITTY BITTY BITES // CLASSIFIED COGNITIVE TRAINING DIVISION</div>
            <div class="flex flex-wrap justify-center gap-6 text-slate-400">
                <a href="../privacy_policy.html" class="hover:text-cyan-400 transition-colors">Privacy Policy</a>
                <a href="../terms_of_service.html" class="hover:text-cyan-400 transition-colors">Terms of Service</a>
                <a href="../sitemap.xml" class="hover:text-cyan-400 transition-colors">Sitemap XML</a>
                <a href="../feed.html" class="hover:text-cyan-400 transition-colors">RSS Database</a>
            </div>
        </div>
    </footer>
</body>
</html>`;

  fs.writeFileSync(path.join(INTEL_DIR, 'index.html'), hubHtml, 'utf-8');
  console.log(`✓ Intel hub index written`);
}

// ─── Step 8: Update library.html ──────────────────────────────────────────────

function updateLibraryHub(generated) {
  console.log('\n📝 Updating library.html...');
  let html = fs.readFileSync(LIBRARY_PATH, 'utf-8');

  const cards = generated.map(item => `
    <a href="library/${item.slug}.html" class="block bg-slate-900/50 border border-slate-800 rounded-lg p-5 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all">
      <span class="text-[9px] tracking-[2px] text-cyan-400 uppercase border border-cyan-400/30 px-2 py-0.5 inline-block mb-2">${item.category || 'General'}</span>
      <h3 class="font-display text-sm text-slate-50 mb-1 leading-snug">${item.title}</h3>
      <p class="text-slate-500 text-xs mb-3">${item.author || 'Unknown'}</p>
      <p class="text-slate-400 text-xs leading-relaxed line-clamp-3">${item.summary || ''}</p>
    </a>`).join('\n');

  const gridContent = `
<section class="py-16 md:py-24 relative bg-zinc-950">
  <div class="max-w-[1200px] mx-auto px-5 relative z-10">
    <div class="flex items-center gap-3 mb-10">
      <span class="text-[10px] tracking-[2px] text-slate-950 bg-emerald-400 px-3 py-1 uppercase font-bold">EXPANDED CATALOG</span>
      <h2 class="font-display text-lg md:text-xl text-cyan-400 tracking-[2px]">PROGRAMMATIC FIELD RESOURCES</h2>
      <span class="flex-1 h-px bg-gradient-to-r from-cyan-400/20 to-transparent"></span>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
${cards}
    </div>
  </div>
</section>`;

  const startMarker = '<!-- PROGRAMMATIC_CATALOG_START -->';
  const endMarker = '<!-- PROGRAMMATIC_CATALOG_END -->';
  const startIdx = html.indexOf(startMarker);
  const endIdx = html.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    html = html.replace('</body>', gridContent + '\n</body>');
  } else {
    html = html.slice(0, startIdx) + startMarker + '\n' + gridContent + '\n' + endMarker + html.slice(endIdx + endMarker.length);
  }

  fs.writeFileSync(LIBRARY_PATH, html, 'utf-8');
  console.log(`✓ library.html updated with ${generated.length} links`);
}

// ─── Step 8b: Update Automated Dynamic Showcases on HQ and Feeds ─────────────────

function updateDynamicShowcases(intelPages) {
  console.log('\n⚡ Integrating newest dynamic protocol pages into HQ and Feeds showcases...');
  
  const freshest = intelPages.slice(0, 12);
  
  const showcaseCards = freshest.map(p => `
      <a href="intel/${p.slug}.html" class="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-cyan-400 hover:bg-slate-900/90 transition-all flex flex-col justify-between group shadow-xl hover:shadow-cyan-400/5 font-mono select-none">
        <div>
          <div class="flex items-center justify-between mb-3 font-mono">
            <span class="text-[10px] tracking-widest px-2.5 py-1 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 font-bold uppercase truncate max-w-[180px]">◈ ${p.topic}</span>
            <span class="text-xs text-slate-500 font-mono font-bold">2-SEC</span>
          </div>
          <h3 class="font-display font-bold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors leading-relaxed mt-2">${p.title}</h3>
          <p class="text-slate-400 text-xs mt-2.5 line-clamp-2 leading-relaxed">Neural override training and decision interference deflection operational protocol.</p>
        </div>
        <div class="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <span class="text-slate-500 group-hover:text-gold transition-colors font-bold tracking-wider">CLASSIFIED</span>
          <span class="text-cyan-400 font-bold tracking-widest group-hover:translate-x-1 transition-transform">ACCESS &rarr;</span>
        </div>
      </a>`).join('\n');

  const showcaseHtml = `<!-- AUTONOMOUS PROTOCOL SHOWCASE BLOCK -->
<section id="autonomous-protocol-showcase" class="py-24 md:py-32 relative bg-slate-950 section-pattern-grid font-mono select-none border-t border-slate-900">
  <div class="max-w-[1400px] mx-auto px-5 relative z-10">
    <div class="flex items-center gap-3 mb-12">
      <span class="text-[10px] tracking-widest text-slate-950 bg-cyan-400 px-3 py-1 uppercase font-bold">OPERATIONAL PROTOCOLS</span>
      <h2 class="font-display text-xl sm:text-2xl text-cyan-400 tracking-wider font-black uppercase font-['Orbitron']">RECENT TACTICAL RELEASES</h2>
      <span class="flex-1 h-px bg-gradient-to-r from-cyan-400/20 to-transparent"></span>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      ${showcaseCards}
    </div>
    <div class="mt-12 text-center font-mono">
      <a href="intel/index.html" class="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black tracking-widest text-xs uppercase rounded-xl transition-all shadow-xl active:scale-95 inline-block">Explore Entire Intelligence Briefing Database &rarr;</a>
    </div>
  </div>
</section>`;

  // Update index.html
  const indexPath = path.join(ROOT, 'index.html');
  if (fs.existsSync(indexPath)) {
    let indexHtml = fs.readFileSync(indexPath, 'utf-8');
    if (indexHtml.includes('id="autonomous-protocol-showcase"')) {
      indexHtml = indexHtml.replace(/<!-- AUTONOMOUS PROTOCOL SHOWCASE BLOCK -->[\s\S]*?<\/section>/i, showcaseHtml);
    } else {
      indexHtml = indexHtml.replace(/<!-- UNIFIED LEGAL & MISSION FOOTER -->/i, `${showcaseHtml}\n\n<!-- UNIFIED LEGAL & MISSION FOOTER -->`);
    }
    fs.writeFileSync(indexPath, indexHtml, 'utf-8');
    console.log('✓ index.html updated with dynamic automated protocol showcase');
  }

  // Update feed.html
  const feedPath = path.join(ROOT, 'feed.html');
  if (fs.existsSync(feedPath)) {
    let feedHtml = fs.readFileSync(feedPath, 'utf-8');
    if (feedHtml.includes('id="autonomous-protocol-showcase"')) {
      feedHtml = feedHtml.replace(/<!-- AUTONOMOUS PROTOCOL SHOWCASE BLOCK -->[\s\S]*?<\/section>/i, showcaseHtml);
    } else {
      feedHtml = feedHtml.replace(/<!-- UNIFIED LEGAL & MISSION FOOTER -->/i, `${showcaseHtml}\n\n<!-- UNIFIED LEGAL & MISSION FOOTER -->`);
    }
    fs.writeFileSync(feedPath, feedHtml, 'utf-8');
    console.log('✓ feed.html updated with dynamic automated protocol showcase');
  }
}

// ─── Step 9: Build Dynamic sitemap.xml ────────────────────────────────────────

function updateSitemap(libraryPages, intelPages) {
  console.log('\n🗺️ Building dynamic sitemap.xml...');

  const staticUrls = [
    { loc: '/', changefreq: 'weekly', priority: 1.0 },
    { loc: '/library.html', changefreq: 'weekly', priority: 0.8 },
    { loc: '/intel/index.html', changefreq: 'daily', priority: 0.9 },
    { loc: '/feed.html', changefreq: 'weekly', priority: 0.7 },
    { loc: '/stroop-effect.html', changefreq: 'monthly', priority: 0.9 },
    { loc: '/cognitive-biases.html', changefreq: 'monthly', priority: 0.9 },
    { loc: '/decision-making.html', changefreq: 'monthly', priority: 0.9 },
    { loc: '/social-engineering.html', changefreq: 'monthly', priority: 0.8 },
    { loc: '/flow-state.html', changefreq: 'monthly', priority: 0.7 },
    { loc: '/behavioral-economics.html', changefreq: 'monthly', priority: 0.8 },
    { loc: '/rapid-thinking.html', changefreq: 'monthly', priority: 0.8 },
    { loc: '/dunning-kruger.html', changefreq: 'monthly', priority: 0.8 },
  ];

  const libraryUrls = libraryPages.map(item => ({ loc: `/library/${item.slug}.html`, changefreq: 'monthly', priority: 0.6 }));
  const intelUrls = intelPages.map(item => ({ loc: `/intel/${item.slug}.html`, changefreq: 'weekly', priority: 0.7 }));
  const allUrls = [...staticUrls, ...libraryUrls, ...intelUrls];
  const lastmod = new Date().toISOString().split('T')[0];

  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const url of allUrls) {
    xmlLines.push('  <url>');
    xmlLines.push(`    <loc>${BASE_URL}${url.loc}</loc>`);
    xmlLines.push(`    <lastmod>${lastmod}</lastmod>`);
    xmlLines.push(`    <changefreq>${url.changefreq}</changefreq>`);
    xmlLines.push(`    <priority>${url.priority}</priority>`);
    xmlLines.push('  </url>');
  }
  xmlLines.push('</urlset>');

  fs.writeFileSync(SITEMAP_PATH, xmlLines.join('\n'), 'utf-8');
  console.log(`✓ sitemap.xml built with ${allUrls.length} URLs (${staticUrls.length} static + ${libraryUrls.length} library + ${intelUrls.length} intel)`);
}

// ─── Main Execution ─────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const section = args.find(a => a.startsWith('--section='))?.split('=')[1] || 'all';

  console.log('\n' + '═'.repeat(60));
  console.log('  AUTONOMOUS SSG ENGINE — BUILD START');
  console.log('═'.repeat(60));
  console.log(`  Mode:    ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`  Section: ${section}`);
  console.log(`  Time:    ${CONFIG.buildTimestamp}`);
  console.log('═'.repeat(60));

  const startTime = Date.now();

  try {
    extractAffiliateTag();

    // Load current data matrices
    let topicsData   = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
    let personasData = JSON.parse(fs.readFileSync(PERSONAS_PATH, 'utf-8'));
    let manifest     = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    const template   = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

    console.log(`\n  Loaded: ${topicsData.topics.length} topics, ${personasData.personas.length} personas, ${manifest.catalog?.length || 0} catalog entries`);

    // ── ENGINE 1: Semantic Expansion (discover new topics) ──
    if (section === 'all' || section === 'expand') {
      topicsData.topics = await semanticExpansionEngine(topicsData.topics);
    }

    // ── ENGINE 2: Persona Mining (discover new personas) ──
    if (section === 'all' || section === 'expand') {
      personasData.personas = personaMiningEngine(personasData.personas);
    }

    // ── ENGINE 3: Affiliate Curation (validate ASINs, auto-replace dead links) ──
    if (section === 'all' || section === 'curate') {
      manifest = await affiliateCurationEngine(manifest);
    }

    if (dryRun) {
      console.log(`\n🧪 DRY RUN — would generate: ${topicsData.topics.length * personasData.personas.length} intel pages + ${manifest.catalog?.length || 0} library pages`);
      return;
    }

    // ── Fetch live feeds ──
    const liveData = await fetchLiveFeedData();

    // ── Generate pages ──
    const libraryPages = generateLibraryPages(manifest, template, liveData);
    const intelPages   = generateIntelPages(topicsData.topics, personasData.personas, liveData);

    // ── Generate hub ──
    generateIntelHub(topicsData.topics, personasData.personas, intelPages);

    // ── Update catalog + sitemap ──
    updateLibraryHub(libraryPages);
    updateDynamicShowcases(intelPages);
    updateSitemap(libraryPages, intelPages);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n' + '═'.repeat(60));
    console.log('  ✅ AUTONOMOUS BUILD COMPLETE');
    console.log('═'.repeat(60));
    console.log(`  Library pages:  ${libraryPages.length}`);
    console.log(`  Intel pages:    ${intelPages.length}`);
    console.log(`  Topics in matrix:  ${topicsData.topics.length}`);
    console.log(`  Personas in matrix: ${personasData.personas.length}`);
    console.log(`  Sitemap URLs:   ${libraryPages.length + intelPages.length + 12}`);
    console.log(`  Elapsed:        ${elapsed}s`);
    console.log(`  Affiliate tag:  ${CONFIG.affiliateTag}`);
    console.log('═'.repeat(60));

  } catch (err) {
    console.error('\n❌ BUILD FAILED:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();