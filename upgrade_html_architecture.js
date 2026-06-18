/**
 * COMPLETE HTML ARCHITECTURE AUDIT & UNIFICATION ENGINE // v3.0
 * Implements crisp 5-Node mobile-optimized Top Nav and rich structured Research Footer.
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
  { id: 'library', label: 'LOCKER', matchFiles: ['library.html'] }
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
<nav class="bg-slate-950 border-b border-cyan-400/20 py-3 sticky top-0 z-50 backdrop-blur-md shadow-2xl select-none font-mono">
  <div class="max-w-[1200px] mx-auto px-4 flex justify-center gap-2 sm:gap-4 flex-wrap items-center">
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
        .nav-node { font-size: 13px; font-family: 'Orbitron', sans-serif; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; padding: 8px 18px; border: 1px solid #1e293b; border-radius: 8px; color: #94a3b8; transition: all 0.2s ease; text-decoration: none; display: inline-block; background: #0b0f19; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
        .nav-node:hover { color: #22d3ee; border-color: #22d3ee; background: rgba(34,211,238,0.1); transform: translateY(-1px); }
        .nav-node.active { color: #22d3ee; border-color: #22d3ee; font-weight: 900; background: rgba(34,211,238,0.15); box-shadow: 0 0 20px rgba(34,211,238,0.4); }
        .article-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 1024px) { .article-grid { grid-template-columns: 1fr 320px; } }
        .tactical-panel { background: #0b0f19; border: 1px solid var(--border); border-radius: 16px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
        h1, h2, h3, h4 { font-family: 'Orbitron', sans-serif; font-weight: 900; letter-spacing: 1px; color: #white; }
        h1 { color: var(--cyan); font-size: 2.4rem; text-transform: uppercase; text-shadow: 0 0 25px rgba(34,211,238,0.4); margin-bottom: 18px; }
        h2 { color: var(--cyan); font-size: 1.6rem; margin-top: 40px; margin-bottom: 18px; border-left: 4px solid var(--cyan); padding-left: 16px; }
        h3 { color: var(--gold); font-size: 1.25rem; margin-top: 30px; margin-bottom: 14px; }
        p { color: #cbd5e1; margin-bottom: 18px; font-size: 1rem; }
        ul, ol { color: #cbd5e1; margin-left: 24px; margin-bottom: 24px; space-y: 8px; }
        li { margin-bottom: 8px; }
        a { color: var(--cyan); text-decoration: none; font-weight: bold; transition: color 0.2s; }
        a:hover { color: var(--gold); }
        .product-card { background: linear-gradient(135deg, #0f172a, #0b0f19); border: 2px solid rgba(250,204,21,0.4); border-radius: 16px; padding: 24px; margin: 32px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .product-card h4 { color: var(--gold); font-size: 1.2rem; margin-bottom: 8px; }
        .btn-deploy { display: inline-block; background: linear-gradient(90deg, #facc15, #ca8a04); color: #020617; font-weight: 900; font-family: 'Orbitron', sans-serif; padding: 14px 28px; border-radius: 8px; text-transform: uppercase; letter-spacing: 2px; margin-top: 14px; box-shadow: 0 0 25px rgba(250,204,21,0.4); }
        .btn-deploy:hover { background: #fef08a; transform: translateY(-2px); color: #020617; }
    </style>`;

const GLOBAL_FOOTER = `
    <!-- UNIFIED LEGAL & MISSION FOOTER -->
    <footer class="border-t border-slate-900 bg-slate-950 py-16 px-6 mt-auto text-slate-500 font-mono text-xs leading-relaxed select-none">
        <div class="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-16 border-b border-slate-900 pb-16">
            <div>
                <h4 class="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-4 font-['Orbitron'] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> Tactical Briefings</h4>
                <div class="space-y-2.5 flex flex-col text-xs font-mono font-medium text-slate-300">
                    <a href="stroop-effect.html" class="hover:text-gold transition-colors py-1 block">◈ The Stroop Effect</a>
                    <a href="cognitive-biases.html" class="hover:text-gold transition-colors py-1 block">◈ 25 Cognitive Biases</a>
                    <a href="decision-making.html" class="hover:text-gold transition-colors py-1 block">◈ System 1 vs System 2</a>
                    <a href="rapid-thinking.html" class="hover:text-gold transition-colors py-1 block">◈ Rapid Thinking Protocols</a>
                    <a href="dunning-kruger.html" class="hover:text-gold transition-colors py-1 block">◈ Dunning-Kruger Analysis</a>
                    <a href="flow-state.html" class="hover:text-gold transition-colors py-1 block">◈ Flow State Triggers</a>
                </div>
            </div>

            <div>
                <h4 class="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-4 font-['Orbitron'] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Research Hub</h4>
                <div class="space-y-2.5 flex flex-col text-xs font-mono font-medium text-slate-300">
                    <a href="social-engineering.html" class="hover:text-gold transition-colors py-1 block">◈ 10 Social Engineering Defenses</a>
                    <a href="how-doctors-think.html" class="hover:text-gold transition-colors py-1 block">◈ How Doctors Think (Pattern Rec)</a>
                    <a href="logical-fallacies.html" class="hover:text-gold transition-colors py-1 block">◈ 15 Logical Fallacies</a>
                    <a href="pattern-recognition.html" class="hover:text-gold transition-colors py-1 block">◈ Pattern Recognition in Ops</a>
                    <a href="priming-effect.html" class="hover:text-gold transition-colors py-1 block">◈ Cognitive Priming Override</a>
                    <a href="false-memory.html" class="hover:text-gold transition-colors py-1 block">◈ The False Memory Problem</a>
                </div>
            </div>

            <div>
                <h4 class="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-4 font-['Orbitron'] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-gold"></span> Field Manuals</h4>
                <div class="space-y-2.5 flex flex-col text-xs font-mono font-medium text-slate-300">
                    <a href="survival-skills.html" class="hover:text-gold transition-colors py-1 block">◈ 10 Wilderness Survival Skills</a>
                    <a href="first-aid-basics.html" class="hover:text-gold transition-colors py-1 block">◈ First Aid Operational Basics</a>
                    <a href="food-safety.html" class="hover:text-gold transition-colors py-1 block">◈ Food Safety Defenses</a>
                    <a href="cybersecurity-beginners.html" class="hover:text-gold transition-colors py-1 block">◈ Cybersecurity for Beginners</a>
                    <a href="best-brain-games.html" class="hover:text-gold transition-colors py-1 block">◈ Best Diagnostic Brain Games</a>
                    <a href="brain-training-tips.html" class="hover:text-gold transition-colors py-1 block">◈ Brain Training Optimization</a>
                </div>
            </div>

            <div>
                <h4 class="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-4 font-['Orbitron'] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> Active Theaters</h4>
                <div class="flex flex-col space-y-3 mt-2">
                    <a href="https://play.google.com/store/apps/details?id=com.ittybittybites.the2secondwitness" target="_blank" rel="noopener" class="px-5 py-3.5 bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-cyan-400/30 rounded-xl font-bold transition-all flex items-center justify-between text-xs shadow-lg tracking-wider">
                        <span>🚀 ANDROID APP</span> <span>&rarr;</span>
                    </a>
                    <a href="https://ittybittybites.itch.io/2-second-witness" target="_blank" rel="noopener" class="px-5 py-3.5 bg-gold/10 hover:bg-gold hover:text-slate-950 text-gold border border-gold/30 rounded-xl font-bold transition-all flex items-center justify-between text-xs shadow-lg tracking-wider">
                        <span>⚡ WEB SIMULATION</span> <span>&rarr;</span>
                    </a>
                    <p class="text-[11px] text-slate-500 leading-relaxed pt-3">
                        All interactive sandbox mechanics across our portal ingest 100% anonymized behavioral coordinate mapping exactly compliant with GDPR and EU AI Act open-source research parameters.
                    </p>
                </div>
            </div>
        </div>

        <div class="max-w-[1400px] mx-auto text-center text-xs text-slate-500 tracking-widest uppercase flex flex-col sm:flex-row items-center justify-between gap-6 font-mono font-bold">
            <div class="text-slate-400">© 2026 ITTY BITTY BITES // CLASSIFIED COGNITIVE TRAINING DIVISION</div>
            <div class="flex flex-wrap justify-center gap-6 text-slate-400">
                <a href="privacy_policy.html" class="hover:text-cyan-400 transition-colors">Privacy Policy</a>
                <a href="sitemap.xml" class="hover:text-cyan-400 transition-colors">Sitemap XML</a>
                <a href="feed.html" class="hover:text-cyan-400 transition-colors">RSS Database</a>
            </div>
        </div>
    </footer>`;

FILES_TO_UPGRADE.forEach(filename => {
  const filePath = path.join(ROOT, filename);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf-8');

  if (['arcade.html', 'index.html', 'feed.html', 'library.html'].includes(filename)) {
    const freshNav = buildGlobalNav(filename, '');
    content = content.replace(/<!-- GLOBAL UNIFIED TACTICAL NAVIGATION -->[\s\S]*?<\/nav>/i, freshNav);
    content = content.replace(/<nav class="bg-slate-950[^>]*>[\s\S]*?<\/nav>/i, freshNav);
    // Replace old footer with our brand new rich footer
    content = content.replace(/<!-- UNIFIED LEGAL & MISSION FOOTER -->[\s\S]*?<\/footer>/i, GLOBAL_FOOTER);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✓ Master dynamic asset upgraded: ${filename}`);
    return;
  }

  // Standalone articles
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : `${filename.replace('.html', '').toUpperCase()} | The 2-Second Witness`;

  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i);
  const desc = descMatch ? descMatch[1].trim() : "Classified cognitive research and dual-process decision training protocols.";

  let innerBody = '';
  const bodyMatch = content.match(/<div class=["']tactical-panel["'][^>]*>([\s\S]*?)<\/div>\s*<!-- Dynamic/i) || content.match(/<div class=["']tactical-panel["'][^>]*>([\s\S]*?)<\/div>/i) || content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  
  if (bodyMatch) {
    innerBody = bodyMatch[1];
    innerBody = innerBody.replace(/<div class=["']nav-top["']>[\s\S]*?<\/div>/i, '');
    innerBody = innerBody.replace(/<div class=["']container["']>([\s\S]*?)<\/div>\s*<\/body>/i, '$1');
    innerBody = innerBody.replace(/<!-- GLOBAL UNIFIED[^>]*>[\s\S]*?<\/nav>/i, '');
    innerBody = innerBody.replace(/<!-- UNIFIED LEGAL[^>]*>[\s\S]*?<\/footer>/i, '');
    innerBody = innerBody.replace(/<footer[^>]*>[\s\S]*?<\/footer>/i, '');
    innerBody = innerBody.replace(/<nav[^>]*>[\s\S]*?<\/nav>/i, '');
  } else {
    innerBody = "<p>Operational briefing asset currently securely isolated.</p>";
  }

  innerBody = innerBody.replace(/https:\/\/www\.amazon\.com\/dp\/([a-zA-Z0-9]+)\/[^"'\s]*/gi, 'https://www.amazon.com/dp/$1/?tag=ittybittybite-20');

  const upgradedDocument = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <meta name="keywords" content="stroop effect, cognitive bias, system 1 system 2, brain training game, psychological warfare, behavioral economics">
    <link rel="canonical" href="https://ittybittybites.github.io/${filename}">
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
        
        <div class="flex items-center space-x-3 mb-6 font-mono font-bold text-xs">
            <span class="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
            <span class="text-cyan-400 uppercase tracking-widest">RESEARCH & INTELLIGENCE BRIEFING // ITTY BITTY BITES</span>
        </div>

        <div class="tactical-panel flex-1 w-full font-mono space-y-6">
            ${innerBody.trim()}
        </div>

        <!-- Automated Topic Matrix Navigation Hook -->
        <div class="mt-12 pt-8 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono">
            <div class="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-xl">
                <div>
                    <span class="text-[10px] tracking-widest font-black text-gold uppercase block">TACTICAL OPERATIONAL PROTOCOLS</span>
                    <h4 class="text-base font-bold text-white mt-2">Explore 672 Programmatic AI Briefings</h4>
                    <p class="text-xs text-slate-400 mt-2.5 leading-relaxed">Systematic neural override protocols customized for 32 real-world elite operator roles.</p>
                </div>
                <a href="intel/index.html" class="mt-6 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest transition-all self-start shadow-md active:scale-95">
                    Launch Protocol Matrix &rarr;
                </a>
            </div>

            <div class="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-xl">
                <div>
                    <span class="text-[10px] tracking-widest font-black text-emerald-400 uppercase block">INTERACTIVE EVALUATION TERMINAL</span>
                    <h4 class="text-base font-bold text-white mt-2">Cognitive Diagnostic Arcade</h4>
                    <p class="text-xs text-slate-400 mt-2.5 leading-relaxed">Test your reaction buffers, working memory churn, and signal detection filters live in secure sandboxes.</p>
                </div>
                <a href="arcade.html" class="mt-6 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest transition-all self-start shadow-md active:scale-95">
                    Enter Tactical Arcade &rarr;
                </a>
            </div>
        </div>

    </main>

${GLOBAL_FOOTER}

</body>
</html>`;

  fs.writeFileSync(filePath, upgradedDocument, 'utf-8');
  console.log(`  ✓ Standalone briefing fully upgraded: ${filename}`);
});

const TEMPLATE_PATH = path.join(ROOT, 'templates', 'template.html');
if (fs.existsSync(TEMPLATE_PATH)) {
  let tpl = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const freshTplNav = buildGlobalNav('none', '../');
  tpl = tpl.replace(/<nav class="bg-slate-950[^>]*>[\s\S]*?<\/nav>/i, freshTplNav);
  tpl = tpl.replace(/<!-- UNIFIED LEGAL & MISSION FOOTER -->[\s\S]*?<\/footer>/i, GLOBAL_FOOTER.replace(/href="/g, 'href="../'));
  fs.writeFileSync(TEMPLATE_PATH, tpl, 'utf-8');
  console.log(`  ✓ Master ssg template updated: templates/template.html`);
}

console.log("\n  🚀 Top Nav & Research Footer fully synchronized!");
