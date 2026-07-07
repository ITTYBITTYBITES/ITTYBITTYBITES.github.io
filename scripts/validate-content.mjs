import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src/content');

const errors = [];

function loadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) {
    errors.push({ file, message: `Failed to parse: ${e.message}` });
    return null;
  }
}

function validateExperience(item, filename) {
  const req = ['id', 'title', 'description', 'category', 'module'];
  for (const f of req) {
    if (!item[f]) errors.push({ file: filename, message: `Missing ${f}` });
  }
  if (item.id && !/^[a-z0-9-]{3,32}$/.test(item.id)) {
    errors.push({ file: filename, message: `Bad id format: ${item.id}` });
  }
}

function validateCollection(item, filename) {
  const req = ['id', 'title', 'description', 'experiences'];
  for (const f of req) if (!item[f]) errors.push({ file: filename, message: `Missing ${f}` });
  if (!Array.isArray(item.experiences) || item.experiences.length === 0) {
    errors.push({ file: filename, message: 'experiences must be non-empty array' });
  }
}

function validateStory(item, filename) {
  const req = ['id', 'title', 'description'];
  for (const f of req) if (!item[f]) errors.push({ file: filename, message: `Missing ${f}` });
}

console.log('🔍 Validating content...');

const expDir = path.join(CONTENT_DIR, 'experiences');
const colDir = path.join(CONTENT_DIR, 'collections');
const storyDir = path.join(CONTENT_DIR, 'stories');

const experiences = [];
const collections = [];
const stories = [];

if (fs.existsSync(expDir)) {
  fs.readdirSync(expDir).filter(f => f.endsWith('.json')).forEach(f => {
    const item = loadJson(path.join(expDir, f));
    if (item) { validateExperience(item, f); experiences.push(item); }
  });
}

if (fs.existsSync(colDir)) {
  fs.readdirSync(colDir).filter(f => f.endsWith('.json')).forEach(f => {
    const item = loadJson(path.join(colDir, f));
    if (item) { validateCollection(item, f); collections.push(item); }
  });
}

if (fs.existsSync(storyDir)) {
  fs.readdirSync(storyDir).filter(f => f.endsWith('.json')).forEach(f => {
    const item = loadJson(path.join(storyDir, f));
    if (item) { validateStory(item, f); stories.push(item); }
  });
}

// Relationship checks
const expIds = new Set(experiences.map(e => e.id));
const colIds = new Set(collections.map(c => c.id));
const storyIds = new Set(stories.map(s => s.id));

// Duplicates
const expSeen = new Set();
experiences.forEach(e => {
  if (expSeen.has(e.id)) errors.push({ file: 'experiences', message: `Duplicate id: ${e.id}` });
  expSeen.add(e.id);
});

collections.forEach(c => {
  (c.experiences || []).forEach(eid => {
    if (!expIds.has(eid)) errors.push({ file: `${c.id}.json`, message: `Broken experience ref: ${eid}` });
  });
});

experiences.forEach(e => {
  if (e.collection && !colIds.has(e.collection)) {
    errors.push({ file: `${e.id}.json`, message: `Broken collection: ${e.collection}` });
  }
  if (e.story && !storyIds.has(e.story)) {
    errors.push({ file: `${e.id}.json`, message: `Broken story: ${e.story}` });
  }
});

if (errors.length > 0) {
  console.error('\n❌ Validation failed:');
  errors.forEach(e => console.error(`  • ${e.file}: ${e.message}`));
  process.exit(1);
}

console.log(`✅ Validation passed (${experiences.length} experiences, ${collections.length} collections, ${stories.length} stories)`);
