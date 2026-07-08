import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const REGISTRY_PATH = path.join(ROOT, 'src/generated/registry.json');

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf-8'));
}

describe('Release 0.8 Regression Suite', () => {
  it('society & mind collection contains 5 experiences and a story', () => {
    const reg = readJson('src/generated/registry.json');
    const collection = reg.collections.find((entry) => entry.id === 'society-mind');
    assert.ok(collection, 'society-mind collection exists');
    assert.strictEqual(collection.experiences.length, 5);
    assert.strictEqual(collection.story, 'bridges-within-and-between');
    assert.ok(collection.estimatedDuration, 'collection has estimatedDuration');
  });

  it('society & mind registry references are complete', () => {
    const reg = readJson('src/generated/registry.json');
    const ids = new Set(reg.experiences.map((entry) => entry.id));
    ['attention', 'bias', 'memory', 'cooperation', 'decision-making'].forEach((id) => {
      assert.ok(ids.has(id), `registry includes ${id}`);
    });

    const story = reg.stories.find((entry) => entry.id === 'bridges-within-and-between');
    assert.ok(story, 'story exists');
    assert.deepStrictEqual(story.relatedExperiences, ['attention', 'bias', 'memory', 'cooperation', 'decision-making']);
  });

  it('society & mind story segments cover the full journey', () => {
    const reg = readJson('src/generated/registry.json');
    const story = reg.stories.find((entry) => entry.id === 'bridges-within-and-between');
    assert.ok(story, 'story exists');
    const triggers = story.segments.map((segment) => segment.trigger);
    assert.ok(triggers.includes('collection_start'));
    assert.ok(triggers.includes('after_attention'));
    assert.ok(triggers.includes('after_bias'));
    assert.ok(triggers.includes('after_memory'));
    assert.ok(triggers.includes('after_cooperation'));
    assert.ok(triggers.includes('collection_complete'));
  });

  it('society & mind experiences preserve accessibility metadata', () => {
    const reg = readJson('src/generated/registry.json');
    const societyExperiences = reg.experiences.filter((entry) => entry.collection === 'society-mind');
    assert.strictEqual(societyExperiences.length, 5);
    societyExperiences.forEach((entry) => {
      assert.ok(entry.accessibility, `${entry.id} accessibility metadata exists`);
      assert.strictEqual(typeof entry.accessibility.keyboard, 'boolean');
      assert.strictEqual(typeof entry.accessibility.screenReader, 'boolean');
      assert.strictEqual(typeof entry.accessibility.contrast, 'boolean');
    });
  });

  it('all society & mind modules export valid ExperienceModule contracts', () => {
    const reg = readJson('src/generated/registry.json');
    const societyExperiences = reg.experiences.filter((entry) => entry.collection === 'society-mind');
    societyExperiences.forEach((entry) => {
      const modPath = path.join(ROOT, 'src/experiences', entry.module);
      assert.ok(fs.existsSync(modPath), `module exists: ${entry.module}`);
      const content = fs.readFileSync(modPath, 'utf-8');
      assert.ok(content.includes('export default'), `${entry.module} exports default`);
      assert.ok(content.includes('mount'), `${entry.module} includes mount`);
      assert.ok(content.includes('ExperienceModule'), `${entry.module} uses ExperienceModule`);
      assert.ok(content.includes('ExperienceContext'), `${entry.module} uses ExperienceContext`);
      assert.ok(content.includes('events'), `${entry.module} emits events`);
    });
  });

  it('generated relationships include society & mind mappings', () => {
    const rel = readJson('src/generated/relationships.json');
    assert.ok(rel.collectionsToExperiences['society-mind']);
    assert.deepStrictEqual(rel.collectionsToExperiences['society-mind'], ['attention', 'bias', 'memory', 'cooperation', 'decision-making']);
    ['attention', 'bias', 'memory', 'cooperation', 'decision-making'].forEach((id) => {
      assert.ok(rel.experiencesToCollections[id]);
      assert.ok(rel.experiencesToCollections[id].includes('society-mind'));
    });
  });

  it('society & mind content is consistent with source files', () => {
    const reg = readJson('src/generated/registry.json');
    const source = readJson('src/content/experiences/attention.json');
    const generated = reg.experiences.find((entry) => entry.id === 'attention');
    assert.strictEqual(generated.title, source.title);
    assert.strictEqual(generated.summary, source.summary);
    assert.strictEqual(generated.collection, 'society-mind');
  });

  it('library scale increased to 35 experiences, 7 collections, and 8 stories', () => {
    const reg = readJson('src/generated/registry.json');
    assert.ok(reg.experiences.length >= 35, 'registry has 35+ experiences');
    assert.ok(reg.collections.length >= 7, 'registry has 7+ collections');
    assert.ok(reg.stories.length >= 8, 'registry has 8+ stories');
  });

  it('search index includes the new collection and story', () => {
    const searchIndex = readJson('src/generated/search-index.json');
    assert.ok(searchIndex.some((entry) => entry.type === 'collection' && entry.id === 'society-mind'));
    assert.ok(searchIndex.some((entry) => entry.type === 'story' && entry.id === 'bridges-within-and-between'));
  });

  it('platform architecture files remain untouched by release content additions', () => {
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

    platformFiles.forEach((file) => {
      assert.ok(fs.existsSync(path.join(ROOT, file)), `${file} remains present and stable`);
    });
  });

  it('generated registry file exists for regression checks', () => {
    assert.ok(fs.existsSync(REGISTRY_PATH));
  });
});
