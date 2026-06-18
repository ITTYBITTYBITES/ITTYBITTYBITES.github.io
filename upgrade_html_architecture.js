/**
 * COMPLETE HTML ARCHITECTURE AUDIT & UNIFICATION ENGINE // v2.0
 * Standardizes design, global navigation, and AI telemetry across all 25 root HTML assets.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const FILES_TO_UPGRADE = [
  'arcade.html', 'behavioral-economics.html', 'best-brain-games.html',
  'best-psychology-books.html', 'brain-training-tips.html', 'cognitive-biases.html',
  'cybersecurity-beginners.html', 'decision-making.html', 'dunning-kruger.html',
  'false-memory.html', 'feed.html', 'first-aid-basics.html', 'flow-state.html',
  'food-safety.html', 'how-doctors-think.html', 'index.html', 'library.html',
  'logical-fallacies.html', 'pattern-recognition.html', 'priming-effect.html',
  'privacy_policy.html', 'rapid-thinking.html', 'social-engineering.html',
  'stroop-effect.html', 'survival-skills.html'
];

const MASTER_NAV_CONFIG = [
  { id: 'index', label: 'HQ', matchFiles: ['index.html'] },
  { id: 'arcade', label: 'ARCADE', matchFiles: ['arcade.html'] },
  { id: 'matrix', label: 'MATRIX', matchFiles: [] }, // Links to intel/index.html
  { id: 'feed', label: 'FEEDS', matchFiles: ['feed.html'] },
  { id: 'library', label: 'LOCKER', matchFiles: ['library.html'] },
  { id: 'stroop', label: 'STROOP', matchFiles: ['stroop-effect.html'] },
  { id: 'biases', label: 'BIASES', matchFiles: ['cognitive-biases.html'] },
  { id: 'decisions', label: 'DECISIONS', matchFiles: ['decision-making.html'] },
  { id: 'security', label: 'SECURITY', matchFiles: ['social-engineering.html', 'cybersecurity-beginners.html'] },
  { id: 'training', label: 'TRAINING', matchFiles: ['best-brain-games.html', 'brain-training-tips.html'] },
  { id: 'flow', label: 'FLOW', matchFiles: ['flow-state.html'] }
];

function buildGlobalNav(activeFilename, prefix = '') {
  const links = MASTER_NAV_CONFIG.map(item => {
    let href = '';
    if (item.id === 'matrix') {
      href = `${prefix}intel/index.html`;
    } else if (item.id === 'index') {
      href = `${prefix}index.html`;
    } else {
      href = `${prefix}${item.matchFiles[0] || 'index.html'}`;
    }

    const isActive = item.matchFiles.includes(activeFilename);
    return `<a href="${href}" class="nav-node ${isActive ? 'active' : ''}">${item.label}</a>`;
  }).join('\n    ');

  return `<!-- GLOBAL UNIFIED TACTICAL NAVIGATION -->
<nav class="bg-slate-950/95 border-b border-cyan-400/20 py-3.5 sticky top-0 z-50 backdrop-blur-md shadow-2xl select-none font-mono">
  <div class="max-w-[1400px] mx-auto px-4 flex justify-center gap-1.5 sm:gap-3 flex-wrap items-center">
    ${links}
  </div>
</nav>`;
}

const GLOBAL_STYLES = `
    <!-- Accelerated Core Styling -->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Orbitron:wght@700;900&display=swap');
        :root { --bg: #020617; --cyan: #22d3ee; --emerald: #34d399; --gold: #facc15; --rose: #f43f5e; --border: rgba(34,211,238,0.15); }
        body { font-family: 'JetBrains+Mono', monospace; background-color: var(--bg); color: #f8fafc; line-height: 1.8; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        .nav-node { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 6px 12px; border: 1px solid #1e293b; border-radius: 6px; color: #94a3b8; transition: all 0.2s ease; text-decoration: none; display: inline-block; background: #0b0f19; }
        .nav-node:hover { color: #22d3ee; border-color: #22d3ee; background: rgba(34,211,238,0.1); transform: translateY(-1px); }
        .nav-node.active { color: #22d3ee; border-color: #22d3ee; font-weight: 900; background: rgba(34,211,238,0.15); box-shadow: 0 0 15px rgba(34,211,238,0.3); }
        .article-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 1024px) { .article-grid { grid-template-columns: 1fr 320px; } }
        .tactical-panel { background: #0b0f19; border: 1px solid var(--border); border-radius: 12px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h1, h2, h3, h4 { font-family: 'Orbitron', sans-serif; font-weight: 900; letter-spacing: 1px; color: #white; }
        h1 { color: var(--cyan); font-size: 2.2rem; text-transform: uppercase; text-shadow: 0 0 20px rgba(34,211,238,0.4); margin-bottom: 16px; }
        h2 { color: var(--cyan); font-size: 1.5rem; margin-top: 36px; margin-bottom: 16px; border-left: 4px solid var(--cyan); padding-left: 14px; }
        h3 { color: var(--gold); font-size: 1.2rem; margin-top: 28px; margin-bottom: 12px; }
        p { color: #cbd5e1; margin-bottom: 16px; font-size: 0.95rem; }
        ul, ol { color: #cbd5e1; margin-left: 24px; margin-bottom: 20px; space-y: 8px; }
        li { margin-bottom: 8px; }
        a { color: var(--cyan); text-decoration: none; font-weight: bold; transition: color 0.2s; }
        a:hover { color: var(--gold); }
        .product-card { background: linear-gradient(135deg, #0f172a, #0b0f19); border: 1px solid rgba(250,204,21,0.3); border-radius: 12px; padding: 20px; margin: 24px 0; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
        .product-card h4 { color: var(--gold); font-size: 1.1rem; margin-bottom: 8px; }
        .btn-deploy { display: inline-block; background: linear-gradient(90deg, #facc15, #ca8a04); color: #020617; font-weight: 900; font-family: 'Orbitron', sans-serif; padding: 12px 24px; border-radius: 6px; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 12px; box-shadow: 0 0 20px rgba(250,204,21,0.3); }
        .btn-deploy:hover { background: #fef08a; transform: translateY(-2px); color: #020617; }
    </style>`;

const GLOBAL_FOOTER = `
    <!-- UNIFIED LEGAL & MISSION FOOTER -->
    <footer class="border-t border-slate-900 bg-slate-950 py-12 px-6 mt-auto text-slate-500 font-mono text-xs leading-relaxed select-none">
        <div class="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
                <h4 class="text-slate-300 font-bold uppercase tracking-wider text-xs mb-3 font-['Orbitron']">◈ Operational Objective</h4>
                <p class="text-xs text-slate-400">
                    The 2-Second Witness is an elite psychological and cognitive training theater. We weaponize psychological phenomena like the Stroop Effect and dual-process theory to help field operatives override System 1 cognitive interference under extreme pressure.
                </p>
            </div>
            <div>
                <h4 class="text-slate-300 font-bold uppercase tracking-wider text-xs mb-3 font-['Orbitron']">◈ Open-Source AI Ingestion</h4>
                <p class="text-xs text-slate-400">
                    All interactive sandbox mechanics across our portal ingest 100% anonymized behavioral coordinate mapping exactly compliant with GDPR and EU AI Act open-source research parameters. Zero personally identifiable credentials (PII) are ever logged.
                </p>
            </div>
            <div>
                <h4 class="text-slate-300 font-bold uppercase tracking-wider text-xs mb-3 font-['Orbitron']">◈ Classified Deployment</h4>
                <div class="flex flex-col space-y-2 mt-2">
                    <a href="https://play.google.com/store/apps/details?id=com.ittybittybites.the2secondwitness" target="_blank" rel="noopener" class="px-4 py-2.5 bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-cyan-400/20 rounded font-bold transition-all flex items-center justify-between text-xs">
                        <span>🚀 DEPLOY ON ANDROID</span> <span>&rarr;</span>
                    </a>
                    <a href="https://ittybittybites.itch.io/2-second-witness" target="_blank" rel="noopener" class="px-4 py-2.5 bg-slate-900 hover:bg-gold hover:text-slate-950 text-gold border border-gold/20 rounded font-bold transition-all flex items-center justify-between text-xs">
                        <span>⚡ WEB SIMULATION DEMO</span> <span>&rarr;</span>
                    </a>
                </div>
            </div>
        </div>
        <div class="max-w-[1200px] mx-auto text-center border-t border-slate-900/80 pt-8 text-[11px] text-slate-500 tracking-widest uppercase flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>© 2026 ITTY BITTY BITES // Classified Cognitive Training Division</div>
            <div class="flex space-x-6 text-xs">
                <a href="privacy_policy.html" class="hover:text-cyan-400">Privacy Policy</a>
                <a href="sitemap.xml" class="hover:text-cyan-400">Sitemap XML</a>
                <a href="feed.html" class="hover:text-cyan-400">RSS Database</a>
            </div>
        </div>
    </footer>`;

FILES_TO_UPGRADE.forEach(filename => {
  const filePath = path.join(ROOT, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`File missing, skipping: ${filename}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Skip files that are already highly custom apps (like arcade, index, feed, library) if we don't want to break their specific inner layout, BUT we DO want to unify their <nav>!
  if (['arcade.html', 'index.html', 'feed.html', 'library.html'].includes(filename)) {
    // Unify their global navigation exactly
    const freshNav = buildGlobalNav(filename, '');
    content = content.replace(/<nav class="bg-slate-950[^>]*>[\s\S]*?<\/nav>/i, freshNav);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✓ Master dynamic page unified: ${filename}`);
    return;
  }

  // For standalone article pages (like stroop-effect.html, behavioral-economics.html, etc.), upgrade their complete HTML wrapper!
  console.log(`  🔄 Upgrading standalone briefing architecture: ${filename}`);

  // Extract Title
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : `${filename.replace('.html', '').toUpperCase()} | The 2-Second Witness`;

  // Extract Meta description
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i);
  const desc = descMatch ? descMatch[1].trim() : "Classified cognitive research and dual-process decision training protocols.";

  // Extract Body raw text or inner container content
  let innerBody = '';
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    innerBody = bodyMatch[1];
    // Strip out any old nav-top or old footer or container shells to prevent duplicate headers
    innerBody = innerBody.replace(/<div class=["']nav-top["']>[\s\S]*?<\/div>/i, '');
    innerBody = innerBody.replace(/<div class=["']container["']>([\s\S]*?)<\/div>\s*<\/body>/i, '$1');
    innerBody = innerBody.replace(/<div class=["']footer["']>[\s\S]*?<\/div>/i, '');
    innerBody = innerBody.replace(/<!-- GLOBAL UNIFIED[^>]*>[\s\S]*?<\/nav>/i, '');
    innerBody = innerBody.replace(/<footer[^>]*>[\s\S]*?<\/footer>/i, '');
    innerBody = innerBody.replace(/<nav[^>]*>[\s\S]*?<\/nav>/i, '');
  } else {
    innerBody = "<p>Operational briefing asset currently securely isolated.</p>";
  }

  // Ensure Amazon Affiliate links inside article text have our master associate tag
  innerBody = innerBody.replace(/https:\/\/www\.amazon\.com\/dp\/([a-zA-Z0-9]+)\/[^"'\s]*/gi, 'https://www.amazon.com/dp/$1/?tag=ittybittybite-20');

  // Build Flawless Comprehensive Upgraded Document Shell
  const upgradedDocument = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <meta name="keywords" content="stroop effect, cognitive bias, system 1 system 2, brain training game, psychological warfare, behavioral economics">
    <link rel="canonical" href="https://ittybittybites.github.io/${filename}">
    <!-- Fully Accelerated CDN Engine -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-6P6NPFW4FZ"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-6P6NPFW4FZ');
    </script>
${GLOBAL_STYLES}
</head>
<body class="min-h-screen flex flex-col selection:bg-cyan-500 selection:text-slate-900 antialiased bg-slate-950">

    ${buildGlobalNav(filename, '')}

    <!-- MASTER THEATER BRIEFING CONTAINER -->
    <main class="max-w-[1200px] w-full mx-auto px-5 py-12 flex-1 flex flex-col justify-center">
        
        <!-- Briefing Header Badge -->
        <div class="flex items-center space-x-3 mb-6">
            <span class="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
            <span class="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">RESEARCH & INTELLIGENCE BRIEFING // ITTY BITTY BITES</span>
        </div>

        <div class="tactical-panel flex-1 w-full font-mono space-y-6">
            ${innerBody.trim()}
        </div>

        <!-- Dynamic Automated Topic Matrix Navigation Hook -->
        <div class="mt-12 pt-8 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="bg-slate-900/60 p-6 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                    <span class="text-[10px] tracking-widest font-bold text-gold uppercase block">Tactical Operational Protocols</span>
                    <h4 class="text-sm font-bold text-white mt-1">Explore 588 Programmatic AI Briefings</h4>
                    <p class="text-xs text-slate-400 mt-2 leading-relaxed">Systematic neural protocols customized for 28 real-world elite operator personas.</p>
                </div>
                <a href="intel/index.html" class="mt-4 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-cyan-500/30 rounded font-bold text-xs uppercase tracking-wider transition-all self-start">
                    Launch Protocol Matrix &rarr;
                </a>
            </div>

            <div class="bg-slate-900/60 p-6 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                    <span class="text-[10px] tracking-widest font-bold text-emerald-400 uppercase block">Interactive Evaluation Terminal</span>
                    <h4 class="text-sm font-bold text-white mt-1">Cognitive Diagnostic Arcade</h4>
                    <p class="text-xs text-slate-400 mt-2 leading-relaxed">Test your reaction buffers, working memory churn, and signal detection filters live.</p>
                </div>
                <a href="arcade.html" class="mt-4 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/30 rounded font-bold text-xs uppercase tracking-wider transition-all self-start">
                    Enter Tactical Arcade &rarr;
                </a>
            </div>
        </div>

    </main>

${GLOBAL_FOOTER}

</body>
</html>`;

  fs.writeFileSync(filePath, upgradedDocument, 'utf-8');
  console.log(`  ✓ Briefing completely upgraded & hardened: ${filename}`);
});

// Also update templates/template.html (for generated intel/ library/ pages) so it perfectly uses this new global nav!
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'template.html');
if (fs.existsSync(TEMPLATE_PATH)) {
  let tpl = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const freshTplNav = buildGlobalNav('none', '../');
  tpl = tpl.replace(/<nav class="bg-slate-950[^>]*>[\s\S]*?<\/nav>/i, freshTplNav);
  // Replace old footer with unified footer
  tpl = tpl.replace(/<footer[^>]*>[\s\S]*?<\/footer>/i, GLOBAL_FOOTER.replace(/href="/g, 'href="../'));
  fs.writeFileSync(TEMPLATE_PATH, tpl, 'utf-8');
  console.log(`  ✓ Master ssg template updated: templates/template.html`);
}

console.log("\n  🚀 Unification complete across all platform assets!");
