#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const ROOT = process.cwd();
const REPORTS = path.join(ROOT, '.build-reports');
if (!fs.existsSync(REPORTS)) fs.mkdirSync(REPORTS, { recursive: true });
const diag = { generatedAt: new Date().toISOString(), status: "dev diagnostics (minimal)", platform: "0.1.0" };
fs.writeFileSync(path.join(REPORTS, 'diagnostics.json'), JSON.stringify(diag, null, 2));
console.log('✅ Diagnostics generated');
