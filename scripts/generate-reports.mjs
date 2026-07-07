#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const ROOT = process.cwd();
const REPORTS = path.join(ROOT, '.build-reports');
if (!fs.existsSync(REPORTS)) fs.mkdirSync(REPORTS, { recursive: true });

const summary = {
  timestamp: new Date().toISOString(),
  status: "success",
  distFiles: fs.existsSync('dist') ? fs.readdirSync('dist').length : 0
};
fs.writeFileSync(path.join(REPORTS, 'build-summary.json'), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(REPORTS, 'build-summary.md'), `# Build Summary\n\n- Status: ${summary.status}\n- Dist files: ${summary.distFiles}\n- Time: ${summary.timestamp}`);
console.log('✅ Build reports generated');
