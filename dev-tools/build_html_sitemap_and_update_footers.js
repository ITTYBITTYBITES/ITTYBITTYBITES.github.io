/**
 * SCRIPT TO BUILD A DEFINITIVE HTML SITEMAP (sitemap.html) AND UPDATE GLOBAL FOOTERS // v1.0
 * Executes absolute Technical SEO compliance by providing an authentic 1-click horizontal crawl path.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUILD_ENGINE_PATH = path.join(__dirname, 'build-engine.js');
const UPGRADE_ARCH_PATH = path.join(__dirname, 'upgrade_html_architecture.js');

// Standard Footer Template with Sitemap HTML added
const masterFooterTemplate = `
    <!-- UNIFIED LEGAL & MISSION FOOTER -->
    <footer class="border-t border-slate-900 bg-slate-950 py-16 px-6 mt-auto text-slate-500 font-mono text-xs leading-relaxed select-none shrink-0">
        <div class="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-16 border-b border-slate-900 pb-16 text-left">
            <div>
                <h4 class="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-4 font-['Orbitron'] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> Tactical Briefings</h4>
                <div class="space-y-2.5 flex flex-col text-xs font-mono font-medium text-slate-300 font-mono">
                    <a href="{{PREFIX}}stroop-effect.html" class="hover:text-gold transition-colors py-1 block">◈ The Stroop Effect</a>
                    <a href="{{PREFIX}}cognitive-biases.html" class="hover:text-gold transition-colors py-1 block">◈ 25 Cognitive Biases</a>
                    <a href="{{PREFIX}}decision-making.html" class="hover:text-gold transition-colors py-1 block">◈ System 1 vs System 2</a>
                    <a href="{{PREFIX}}rapid-thinking.html" class="hover:text-gold transition-colors py-1 block">◈ Rapid Thinking Protocols</a>
                    <a href="{{PREFIX}}dunning-kruger.html" class="hover:text-gold transition-colors py-1 block">◈ Dunning-Kruger Analysis</a>
                    <a href="{{PREFIX}}flow-state.html" class="hover:text-gold transition-colors py-1 block">◈ Flow State Triggers</a>
                </div>
            </div>

            <div>
                <h4 class="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-4 font-['Orbitron'] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Research Hub</h4>
                <div class="space-y-2.5 flex flex-col text-xs font-mono font-medium text-slate-300 font-mono">
                    <a href="{{PREFIX}}social-engineering.html" class="hover:text-gold transition-colors py-1 block">◈ 10 Social Engineering Defenses</a>
                    <a href="{{PREFIX}}how-doctors-think.html" class="hover:text-gold transition-colors py-1 block">◈ How Doctors Think (Pattern Rec)</a>
                    <a href="{{PREFIX}}logical-fallacies.html" class="hover:text-gold transition-colors py-1 block">◈ 15 Logical Fallacies</a>
                    <a href="{{PREFIX}}pattern-recognition.html" class="hover:text-gold transition-colors py-1 block">◈ Pattern Recognition in Ops</a>
                    <a href="{{PREFIX}}priming-effect.html" class="hover:text-gold transition-colors py-1 block">◈ Cognitive Priming Override</a>
                    <a href="{{PREFIX}}false-memory.html" class="hover:text-gold transition-colors py-1 block">◈ The False Memory Problem</a>
                </div>
            </div>

            <div>
                <h4 class="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-4 font-['Orbitron'] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-gold"></span> Field Manuals</h4>
                <div class="space-y-2.5 flex flex-col text-xs font-mono font-medium text-slate-300 font-mono">
                    <a href="{{PREFIX}}survival-skills.html" class="hover:text-gold transition-colors py-1 block">◈ 10 Wilderness Survival Skills</a>
                    <a href="{{PREFIX}}first-aid-basics.html" class="hover:text-gold transition-colors py-1 block">◈ First Aid Operational Basics</a>
                    <a href="{{PREFIX}}food-safety.html" class="hover:text-gold transition-colors py-1 block">◈ Food Safety Defenses</a>
                    <a href="{{PREFIX}}cybersecurity-beginners.html" class="hover:text-gold transition-colors py-1 block">◈ Cybersecurity for Beginners</a>
                    <a href="{{PREFIX}}best-brain-games.html" class="hover:text-gold transition-colors py-1 block">◈ Best Diagnostic Brain Games</a>
                    <a href="{{PREFIX}}brain-training-tips.html" class="hover:text-gold transition-colors py-1 block">◈ Brain Training Optimization</a>
                </div>
            </div>

            <div>
                <h4 class="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-4 font-['Orbitron'] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> Active Theaters</h4>
                <div class="flex flex-col space-y-3 mt-2 font-mono font-bold">
                    <a href="https://play.google.com/store/apps/details?id=com.ittybittybites.the2secondwitness" target="_blank" rel="noopener" class="px-5 py-3.5 bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-cyan-400/30 rounded-xl font-bold transition-all flex items-center justify-between text-xs shadow-lg tracking-wider font-mono cursor-pointer">
                        <span>🚀 ANDROID APP</span> <span>&rarr;</span>
                    </a>
                    <a href="https://ittybittybites.itch.io/2-second-witness" target="_blank" rel="noopener" class="px-5 py-3.5 bg-gold/10 hover:bg-gold hover:text-slate-950 text-gold border border-gold/30 rounded-xl font-bold transition-all flex items-center justify-between text-xs shadow-lg tracking-wider font-mono cursor-pointer">
                        <span>⚡ WEB SIMULATION</span> <span>&rarr;</span>
                    </a>
                    <p class="text-[11px] text-slate-500 leading-relaxed pt-3 font-mono font-normal">
                        All interactive sandbox execution mechanics across our portal operate entirely locally within your secure client sandbox. Zero background telemetry or path tracking data is collected.
                    </p>
                </div>
            </div>
        </div>

        <div class="max-w-[1400px] mx-auto text-center text-xs text-slate-500 tracking-widest uppercase flex flex-col sm:flex-row items-center justify-between gap-6 font-mono font-bold">
            <div class="text-slate-400">© 2026 ITTY BITTY BITES // CLASSIFIED COGNITIVE TRAINING DIVISION</div>
            <div class="flex flex-wrap justify-center gap-6 text-slate-400 font-mono">
                <a href="{{PREFIX}}privacy_policy.html" class="hover:text-cyan-400 transition-colors">Privacy Policy</a>
                <a href="{{PREFIX}}terms_of_service.html" class="hover:text-cyan-400 transition-colors">Terms of Service</a>
                <a href="{{PREFIX}}about.html" class="hover:text-cyan-400 transition-colors">About Us</a>
                <a href="{{PREFIX}}contact.html" class="hover:text-cyan-400 transition-colors">Contact Us</a>
                <a href="{{PREFIX}}sitemap.html" class="hover:text-cyan-400 transition-colors text-cyan-300">Sitemap HTML</a>
                <a href="{{PREFIX}}sitemap.xml" class="hover:text-cyan-400 transition-colors">Sitemap XML</a>
                <a href="{{PREFIX}}feed.html" class="hover:text-cyan-400 transition-colors">RSS Database</a>
            </div>
        </div>
    </footer>`;

// ─── UPGRADE build-engine.js ──────────────────────────────────────────────────
let be = fs.readFileSync(BUILD_ENGINE_PATH, 'utf8');

// 1. Upgrade makeGlobalFooter template in build-engine.js
const fullMakeFooter = /function makeGlobalFooter\(prefix = ''\) \{[\s\S]*?\n\}/m;
const newMakeFooterFunc = `function makeGlobalFooter(prefix = '') {\n  return \`${masterFooterTemplate}\`.replace(/\\{\\{PREFIX\\}\\}/g, prefix);\n}`;

if (be.match(fullMakeFooter)) {
    be = be.replace(fullMakeFooter, newMakeFooterFunc);
}

// 2. Add generateHtmlSitemap function to build-engine.js
const htmlSitemapCode = `// ─── Step 10: Build Standalone HTML Sitemap (sitemap.html) ───────────────────
function generateHtmlSitemap(libraryPages, intelPages) {
  console.log('\\n🗺️ Building definitive HTML sitemap (sitemap.html)...');

  const topics = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf8')).topics;
  const personas = JSON.parse(fs.readFileSync(PERSONAS_PATH, 'utf8')).personas;

  // 1. Core Standalone Articles & Portals
  const coreLinks = [
    { loc: 'index.html', title: 'Operational Command Headquarters (HQ)' },
    { loc: 'arcade.html', title: 'Tactical Game Arcade // 18 WebGL Sandboxes' },
    { loc: 'intel/index.html', title: 'Definitive Intelligence Matrix Hub' },
    { loc: 'feed.html', title: 'Recent Tactical Releases // True Daily Rotator' },
    { loc: 'library.html', title: 'Gear Locker // Vetted Field Manual Curation' },
    { loc: 'stroop-effect.html', title: 'The Stroop Effect Cognitive Analysis' },
    { loc: 'cognitive-biases.html', title: '25 Cognitive Biases for Tactical Operators' },
    { loc: 'decision-making.html', title: 'System 1 vs System 2 Executive Mitigation' },
    { loc: 'social-engineering.html', title: '10 High-Stakes Social Engineering Defenses' },
    { loc: 'flow-state.html', title: 'Flow State & Neurological Focus Triggers' },
    { loc: 'behavioral-economics.html', title: 'Behavioral Economics for Elite Engineering' },
    { loc: 'rapid-thinking.html', title: 'Rapid Thinking Protocols & Reflex Overrides' },
    { loc: 'dunning-kruger.html', title: 'Dunning-Kruger Calibration in High-Risk Ops' },
    { loc: 'false-memory.html', title: 'The False Memory Problem & Narrative Defenses' },
    { loc: 'survival-skills.html', title: '10 Highly Performant Wilderness Survival Skills' },
    { loc: 'first-aid-basics.html', title: 'First Aid Field Operational Action Manual' },
    { loc: 'food-safety.html', title: 'Food Safety Defenses for Remote Deployments' },
    { loc: 'cybersecurity-beginners.html', title: 'Cybersecurity for Beginners // Baseline Ops' },
    { loc: 'best-brain-games.html', title: 'Best Diagnostic Brain Games & Metric Testers' },
    { loc: 'brain-training-tips.html', title: 'Brain Training Optimization Protocol Guide' },
    { loc: 'about.html', title: 'About Central Operational Command // Taskforce' },
    { loc: 'contact.html', title: 'Secure Base Support Contact Terminal' },
    { loc: 'terms_of_service.html', title: 'Authoritative Terms of Service // Legal Framework' },
    { loc: 'privacy_policy.html', title: 'Authoritative Privacy Policy // Telemetry Insulation' }
  ].map(item => \`<a href="./\${item.loc}" class="block p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-400 rounded-xl text-xs text-slate-300 hover:text-white transition-all font-mono shadow-md truncate">◈ \${item.title}</a>\`).join('\\n          ');

  // 2. Gear Locker Resource Linkages
  const libLinks = libraryPages.map(item => \`<a href="./library/\${item.slug}.html" class="block p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-400 rounded-xl text-xs text-slate-300 hover:text-white transition-all font-mono shadow-md truncate">◈ \${item.title}</a>\`).join('\\n          ');

  // 3. Complete Protocol Matrix Briefings (Neatly categorized by Topic)
  const intelLinksByTopic = topics.map(topic => {
    const briefings = intelPages.filter(p => p.topic === topic.slug);
    const rows = briefings.map(p => {
      const per = personas.find(pr => pr.slug === p.persona);
      return \`<a href="./intel/\${p.slug}.html" class="block py-1 text-slate-400 hover:text-cyan-400 text-xs transition-colors truncate font-mono">→ Standard Setup for \${per?.name || p.persona}</a>\`;
    }).join('');
    
    return \`
      <div class="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-2">
        <h4 class="text-sm font-bold text-cyan-300 font-['Orbitron'] uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">\${topic.icon || '◉'} \${topic.title}</h4>
        <div class="space-y-0.5 pl-2">\${rows}</div>
      </div>\`;
  }).join('\\n          ');

  const sitemapHtmlContent = \`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-6P6NPFW4FZ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-6P6NPFW4FZ');
</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1566091161594729" crossorigin="anonymous"></script>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Definitive HTML Sitemap | Complete Repository Crawl Index</title>
<meta name="description" content="Authoritative 1-click HTML Sitemap index mapping exactly \${allUrls.length || 420} web assets, gaming sandboxes, and structural operational briefings.">
<link rel="canonical" href="\${BASE_URL}/sitemap.html">
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Orbitron:wght@700;900&display=swap" rel="stylesheet">
<script src="./portal.js?v=202606182340"></script>
<style>
:root { --bg: #020617; --cyan: #22d3ee; --emerald: #34d399; --gold: #facc15; --border: rgba(34,211,238,0.15); }
body::before { content: ''; position: fixed; inset: 0; background: linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px); background-size: 60px 60px; pointer-events: none; z-index: -1; }
.nav-node { font-size: 13px; font-family: 'Orbitron', sans-serif; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; padding: 8px 18px; border: 1px solid #1e293b; border-radius: 8px; color: #94a3b8; transition: all 0.2s ease; text-decoration: none; display: inline-block; background: #0b0f19; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
.nav-node:hover { color: #22d3ee; border-color: #22d3ee; background: rgba(34,211,238,0.1); transform: translateY(-1px); }
.nav-node.active { color: #22d3ee; border-color: #22d3ee; font-weight: 900; background: rgba(34,211,238,0.15); box-shadow: 0 0 20px rgba(34,211,238,0.4); }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
</style>
</head>
<body class="bg-slate-950 text-slate-50 font-mono antialiased flex flex-col min-h-screen relative">
<nav class="bg-slate-950 border-b border-cyan-400/20 py-3 sticky top-0 z-50 backdrop-blur-md shadow-2xl select-none font-mono">
  <div class="max-w-[1200px] mx-auto px-4 flex justify-center gap-2 sm:gap-4 flex-wrap items-center font-bold">
    <a href="./index.html" class="nav-node">HQ</a>
    <a href="./arcade.html" class="nav-node">TACTICAL ARCADE</a>
    <a href="./intel/index.html" class="nav-node">INTEL MATRIX</a>
    <a href="./feed.html" class="nav-node">INTEL FEED</a>
    <a href="./library.html" class="nav-node">GEAR LOCKER</a>
  </div>
</nav>

<section class="py-16 text-center bg-zinc-950 border-b border-slate-900 select-none shrink-0">
  <div class="max-w-[1100px] mx-auto px-5 font-mono space-y-4">
    <span class="text-[10px] tracking-widest text-cyan-400 uppercase font-bold px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 inline-block font-mono">◈ SEARCH ENGINE OPTIMIZATION CRAWL INDEX ◈</span>
    <h1 class="font-display text-3xl md:text-5xl text-white tracking-wider font-black uppercase font-['Orbitron']">DEFINITIVE <span class="text-cyan-400">HTML SITEMAP</span></h1>
    <p class="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-mono">
        An absolute 1-click horizontal crawl path mapping Exactly \${intelPages.length + libraryPages.length + 24 || 420} authoritative operational briefings, web assets, and WebGL game sandboxes.
    </p>
  </div>
</section>

<!-- Highly Structured 3-Column Sitemap Grid -->
<section class="py-16 max-w-[1600px] mx-auto px-5 grid grid-cols-1 lg:grid-cols-3 gap-10 flex-1 text-left font-mono">
  
  <!-- COL 1: Master Portals & Core Operational Articles -->
  <div class="space-y-4">
    <h3 class="text-base font-bold text-white uppercase font-['Orbitron'] tracking-wider flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span> Master Portals & Articles
    </h3>
    <div class="space-y-2">\${coreLinks}</div>
  </div>

  <!-- COL 2: Gear Locker Vetted Book Briefings -->
  <div class="space-y-4">
    <h3 class="text-base font-bold text-white uppercase font-['Orbitron'] tracking-wider flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Gear Locker Resources // Library
    </h3>
    <div class="space-y-2">\${libLinks}</div>
  </div>

  <!-- COL 3: Complete Protocol Matrix Hub Briefings -->
  <div class="space-y-4">
    <h3 class="text-base font-bold text-white uppercase font-['Orbitron'] tracking-wider flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <span class="w-2.5 h-2.5 rounded-full bg-gold"></span> Dynamic Protocol Matrix Database
    </h3>
    <div class="space-y-4">\${intelLinksByTopic}</div>
  </div>

</section>

\${makeGlobalFooter('')}
</body>
</html>\`

  fs.writeFileSync(path.join(ROOT, 'sitemap.html'), sitemapHtmlContent, 'utf-8');
  console.log('  ✓ Standalone sitemap.html built beautifully with 1-click horizontal crawl path.');
}`;

if (!be.includes('function generateHtmlSitemap(')) {
    const xmlTarget = `function updateSitemap(libraryPages, intelPages) {`;
    be = be.replace(xmlTarget, `${htmlSitemapCode}\n\n${xmlTarget}`);
}

// Ensure generateHtmlSitemap is called inside main()
const callHook = `updateSitemap(libraryPages, intelPages);`;
if (!be.includes('generateHtmlSitemap(libraryPages, intelPages);')) {
    be = be.replace(callHook, `generateHtmlSitemap(libraryPages, intelPages);\n    ${callHook}`);
    console.log("✓ Linked generateHtmlSitemap inside main() in build-engine.js");
}

fs.writeFileSync(BUILD_ENGINE_PATH, be, 'utf8');

// ─── UPGRADE upgrade_html_architecture.js ─────────────────────────────────────
let up = fs.readFileSync(UPGRADE_ARCH_PATH, 'utf8');
const oldUpFooter = /function buildGlobalFooter\(prefix = ''\) \{[\s\S]*?\n\}/m;
if (up.match(oldUpFooter)) {
    up = up.replace(oldUpFooter, newMakeFooterFunc.replace('makeGlobalFooter', 'buildGlobalFooter'));
    fs.writeFileSync(UPGRADE_ARCH_PATH, up, 'utf8');
    console.log("✓ Upgraded Footer in upgrade_html_architecture.js");
}
