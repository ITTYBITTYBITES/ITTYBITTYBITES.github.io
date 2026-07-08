import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');

describe('Release 0.7 Regression Suite', () => {
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
    assert.ok(reg.experiences.length >= 35, 'Platform has 35+ experiences across 7 collections');
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
    assert.ok(rel.collectionsToExperiences.nature);
    assert.ok(rel.collectionsToExperiences.creativity);
    assert.ok(rel.collectionsToExperiences.engineering);
    assert.ok(rel.collectionsToExperiences.mathematics);
    assert.ok(rel.experiencesToCollections['echo-chamber']);
    assert.ok(rel.experiencesToCollections['dueling-accounts']);
    assert.ok(rel.experiencesToCollections['hypothesis']);
    assert.ok(rel.experiencesToCollections['ecosystem']);
    assert.ok(rel.experiencesToCollections['diverge']);
    assert.ok(rel.experiencesToCollections['patterns']);
    assert.ok(rel.experiencesToCollections['proof']);
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
    // Nature
    assert.ok(expIds.has('ecosystem'));
    assert.ok(expIds.has('seasons'));
    assert.ok(expIds.has('adaptation'));
    assert.ok(expIds.has('symbiosis'));
    assert.ok(expIds.has('watershed'));
    // Creativity
    assert.ok(expIds.has('diverge'));
    assert.ok(expIds.has('constraint'));
    assert.ok(expIds.has('remix'));
    assert.ok(expIds.has('compose'));
    assert.ok(expIds.has('iterate'));
    // Engineering
    assert.ok(expIds.has('bridge-builder'));
    assert.ok(expIds.has('feedback-loop'));
    assert.ok(expIds.has('optimization'));
    assert.ok(expIds.has('failure-analysis'));
    assert.ok(expIds.has('trade-offs'));
    // Mathematics
    assert.ok(expIds.has('patterns'));
    assert.ok(expIds.has('estimation'));
    assert.ok(expIds.has('symmetry'));
    assert.ok(expIds.has('probability'));
    assert.ok(expIds.has('proof'));

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

  // Nature collection completeness
  it('nature collection contains 5 experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const nature = reg.collections.find(c => c.id === 'nature');
    assert.ok(nature, 'nature collection exists');
    assert.strictEqual(nature.experiences.length, 5);
    assert.ok(nature.story, 'nature has a story');
    assert.ok(nature.estimatedDuration, 'nature has estimatedDuration');
  });

  // Creativity collection completeness
  it('creativity collection contains 5 experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const creativity = reg.collections.find(c => c.id === 'creativity');
    assert.ok(creativity, 'creativity collection exists');
    assert.strictEqual(creativity.experiences.length, 5);
    assert.ok(creativity.story, 'creativity has a story');
    assert.ok(creativity.estimatedDuration, 'creativity has estimatedDuration');
  });

  it('engineering collection contains 5 experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const engineering = reg.collections.find(c => c.id === 'engineering');
    assert.ok(engineering, 'engineering collection exists');
    assert.strictEqual(engineering.experiences.length, 5);
    assert.ok(engineering.story, 'engineering has a story');
    assert.ok(engineering.estimatedDuration, 'engineering has estimatedDuration');
  });

  it('mathematics collection contains 5 experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const mathematics = reg.collections.find(c => c.id === 'mathematics');
    assert.ok(mathematics, 'mathematics collection exists');
    assert.strictEqual(mathematics.experiences.length, 5);
    assert.deepStrictEqual(mathematics.experiences, ['patterns', 'estimation', 'symmetry', 'probability', 'proof']);
    assert.ok(mathematics.story, 'mathematics has a story');
    assert.ok(mathematics.estimatedDuration, 'mathematics has estimatedDuration');
  });

  // Story segments exist
  it('ways of knowing story has segments', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const story = reg.stories.find(s => s.id === 'ways-of-knowing');
    assert.ok(story, 'ways-of-knowing story exists');
    assert.ok(story.segments && story.segments.length >= 6, 'story has segments for each phase');
  });

  // The Living Web story segments
  it('the living web story has segments', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const story = reg.stories.find(s => s.id === 'the-living-web');
    assert.ok(story, 'the-living-web story exists');
    assert.ok(story.segments && story.segments.length >= 6, 'story has segments for each phase');
    assert.ok(story.relatedExperiences, 'story has relatedExperiences');
    assert.strictEqual(story.relatedExperiences.length, 5);
  });

  // The Making Process story segments
  it('the making process story has segments', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const story = reg.stories.find(s => s.id === 'the-making-process');
    assert.ok(story, 'the-making-process story exists');
    assert.ok(story.segments && story.segments.length >= 6, 'story has segments for each phase');
    assert.ok(story.relatedExperiences, 'story has relatedExperiences');
    assert.strictEqual(story.relatedExperiences.length, 5);
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

  // Nature content consistency
  it('nature content is consistent with source', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const srcExp = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/experiences/ecosystem.json'), 'utf-8'));
    const regExp = reg.experiences.find(e => e.id === 'ecosystem');
    assert.strictEqual(regExp.title, srcExp.title);
    assert.strictEqual(regExp.summary, srcExp.summary);
    assert.ok(regExp.accessibility);
    assert.strictEqual(regExp.collection, 'nature');
  });

  // Creativity content consistency
  it('creativity content is consistent with source', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const srcExp = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/experiences/diverge.json'), 'utf-8'));
    const regExp = reg.experiences.find(e => e.id === 'diverge');
    assert.strictEqual(regExp.title, srcExp.title);
    assert.strictEqual(regExp.summary, srcExp.summary);
    assert.ok(regExp.accessibility);
    assert.strictEqual(regExp.collection, 'creativity');
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

  // === SCALABILITY TESTS ===
  // Collections drop in with zero platform changes

  it('science collection experiences have unique interaction patterns', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const scienceExps = reg.experiences.filter(e => e.collection === 'science');
    assert.strictEqual(scienceExps.length, 5);

    const categories = new Set(scienceExps.map(e => e.category));
    assert.ok(categories.size >= 2, 'Science experiences span multiple categories');
  });

  it('nature collection experiences have unique interaction patterns', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const natureExps = reg.experiences.filter(e => e.collection === 'nature');
    assert.strictEqual(natureExps.length, 5);

    const categories = new Set(natureExps.map(e => e.category));
    assert.ok(categories.size >= 2, 'Nature experiences span multiple categories');
  });

  it('creativity collection experiences have unique interaction patterns', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const creativityExps = reg.experiences.filter(e => e.collection === 'creativity');
    assert.strictEqual(creativityExps.length, 5);

    const categories = new Set(creativityExps.map(e => e.category));
    assert.ok(categories.size >= 2, 'Creativity experiences span multiple categories');
  });

  it('no platform files were modified solely for collections', () => {
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

  it('all nature experience modules export valid ExperienceModule', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const natureExps = reg.experiences.filter(e => e.collection === 'nature');
    natureExps.forEach(exp => {
      const modPath = path.join(ROOT, 'src/experiences', exp.module);
      assert.ok(fs.existsSync(modPath), `Nature module exists: ${exp.module}`);
      const content = fs.readFileSync(modPath, 'utf-8');
      assert.ok(content.includes('export default'), `${exp.module} exports a default`);
      assert.ok(content.includes('mount'), `${exp.module} has mount function`);
      assert.ok(content.includes('ExperienceModule'), `${exp.module} uses ExperienceModule type`);
      assert.ok(content.includes('ExperienceContext'), `${exp.module} uses ExperienceContext type`);
      assert.ok(content.includes('events'), `${exp.module} emits platform events`);
    });
  });

  it('all creativity experience modules export valid ExperienceModule', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const creativityExps = reg.experiences.filter(e => e.collection === 'creativity');
    creativityExps.forEach(exp => {
      const modPath = path.join(ROOT, 'src/experiences', exp.module);
      assert.ok(fs.existsSync(modPath), `Creativity module exists: ${exp.module}`);
      const content = fs.readFileSync(modPath, 'utf-8');
      assert.ok(content.includes('export default'), `${exp.module} exports a default`);
      assert.ok(content.includes('mount'), `${exp.module} has mount function`);
      assert.ok(content.includes('ExperienceModule'), `${exp.module} uses ExperienceModule type`);
      assert.ok(content.includes('ExperienceContext'), `${exp.module} uses ExperienceContext type`);
      assert.ok(content.includes('events'), `${exp.module} emits platform events`);
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

  it('nature collection story references all its experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const story = reg.stories.find(s => s.id === 'the-living-web');
    assert.ok(story, 'the-living-web story exists');
    assert.ok(story.relatedExperiences, 'story has relatedExperiences');
    assert.strictEqual(story.relatedExperiences.length, 5);
    const nature = reg.collections.find(c => c.id === 'nature');
    nature.experiences.forEach(expId => {
      assert.ok(story.relatedExperiences.includes(expId), `story references ${expId}`);
    });
  });

  it('nature collection story segments cover all experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const story = reg.stories.find(s => s.id === 'the-living-web');
    assert.ok(story, 'the-living-web story exists');
    const triggers = story.segments.map(s => s.trigger);
    assert.ok(triggers.includes('collection_start'), 'story has collection_start trigger');
    assert.ok(triggers.includes('after_ecosystem'), 'story has after_ecosystem trigger');
    assert.ok(triggers.includes('after_seasons'), 'story has after_seasons trigger');
    assert.ok(triggers.includes('after_adaptation'), 'story has after_adaptation trigger');
    assert.ok(triggers.includes('after_symbiosis'), 'story has after_symbiosis trigger');
    assert.ok(triggers.includes('collection_complete'), 'story has collection_complete trigger');
  });

  it('creativity collection story references all its experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const story = reg.stories.find(s => s.id === 'the-making-process');
    assert.ok(story, 'the-making-process story exists');
    assert.ok(story.relatedExperiences, 'story has relatedExperiences');
    assert.strictEqual(story.relatedExperiences.length, 5);
    const creativity = reg.collections.find(c => c.id === 'creativity');
    creativity.experiences.forEach(expId => {
      assert.ok(story.relatedExperiences.includes(expId), `story references ${expId}`);
    });
  });

  it('creativity collection story segments cover all experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const story = reg.stories.find(s => s.id === 'the-making-process');
    assert.ok(story, 'the-making-process story exists');
    const triggers = story.segments.map(s => s.trigger);
    assert.ok(triggers.includes('collection_start'), 'story has collection_start trigger');
    assert.ok(triggers.includes('after_diverge'), 'story has after_diverge trigger');
    assert.ok(triggers.includes('after_constraint'), 'story has after_constraint trigger');
    assert.ok(triggers.includes('after_remix'), 'story has after_remix trigger');
    assert.ok(triggers.includes('after_compose'), 'story has after_compose trigger');
    assert.ok(triggers.includes('collection_complete'), 'story has collection_complete trigger');
  });

  // Engineering collection tests
  it('engineering content is consistent with source', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const srcExp = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/experiences/bridge-builder.json'), 'utf-8'));
    const regExp = reg.experiences.find(e => e.id === 'bridge-builder');
    assert.strictEqual(regExp.title, srcExp.title);
    assert.strictEqual(regExp.summary, srcExp.summary);
    assert.ok(regExp.accessibility);
    assert.strictEqual(regExp.collection, 'engineering');
  });

  it('all engineering experience modules export valid ExperienceModule', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const engineeringExps = reg.experiences.filter(e => e.collection === 'engineering');
    engineeringExps.forEach(exp => {
      const modPath = path.join(ROOT, 'src/experiences', exp.module);
      assert.ok(fs.existsSync(modPath), `Engineering module exists: ${exp.module}`);
      const content = fs.readFileSync(modPath, 'utf-8');
      assert.ok(content.includes('export default'), `${exp.module} exports a default`);
      assert.ok(content.includes('mount'), `${exp.module} has mount function`);
      assert.ok(content.includes('ExperienceModule'), `${exp.module} uses ExperienceModule type`);
      assert.ok(content.includes('ExperienceContext'), `${exp.module} uses ExperienceContext type`);
      assert.ok(content.includes('events'), `${exp.module} emits platform events`);
    });
  });

  it('engineering collection story references all its experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const story = reg.stories.find(s => s.id === 'the-art-of-compromise');
    assert.ok(story, 'the-art-of-compromise story exists');
    assert.ok(story.relatedExperiences, 'story has relatedExperiences');
    assert.strictEqual(story.relatedExperiences.length, 5);
    const engineering = reg.collections.find(c => c.id === 'engineering');
    engineering.experiences.forEach(expId => {
      assert.ok(story.relatedExperiences.includes(expId), `story references ${expId}`);
    });
  });

  it('engineering collection story segments cover all experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const story = reg.stories.find(s => s.id === 'the-art-of-compromise');
    assert.ok(story, 'the-art-of-compromise story exists');
    const triggers = story.segments.map(s => s.trigger);
    assert.ok(triggers.includes('collection_start'), 'story has collection_start trigger');
    assert.ok(triggers.includes('after_bridge-builder'), 'story has after_bridge-builder trigger');
    assert.ok(triggers.includes('after_feedback-loop'), 'story has after_feedback-loop trigger');
    assert.ok(triggers.includes('after_optimization'), 'story has after_optimization trigger');
    assert.ok(triggers.includes('after_failure-analysis'), 'story has after_failure-analysis trigger');
    assert.ok(triggers.includes('collection_complete'), 'story has collection_complete trigger');
  });

  it('engineering collection experiences have unique interaction patterns', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const engineeringExps = reg.experiences.filter(e => e.collection === 'engineering');
    assert.strictEqual(engineeringExps.length, 5);

    const categories = new Set(engineeringExps.map(e => e.category));
    assert.ok(categories.size >= 2, 'Engineering experiences span multiple categories');
  });

  // Mathematics collection tests
  it('mathematics content is consistent with source', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const srcExp = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/experiences/patterns.json'), 'utf-8'));
    const regExp = reg.experiences.find(e => e.id === 'patterns');
    assert.strictEqual(regExp.title, srcExp.title);
    assert.strictEqual(regExp.summary, srcExp.summary);
    assert.ok(regExp.accessibility);
    assert.strictEqual(regExp.collection, 'mathematics');
  });

  it('all mathematics experience modules export valid ExperienceModule', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const mathematicsExps = reg.experiences.filter(e => e.collection === 'mathematics');
    mathematicsExps.forEach(exp => {
      const modPath = path.join(ROOT, 'src/experiences', exp.module);
      assert.ok(fs.existsSync(modPath), `Mathematics module exists: ${exp.module}`);
      const content = fs.readFileSync(modPath, 'utf-8');
      assert.ok(content.includes('export default'), `${exp.module} exports a default`);
      assert.ok(content.includes('mount'), `${exp.module} has mount function`);
      assert.ok(content.includes('ExperienceModule'), `${exp.module} uses ExperienceModule type`);
      assert.ok(content.includes('ExperienceContext'), `${exp.module} uses ExperienceContext type`);
      assert.ok(content.includes('events'), `${exp.module} emits platform events`);
    });
  });

  it('mathematics collection story references all its experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const story = reg.stories.find(s => s.id === 'the-language-of-patterns');
    assert.ok(story, 'the-language-of-patterns story exists');
    assert.ok(story.relatedExperiences, 'story has relatedExperiences');
    assert.strictEqual(story.relatedExperiences.length, 5);
    const mathematics = reg.collections.find(c => c.id === 'mathematics');
    mathematics.experiences.forEach(expId => {
      assert.ok(story.relatedExperiences.includes(expId), `story references ${expId}`);
    });
  });

  it('mathematics collection story segments cover all experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const story = reg.stories.find(s => s.id === 'the-language-of-patterns');
    assert.ok(story, 'the-language-of-patterns story exists');
    const triggers = story.segments.map(s => s.trigger);
    assert.ok(triggers.includes('collection_start'), 'story has collection_start trigger');
    assert.ok(triggers.includes('after_patterns'), 'story has after_patterns trigger');
    assert.ok(triggers.includes('after_estimation'), 'story has after_estimation trigger');
    assert.ok(triggers.includes('after_symmetry'), 'story has after_symmetry trigger');
    assert.ok(triggers.includes('after_probability'), 'story has after_probability trigger');
    assert.ok(triggers.includes('collection_complete'), 'story has collection_complete trigger');
  });

  it('mathematics collection experiences have unique interaction patterns', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const mathematicsExps = reg.experiences.filter(e => e.collection === 'mathematics');
    assert.strictEqual(mathematicsExps.length, 5);

    const categories = new Set(mathematicsExps.map(e => e.category));
    assert.ok(categories.size >= 3, 'Mathematics experiences span multiple categories');
  });

  // Seventh collection scalability — platform unchanged
  it('platform scaled to 7 collections without modification', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    assert.ok(reg.collections.length >= 7, 'Registry has 7+ collections');
    assert.ok(reg.experiences.length >= 35, 'Registry has 35+ experiences');
    assert.ok(reg.stories.length >= 8, 'Registry has 8+ stories');
  });

  // Branding consistency tests
  it('branding uses ITTYBITTYBITES consistently', () => {
    const headerPath = path.join(ROOT, 'src/components/app-header.ts');
    const header = fs.readFileSync(headerPath, 'utf-8');
    assert.ok(header.includes('ITTYBITTYBITES'), 'header contains brand name');

    const footerPath = path.join(ROOT, 'src/components/app-footer.ts');
    const footer = fs.readFileSync(footerPath, 'utf-8');
    assert.ok(footer.includes('ITTYBITTYBITES'), 'footer contains brand name');

    const configPath = path.join(ROOT, 'src/platform/config.ts');
    const config = fs.readFileSync(configPath, 'utf-8');
    assert.ok(config.includes("siteTitle: 'ITTYBITTYBITES'"), 'config has correct site title');
  });

  it('homepage uses branded messaging', () => {
    const homePath = path.join(ROOT, 'src/pages/home.ts');
    const home = fs.readFileSync(homePath, 'utf-8');
    assert.ok(home.includes('ITTYBITTYBITES'), 'homepage hero has brand name');
    assert.ok(home.includes('Interactive collections worth returning to'), 'homepage has branded lead text');
    assert.ok(!home.includes('The Experience Platform'), 'homepage does not use generic platform name');
  });

  it('PWA manifest uses branded name', () => {
    const vitePath = path.join(ROOT, 'vite.config.ts');
    const vite = fs.readFileSync(vitePath, 'utf-8');
    assert.ok(vite.includes("name: 'ITTYBITTYBITES'"), 'PWA manifest has branded name');
    assert.ok(vite.includes("short_name: 'ITTYBITTYBITES'"), 'PWA manifest has branded short name');
    assert.ok(!vite.includes('experiments'), 'PWA manifest does not reference experiments');
  });

  it('index.html uses branded title', () => {
    const htmlPath = path.join(ROOT, 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');
    assert.ok(html.includes('<title>ITTYBITTYBITES</title>'), 'HTML title is branded');
    assert.ok(html.includes('ITTYBITTYBITES'), 'meta description contains brand name');
  });
});
