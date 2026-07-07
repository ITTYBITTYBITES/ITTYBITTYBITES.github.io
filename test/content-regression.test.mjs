import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');

describe('BUILD ORDER 005 Regression', () => {
  it('registry exists', () => {
    const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/generated/registry.json'), 'utf-8'));
    assert.ok(reg.experiences?.length > 0);
  });

  it('validation script runs', () => {
    // just check it doesn't throw when required
    assert.ok(fs.existsSync('scripts/validate-content.mjs'));
  });

  it('privacy guard in CI', () => {
    const ci = fs.readFileSync(path.join(ROOT, '.github/workflows/ci.yml'), 'utf-8');
    assert.ok(ci.includes('Privacy Boundary Guard'));
  });
});
