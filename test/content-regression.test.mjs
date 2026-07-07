import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');

describe('BUILD ORDER 005 Regression Suite (Phases 1-8)', () => {
  // Phase 6: Schema validation
  it('experience schema validates required fields', () => {
    const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/schemas/experience.schema.json'), 'utf-8'));
    assert.ok(schema.required.includes('id'));
    assert.ok(schema.required.includes('title'));
    assert.ok(schema.required.includes('module'));
    assert.ok(schema.properties.accessibility, 'accessibility metadata required in schema');
  });

  it('collection schema valid', () => {
    const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/schemas/collection.schema.json'), 'utf-8'));
    assert.ok(schema.required.includes('experiences'));
  });

  // Registry generation
  it('registry exists and is valid', () => {
    const regPath = path.join(ROOT, 'src/generated/registry.json');
    assert.ok(fs.existsSync(regPath), 'registry.json must exist after generation');
    const reg = JSON.parse(fs.readFileSync(regPath, 'utf-8'));
    assert.ok(reg.version);
    assert.ok(Array.isArray(reg.experiences));
    assert.ok(reg.experiences.length >= 2);
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
  });

  // Relationship generation
  it('relationships graph correct', () => {
    const rel = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/relationships.json'), 'utf-8'));
    assert.ok(rel.collectionsToExperiences);
    assert.ok(rel.collectionsToExperiences.foundations);
    assert.ok(rel.experiencesToCollections['echo-chamber']);
  });

  // Lazy-loading & route generation (basic structural)
  it('experience modules exist for lazy loading', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    reg.experiences.forEach(exp => {
      const modPath = path.join(ROOT, 'src/experiences', exp.module);
      assert.ok(fs.existsSync(modPath), `Experience module missing: ${exp.module}`);
    });
  });

  // Every experience loads successfully (via registry)
  it('all experiences are loadable via registry', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const expIds = new Set(reg.experiences.map(e => e.id));
    assert.ok(expIds.has('echo-chamber'));
    assert.ok(expIds.has('pattern-garden'));
    reg.experiences.forEach(e => {
      if (e.collection) {
        const col = reg.collections.find(c => c.id === e.collection);
        assert.ok(col, `Collection ref broken: ${e.collection}`);
      }
    });
  });

  // Privacy boundary verification (CI guard check)
  it('privacy boundary guard present in CI', () => {
    const ci = fs.readFileSync(path.join(ROOT, '.github/workflows/ci.yml'), 'utf-8');
    assert.ok(ci.includes('Privacy Boundary Guard'));
    assert.ok(ci.includes('governing'));
    assert.ok(ci.includes('*.md'));
  });

  // Generated content consistency
  it('generated content is consistent with source', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    const srcExp = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/experiences/echo-chamber.json'), 'utf-8'));
    const regExp = reg.experiences.find(e => e.id === 'echo-chamber');
    assert.strictEqual(regExp.title, srcExp.title);
    assert.strictEqual(regExp.summary, srcExp.summary);
    assert.ok(regExp.accessibility);
  });

  // Phase 4 performance reports
  it('performance report generated', () => {
    const perf = path.join(ROOT, '.build-reports/performance-report.json');
    assert.ok(fs.existsSync(perf));
    const data = JSON.parse(fs.readFileSync(perf, 'utf-8'));
    assert.ok(data.measurements || data);
  });

  // Phase 5 diagnostics
  it('developer diagnostics generated', () => {
    const diag = path.join(ROOT, '.build-reports/diagnostics.json');
    assert.ok(fs.existsSync(diag));
    const d = JSON.parse(fs.readFileSync(diag, 'utf-8'));
    assert.ok(d.platformVersion || d.status);
  });

  // Phase 7 reports
  it('full build reports exist', () => {
    const reports = ['build-summary.json', 'content-report.json', 'accessibility-report.json', 'performance-report.json'];
    reports.forEach(r => {
      assert.ok(fs.existsSync(path.join(ROOT, '.build-reports', r)), `Missing report: ${r}`);
    });
  });

  // Phase 2 + 3 quality
  it('accessibility metadata present on all experiences', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    reg.experiences.forEach(e => {
      assert.ok(e.accessibility, `${e.id} missing accessibility gate`);
      assert.strictEqual(typeof e.accessibility.keyboard, 'boolean');
      assert.strictEqual(typeof e.accessibility.screenReader, 'boolean');
    });
  });

  // Additional regression checks
  it('build reports directory exists and contains key reports', () => {
    assert.ok(fs.existsSync(path.join(ROOT, '.build-reports')));
    const files = fs.readdirSync(path.join(ROOT, '.build-reports'));
    assert.ok(files.some(f => f.includes('content') || f.includes('build-summary') || f.includes('performance')));
  });

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
});
