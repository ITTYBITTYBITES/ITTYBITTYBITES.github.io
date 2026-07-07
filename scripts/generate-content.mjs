import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src/content');
const GEN_DIR = path.join(ROOT, 'src/generated');

function ensure(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

function loadDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')));
}

function main() {
  console.log('🛠️  Generating content...');
  ensure(GEN_DIR);

  const experiences = loadDir(path.join(CONTENT_DIR, 'experiences'));
  const collections = loadDir(path.join(CONTENT_DIR, 'collections'));
  const stories = loadDir(path.join(CONTENT_DIR, 'stories'));

  // Basic validation
  const expIds = new Set(experiences.map(e => e.id));
  const colIds = new Set(collections.map(c => c.id));

  collections.forEach(c => {
    (c.experiences || []).forEach(eid => {
      if (!expIds.has(eid)) throw new Error(`Broken ref in collection ${c.id}: ${eid}`);
    });
  });

  experiences.forEach(e => {
    if (e.collection && !colIds.has(e.collection)) {
      throw new Error(`Broken collection ref in ${e.id}: ${e.collection}`);
    }
  });

  const registry = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    experiences,
    collections,
    stories
  };

  fs.writeFileSync(path.join(GEN_DIR, 'registry.json'), JSON.stringify(registry, null, 2));

  // Search index
  const search = [
    ...experiences.map(e => ({ id: e.id, type: 'experience', title: e.title, description: e.description, tags: e.tags || [], collection: e.collection })),
    ...collections.map(c => ({ id: c.id, type: 'collection', title: c.title, description: c.description, tags: c.tags || [] })),
    ...stories.map(s => ({ id: s.id, type: 'story', title: s.title, description: s.description }))
  ];
  fs.writeFileSync(path.join(GEN_DIR, 'search-index.json'), JSON.stringify(search, null, 2));

  // Collection summaries
  const summaries = collections.map(c => ({
    id: c.id,
    title: c.title,
    count: (c.experiences || []).length,
    experiences: (c.experiences || []).map(eid => {
      const ex = experiences.find(e => e.id === eid);
      return ex ? { id: ex.id, title: ex.title } : null;
    }).filter(Boolean)
  }));
  fs.writeFileSync(path.join(GEN_DIR, 'collection-summaries.json'), JSON.stringify(summaries, null, 2));

  // Relationships
  const relationships = {
    collectionsToExperiences: {},
    experiencesToCollections: {}
  };
  collections.forEach(c => {
    relationships.collectionsToExperiences[c.id] = c.experiences || [];
    (c.experiences || []).forEach(eid => {
      if (!relationships.experiencesToCollections[eid]) relationships.experiencesToCollections[eid] = [];
      relationships.experiencesToCollections[eid].push(c.id);
    });
  });
  fs.writeFileSync(path.join(GEN_DIR, 'relationships.json'), JSON.stringify(relationships, null, 2));

  console.log(`✅ Generated successfully`);
  console.log(`   ${experiences.length} experiences`);
  console.log(`   ${collections.length} collections`);
  console.log(`   ${stories.length} stories`);
}

main();
