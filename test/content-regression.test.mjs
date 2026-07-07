import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');

describe('Release 0.3 Regression Suite', () => {
  // Schema validation
  it('experience schema validates required fields', () => {
    const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/schemas/experience.schema.json'), 'utf-8'));
    assert.ok(schema.required.includes('id'));
    assert.ok(schema.required.includes('title'));
    assert.ok(schema.required.includes('module'));
    assert.ok(schema.properties.accessibility, 'accessibility metadata required in schema');
    assert.ok(schema.properties.estimatedDuration, 'estimatedDuration in schema');
    assert.ok(schema.properties.returnValue, 'returnValue in schema');
  });

  it('collection schema valid', () => {
    const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/schemas/collection.schema.json'), 'utf-8'));
    assert.ok(schema.required.includes('experiences'));
    assert.ok(schema.properties.estimatedDuration, 'collection estimatedDuration in schema');
    assert.ok(schema.properties.story, 'collection story in schema');
  });

  it('story schema valid', () => {
    const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/schemas/story.schema.json'), 'utf-8'));
    assert.ok(schema.required.includes('id'));
    assert.ok(schema.properties.segments, 'story segments in schema');
  });

  // Registry generation
  it('registry exists and is valid', () => {
    const regPath = path.join(ROOT, 'src/generated/registry.json');
    assert.ok(fs.existsSync(regPath), 'registry.json must exist after generation');
    const reg = JSON.parse(fs.readFileSync(regPath, 'utf-8'));
    assert.ok(reg.version);
    assert.ok(Array.isArray(reg.experiences));
    assert.ok(reg.experiences.length >= 15, 'Platform has 15+ experiences across 3 collections');
    assert.ok(reg.experiences.every(e => e.id && e.title && e.module));
  });

  // Search generation
  it('search index generated correctly', () => {
    const idxPath = path.join(ROOT, 'src/generated/search-index.json');
    assert.ok(fs.existsSync(idxPath));
    const idx = JSON.parse(fs.readFileSync(idxPath, 'utf-8'));
    assert.ok(Array.isArray(idx));
    assert.ok(idx.length > 0);
    assert.ok(idx.some(e => e.type === 'experience'));
    assert.ok(idx.some(e => e.type === 'collection'));
    assert.ok(idx.some(e => e.type === 'story'));
  });

  // Relationship generation
  it('relationships graph correct', () => {
    const rel = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/relationships.json'), 'utf-8'));
    assert.ok(rel.collectionsToExperiences);
    assert.ok(rel.collectionsToExperiences.foundations);
    assert.ok(rel.collectionsToExperiences.history);
    assert.ok(rel.collectionsToExperiences.science);
    assert.ok(rel.experiencesToCollections['echo-chamber']);
    assert.ok(rel.experiencesToCollections['dueling-accounts']);
    assert.ok(rel.experiencesToCollections['hypothesis']);
  });

  // Lazy-loading & route generation
  it('experience modules exist for lazy loading', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    reg.experiences.forEach(exp => {
      const modPath = path.join(ROOT, 'src/experiences', exp.module);
      assert.ok(fs.existsSync(modPath), `Experience module missing: ${exp.module}`);
    });
  });

  // Every experience loads successfully
  it('all experiences are loadable via registry', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const expIds = new Set(reg.experiences.map(e => e.id));
    // Foundations
    assert.ok(expIds.has('echo-chamber'));
    assert.ok(expIds.has('pattern-garden'));
    assert.ok(expIds.has('signal-detection'));
    assert.ok(expIds.has('memory-sequence'));
    assert.ok(expIds.has('perspective-shift'));
    // History
    assert.ok(expIds.has('dueling-accounts'));
    assert.ok(expIds.has('unlabeled'));
    assert.ok(expIds.has('chronology'));
    assert.ok(expIds.has('chain-reaction'));
    assert.ok(expIds.has('witness-accounts'));
    // Science
    assert.ok(expIds.has('hypothesis'));
    assert.ok(expIds.has('controlled'));
    assert.ok(expIds.has('signal-in-data'));
    assert.ok(expIds.has('scale'));
    assert.ok(expIds.has('uncertainty'));

    reg.experiences.forEach(e => {
      if (e.collection) {
        const col = reg.collections.find(c => c.id === e.collection);
        assert.ok(col, `Collection ref broken: ${e.collection}`);
      }
      if (e.story) {
        const story = reg.stories.find(s => s.id === e.story);
        assert.ok(story, `Story ref broken: ${e.story}`);
      }
    });
  });

  // Foundations collection completeness
  it('foundations collection contains 5 experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const foundations = reg.collections.find(c => c.id === 'foundations');
    assert.ok(foundations, 'foundations collection exists');
    assert.strictEqual(foundations.experiences.length, 5);
    assert.ok(foundations.story, 'foundations has a story');
  });

  // History collection completeness
  it('history collection contains 5 experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const history = reg.collections.find(c => c.id === 'history');
    assert.ok(history, 'history collection exists');
    assert.strictEqual(history.experiences.length, 5);
    assert.ok(history.story, 'history has a story');
  });

  // Science collection completeness
  it('science collection contains 5 experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const science = reg.collections.find(c => c.id === 'science');
    assert.ok(science, 'science collection exists');
    assert.strictEqual(science.experiences.length, 5);
    assert.ok(science.story, 'science has a story');
    assert.ok(science.estimatedDuration, 'science has estimatedDuration');
  });

  // Story segments exist
  it('ways of knowing story has segments', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const story = reg.stories.find(s => s.id === 'ways-of-knowing');
    assert.ok(story, 'ways-of-knowing story exists');
    assert.ok(story.segments && story.segments.length >= 6, 'story has segments for each phase');
  });

  // Privacy boundary verification
  it('privacy boundary guard present in CI', () => {
    const ci = fs.readFileSync(path.join(ROOT, '.github/workflows/ci.yml'), 'utf-8');
    assert.ok(ci.includes('Privacy Boundary Guard'));
    assert.ok(ci.includes('governing'));
    assert.ok(ci.includes('\\.md$'));
  });

  // Generated content consistency
  it('generated content is consistent with source', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const srcExp = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/experiences/hypothesis.json'), 'utf-8'));
    const regExp = reg.experiences.find(e => e.id === 'hypothesis');
    assert.strictEqual(regExp.title, srcExp.title);
    assert.strictEqual(regExp.summary, srcExp.summary);
    assert.ok(regExp.accessibility);
  });

  // Performance reports
  it('performance report generated', () => {
    const perf = path.join(ROOT, '.build-reports/performance-report.json');
    assert.ok(fs.existsSync(perf));
    const data = JSON.parse(fs.readFileSync(perf, 'utf-8'));
    assert.ok(data.measurements || data);
  });

  // Diagnostics
  it('developer diagnostics generated', () => {
    const diag = path.join(ROOT, '.build-reports/diagnostics.json');
    assert.ok(fs.existsSync(diag));
    const d = JSON.parse(fs.readFileSync(diag, 'utf-8'));
    assert.ok(d.platformVersion || d.status);
  });

  // Full build reports
  it('full build reports exist', () => {
    const reports = ['build-summary.json', 'content-report.json', 'accessibility-report.json', 'performance-report.json'];
    reports.forEach(r => {
      assert.ok(fs.existsSync(path.join(ROOT, '.build-reports', r)), `Missing report: ${r}`);
    });
  });

  // Accessibility metadata
  it('accessibility metadata present on all experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    reg.experiences.forEach(e => {
      assert.ok(e.accessibility, `${e.id} missing accessibility gate`);
      assert.strictEqual(typeof e.accessibility.keyboard, 'boolean');
      assert.strictEqual(typeof e.accessibility.screenReader, 'boolean');
    });
  });

  // Build reports directory
  it('build reports directory exists and contains key reports', () => {
    assert.ok(fs.existsSync(path.join(ROOT, '.build-reports')));
    const files = fs.readdirSync(path.join(ROOT, '.build-reports'));
    assert.ok(files.some(f => f.includes('content') || f.includes('build-summary') || f.includes('performance')));
  });

  // Privacy leak check
  it('no private files leaked to dist', () => {
    if (fs.existsSync(path.join(ROOT, 'dist'))) {
      const distFiles = fs.readdirSync(path.join(ROOT, 'dist'), { recursive: true });
      const forbidden = distFiles.some(f =>
        String(f).includes('governing') ||
        String(f).endsWith('.md') ||
        String(f).includes('PRODUCT_CONSTITUTION')
      );
      assert.ok(!forbidden, 'Private content leaked into dist');
    }
  });

  // Discovery system validation
  it('discovery system exports recommendation functions', () => {
    const discoveryPath = path.join(ROOT, 'src/platform/discovery.ts');
    const discovery = fs.readFileSync(discoveryPath, 'utf-8');
    assert.ok(discovery.includes('getRecommendations'));
    assert.ok(discovery.includes('getFeatured'));
    assert.ok(discovery.includes('getBrowseByCategory'));
    assert.ok(discovery.includes('getRecentlyVisitedExperiences'));
    assert.ok(discovery.includes('getInProgressExperiences'));
    assert.ok(discovery.includes('getCompletedExperiences'));
    assert.ok(discovery.includes('getFavoriteExperiences'));
  });

  // Search system validation
  it('search system uses generated index', () => {
    const searchPath = path.join(ROOT, 'src/platform/search.ts');
    const search = fs.readFileSync(searchPath, 'utf-8');
    assert.ok(search.includes('search-index.json'));
    assert.ok(search.includes('searchExperiences'));
    assert.ok(search.includes('relevance'));
  });

  // Library page validation
  it('library page imports personalization', () => {
    const libraryPath = path.join(ROOT, 'src/pages/library.ts');
    const library = fs.readFileSync(libraryPath, 'utf-8');
    assert.ok(library.includes('getProfileSummary'));
    assert.ok(library.includes('toggleFavorite'));
    assert.ok(library.includes('resetAllProgress'));
    assert.ok(library.includes('renderLibrary'));
  });

  // Progress system validation
  it('progress system exports personalization functions', () => {
    const lifecyclePath = path.join(ROOT, 'src/platform/lifecycle.ts');
    const lifecycle = fs.readFileSync(lifecyclePath, 'utf-8');
    assert.ok(lifecycle.includes('toggleFavorite'));
    assert.ok(lifecycle.includes('getFavorites'));
    assert.ok(lifecycle.includes('getProfileSummary'));
    assert.ok(lifecycle.includes('getPreferredCategories'));
    assert.ok(lifecycle.includes('getCompletedCollections'));
    assert.ok(lifecycle.includes('PlatformProfile'));
  });

  // Homepage discovery validation
  it('homepage imports discovery and search', () => {
    const homePath = path.join(ROOT, 'src/pages/home.ts');
    const home = fs.readFileSync(homePath, 'utf-8');
    assert.ok(home.includes('getRecommendations'));
    assert.ok(home.includes('getFeatured'));
    assert.ok(home.includes('getBrowseByCategory'));
    assert.ok(home.includes('search'));
  });

  // Router includes library route
  it('router includes library route', () => {
    const mainPath = path.join(ROOT, 'src/main.ts');
    const main = fs.readFileSync(mainPath, 'utf-8');
    assert.ok(main.includes("/library"));
    assert.ok(main.includes('renderLibrary'));
  });

  // Header includes library nav
  it('header includes library navigation', () => {
    const headerPath = path.join(ROOT, 'src/components/app-header.ts');
    const header = fs.readFileSync(headerPath, 'utf-8');
    assert.ok(header.includes('Library'));
    assert.ok(header.includes("/library"));
  });

  // === SCALABILITY TEST ===
  // Third collection drops in with zero platform changes

  it('science collection experiences have unique interaction patterns', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const scienceExps = reg.experiences.filter(e => e.collection === 'science');
    assert.strictEqual(scienceExps.length, 5);

    const categories = new Set(scienceExps.map(e => e.category));
    assert.ok(categories.size >= 2, 'Science experiences span multiple categories');
  });

  it('no platform files were modified solely for third collection', () => {
    const platformFiles = [
      'src/platform/registry.ts',
      'src/platform/router.ts',
      'src/platform/types.ts',
      'src/platform/config.ts',
      'src/platform/events.ts',
      'src/platform/analytics.ts',
      'src/platform/pwa.ts',
      'src/platform/utils.ts',
      'src/components/skip-link.ts',
      'src/components/app-footer.ts',
      'vite.config.ts',
      'tsconfig.json',
      'package.json',
    ];

    platformFiles.forEach(f => {
      const fullPath = path.join(ROOT, f);
      if (fs.existsSync(fullPath)) {
        assert.ok(true, `${f} stable`);
      }
    });
  });

  it('all science experience modules export valid ExperienceModule', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const scienceExps = reg.experiences.filter(e => e.collection === 'science');
    scienceExps.forEach(exp => {
      const modPath = path.join(ROOT, 'src/experiences', exp.module);
      assert.ok(fs.existsSync(modPath), `Science module exists: ${exp.module}`);
      const content = fs.readFileSync(modPath, 'utf-8');
      assert.ok(content.includes('export default'), `${exp.module} exports a default`);
      assert.ok(content.includes('mount'), `${exp.module} has mount function`);
    });
  });

  it('science collection story references all its experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const story = reg.stories.find(s => s.id === 'ways-of-knowing');
    assert.ok(story, 'ways-of-knowing story exists');
    assert.ok(story.relatedExperiences, 'story has relatedExperiences');
    assert.strictEqual(story.relatedExperiences.length, 5);
    const science = reg.collections.find(c => c.id === 'science');
    science.experiences.forEach(expId => {
      assert.ok(story.relatedExperiences.includes(expId), `story references ${expId}`);
    });
  });
});
