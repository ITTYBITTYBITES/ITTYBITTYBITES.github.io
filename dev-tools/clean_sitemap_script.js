const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, 'build-engine.js');
let c = fs.readFileSync(p, 'utf8');

const oldRows = `    const rows = briefings.map(p => {\n      const per = personas.find(pr => per.slug === p.persona);\n      return \`<a href="./intel/\\\${p.slug}.html" class="block py-1 text-slate-400 hover:text-cyan-400 text-xs transition-colors truncate">→ Standard Setup for \\\${per?.name || p.persona}</a>\`;\n    }).join('');`;

const newRows = `    const rows = briefings.map(p => {\n      const per = personas.find(pr => pr.slug === p.persona);\n      return \`<a href="./intel/\${p.slug}.html" class="block py-1 text-slate-400 hover:text-cyan-400 text-xs transition-colors truncate font-mono">→ Standard Setup for \${per?.name || p.persona}</a>\`;\n    }).join('');`;

// Replace broken string
const broken = `      return \\\`<a href="./intel/\\\${p.slug}.html" class="block py-1 text-slate-400 hover:text-cyan-400 text-xs transition-colors truncate font-mono">→ Standard Setup for \\\${per?.name || p.persona}</a>\\\`;`;

c = c.replace(broken, `      return \`<a href="./intel/\${p.slug}.html" class="block py-1 text-slate-400 hover:text-cyan-400 text-xs transition-colors truncate font-mono">→ Standard Setup for \${per?.name || p.persona}</a>\`;`);

c = c.replace(/personas\.find\(pr => per\.slug === p\.persona\)/g, `personas.find(pr => pr.slug === p.persona)`);

fs.writeFileSync(p, c, 'utf8');
console.log("✓ Cleaned sitemap generator in build-engine.js");
