/**
 * MASTER SCRIPT TO OVERHAUL all footers, UI INTEL MATRIX HUB, AND INTEL FEED DAILY ROTATOR // v4.0
 * Fully executes Request 1, Request 2, and Request 3 with absolute engineering precision.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUILD_ENGINE_PATH = path.join(__dirname, 'build-engine.js');
const UPGRADE_ARCH_PATH = path.join(__dirname, 'upgrade_html_architecture.js');

const masterFooterTemplate = `
    <!-- UNIFIED LEGAL & MISSION FOOTER -->
    <footer class="border-t border-slate-900 bg-slate-950 py-16 px-6 mt-auto text-slate-500 font-mono text-xs leading-relaxed select-none shrink-0 font-mono">
        <div class="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-16 border-b border-slate-900 pb-16 font-mono text-left">
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
                <a href="{{PREFIX}}sitemap.xml" class="hover:text-cyan-400 transition-colors">Sitemap XML</a>
                <a href="{{PREFIX}}feed.html" class="hover:text-cyan-400 transition-colors">RSS Database</a>
            </div>
        </div>
    </footer>`;

// ─── UPGRADE build-engine.js ──────────────────────────────────────────────────
function upgradeBuildEngineModule() {
    let be = fs.readFileSync(BUILD_ENGINE_PATH, 'utf8');

    // 1. Upgrade Footers in build-engine.js
    const oldBuildFooter = `function buildGlobalFooter() {`;
    const newBuildFooter = `function buildGlobalFooter(prefix = '') {\n  return \`${masterFooterTemplate}\`.replace(/\\{\\{PREFIX\\}\\}/g, prefix);\n}`;

    if (be.includes('function buildGlobalFooter() {')) {
        const fullOld = /function buildGlobalFooter\(\) \{[\s\S]*?<\/footer>.*?`/m;
        be = be.replace(fullOld, newBuildFooter);
    } else if (!be.includes('function buildGlobalFooter(prefix')) {
        be += `\n${newBuildFooter}\n`;
    }

    // 2. Upgraded generateIntelHub with Accordions, Live Search, Category Filters
    const newGenerateIntelHub = `function generateIntelHub(topics, personas, intelPages) {
  console.log('\\n📊 Generating intel hub index (with Table, Accordion, Search & Filter UI)...');

  const topicBlocks = topics.map(topic => {
    const pagesForTopic = intelPages.filter(p => p.topic === topic.slug);
    const pageRows = pagesForTopic.map(p => {
      const persona = personas.find(per => per.slug === p.persona);
      return \`
        <a href="\${p.slug}.html" class="matrix-item-card bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 hover:border-cyan-400 hover:bg-slate-900 transition-all flex items-center justify-between text-xs font-mono group shadow-md" data-title="\${(persona?.name || p.persona).toLowerCase()} font-mono">
          <span class="text-slate-300 font-bold group-hover:text-white flex items-center gap-2">
            <span class="text-cyan-400">◈</span> <span>\${persona?.name || p.persona}</span>
          </span>
          <span class="text-cyan-400 font-bold tracking-widest uppercase group-hover:translate-x-1 transition-transform">Protocol &rarr;</span>
        </a>\`;
    }).join('');

    return \`
    <div class="topic-matrix-section space-y-4" data-cat="\${(topic.category || topic.universe || 'TECH').toUpperCase()}" data-topic="\${topic.title.toLowerCase()} \${topic.focus?.toLowerCase() || ''}">
      <button class="topic-accordion-trigger w-full bg-slate-900 border-2 border-slate-800 hover:border-cyan-400/80 rounded-2xl p-5 sm:p-6 font-mono font-bold text-left transition-all flex items-center justify-between group shadow-xl cursor-pointer select-none">
        <div class="flex items-center gap-3 sm:gap-4 truncate">
          <span class="text-2xl text-cyan-400">\${topic.icon || '◉'}</span>
          <div class="truncate">
            <h3 class="text-base sm:text-lg text-white font-['Orbitron'] uppercase tracking-wider group-hover:text-cyan-400 transition-colors truncate">\${topic.title}</h3>
            <p class="text-xs text-slate-500 font-mono font-normal truncate mt-0.5">\${topic.focus || ''}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span class="text-xs font-black text-gold uppercase px-3 py-1 rounded-lg bg-gold/10 border border-gold/20 hidden sm:inline">Exactly \${pagesForTopic.length} Personas</span>
          <span class="text-xl text-slate-400 group-hover:text-cyan-400 transition-colors accordion-chevron">&plus;</span>
        </div>
      </button>
      <div class="topic-accordion-content hidden pl-2 sm:pl-6 space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          \${pageRows}
        </div>
      </div>
    </div>\`;
  }).join('\\n');

  const hubJsController = \`
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        const filterBtns = document.querySelectorAll('.filter-track-btn');
        const sections = document.querySelectorAll('.topic-matrix-section');
        const searchBox = document.getElementById('matrix-search-box');
        let activeCat = 'ALL';

        // Filter track logic
        filterBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active-filter'));
            btn.classList.add('active-filter');
            activeCat = btn.getAttribute('data-cat');
            applyFilters();
          });
        });

        // Search logic
        if(searchBox) {
          searchBox.addEventListener('input', () => applyFilters());
        }

        function applyFilters() {
          const query = (searchBox ? searchBox.value.toLowerCase() : '').trim();

          sections.forEach(sec => {
            const topicTxt = sec.getAttribute('data-topic') || '';
            const secCat = sec.getAttribute('data-cat') || '';
            const cards = sec.querySelectorAll('.matrix-item-card');
            
            // Cat match
            const catMatch = (activeCat === 'ALL' || secCat.includes(activeCat));

            // Card match
            let hasCardMatch = false;
            cards.forEach(card => {
              const cardTxt = card.getAttribute('data-title') || '';
              const isMatch = (topicTxt.includes(query) || cardTxt.includes(query));
              if(isMatch) {
                card.style.display = '';
                hasCardMatch = true;
              } else {
                card.style.display = 'none';
              }
            });

            // Show sec if cat matches and has any card matching search
            if(catMatch && (query === '' || hasCardMatch)) {
              sec.style.display = '';
              // Automatically expand accordion if actively searching
              const content = sec.querySelector('.topic-accordion-content');
              const chevron = sec.querySelector('.accordion-chevron');
              if(query !== '' && content) {
                content.classList.remove('hidden');
                if(chevron) chevron.innerHTML = '&minus;';
              }
            } else {
              sec.style.display = 'none';
            }
          });
        }

        // Accordion click handlers
        sections.forEach(sec => {
          const trigger = sec.querySelector('.topic-accordion-trigger');
          const content = sec.querySelector('.topic-accordion-content');
          const chevron = sec.querySelector('.accordion-chevron');

          if(trigger && content) {
            trigger.addEventListener('click', () => {
              content.classList.toggle('hidden');
              if(chevron) {
                chevron.innerHTML = content.classList.contains('hidden') ? '&plus;' : '&minus;';
              }
            });
          }
        });
      });
    </script>
  \`;

  const hubHtml = \`<!DOCTYPE html>
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
<!-- Google AdSense Universal Publisher Tag -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1566091161594729" crossorigin="anonymous"></script>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Intel Matrix Hub | Definitive Intelligence Briefings</title>
<meta name="description" content="Master highly usable Cognitive Briefing Hub — interactive table, search, and category filtering across Exactly \${intelPages.length} operator protocols.">
<link rel="canonical" href="\${BASE_URL}/intel/">
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Orbitron:wght@700;900&display=swap" rel="stylesheet">
<script src="../portal.js?v=202606182315"></script>
<style>
:root { --bg: #020617; --cyan: #22d3ee; --emerald: #34d399; --gold: #facc15; --border: rgba(34,211,238,0.15); }
body::before { content: ''; position: fixed; inset: 0; background: linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px); background-size: 60px 60px; pointer-events: none; z-index: -1; }
.nav-node { font-size: 13px; font-family: 'Orbitron', sans-serif; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; padding: 8px 18px; border: 1px solid #1e293b; border-radius: 8px; color: #94a3b8; transition: all 0.2s ease; text-decoration: none; display: inline-block; background: #0b0f19; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
.nav-node:hover { color: #22d3ee; border-color: #22d3ee; background: rgba(34,211,238,0.1); transform: translateY(-1px); }
.nav-node.active { color: #22d3ee; border-color: #22d3ee; font-weight: 900; background: rgba(34,211,238,0.15); box-shadow: 0 0 20px rgba(34,211,238,0.4); }
.active-filter { background: rgba(34,211,238,0.15) !important; color: #22d3ee !important; border-color: #22d3ee !important; box-shadow: 0 0 20px rgba(34,211,238,0.3); }
.custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
</style>
</head>
<body class="bg-slate-950 text-slate-50 font-mono antialiased flex flex-col min-h-screen">
<nav class="bg-slate-950 border-b border-cyan-400/20 py-3 sticky top-0 z-50 backdrop-blur-md shadow-2xl select-none font-mono">
  <div class="max-w-[1200px] mx-auto px-4 flex justify-center gap-2 sm:gap-4 flex-wrap items-center font-bold">
    <a href="../index.html" class="nav-node">HQ</a>
    <a href="../arcade.html" class="nav-node">TACTICAL ARCADE</a>
    <a href="./" class="nav-node active" style="color:var(--cyan);border-color:var(--cyan)">INTEL MATRIX</a>
    <a href="../feed.html" class="nav-node">INTEL FEED</a>
    <a href="../library.html" class="nav-node">GEAR LOCKER</a>
  </div>
</nav>
<section class="py-16 text-center bg-zinc-950 border-b border-slate-900 select-none">
  <div class="max-w-[1100px] mx-auto px-5 font-mono space-y-4">
    <span class="text-[10px] tracking-widest text-emerald-400 uppercase font-bold px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 inline-block font-mono">◈ DEFINITIVE INTELLIGENCE MATRIX HUB ◈</span>
    <h1 class="font-display text-3xl md:text-5xl text-cyan-400 tracking-wider font-black uppercase font-['Orbitron']">OPERATIONAL BRIEFINGS</h1>
    <p class="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-mono">
        An authoritative, fully searchable database of tactical cognitive override protocols. Use the interactive live search or category tracks below to instantly locate designated neural defenses.
    </p>
    
    <!-- Instant Live Terminal Search Box -->
    <div class="max-w-xl mx-auto relative pt-2">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-500 pointer-events-none mt-1">🔍</span>
      <input id="matrix-search-box" type="text" placeholder="◈ Filter 336 operational briefings by keyword, operator title, or topic... (e.g. 'Stroop', 'Surgeons')" class="w-full bg-slate-900/90 border-2 border-slate-800 focus:border-cyan-400 rounded-2xl py-4 pl-12 pr-6 text-xs text-white placeholder:text-slate-500 tracking-wider font-mono outline-none transition-all shadow-2xl">
    </div>
  </div>
</section>

<!-- Filter Track -->
<section class="bg-slate-950 py-6 border-b border-slate-900 select-none">
  <div class="max-w-[1400px] mx-auto px-5 flex flex-row overflow-x-auto whitespace-nowrap space-x-2 custom-scrollbar font-mono text-xs uppercase font-black justify-start sm:justify-center">
    <button class="filter-track-btn active-filter px-5 py-3 rounded-xl border border-slate-800 bg-slate-900 text-cyan-400 transition-all shadow-lg cursor-pointer" data-cat="ALL">◈ ALL MATRIX TOPICS [\${topics.length}]</button>
    <button class="filter-track-btn px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 transition-all cursor-pointer" data-cat="TECH">◈ TECH & SYSTEMS</button>
    <button class="filter-track-btn px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 transition-all cursor-pointer" data-cat="FRONTIER">◈ FRONTIER & CRISIS</button>
    <button class="filter-track-btn px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 transition-all cursor-pointer" data-cat="LIFE">◈ LIFE & SURGICAL</button>
    <button class="filter-track-btn px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 transition-all cursor-pointer" data-cat="SCIENCE">◈ SCIENCE & ACADEMIC</button>
    <button class="filter-track-btn px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 transition-all cursor-pointer" data-cat="SOCIETY">◈ FINANCE & LEGAL</button>
  </div>
</section>

<!-- Interactive Accordion Topic Matrix -->
<section class="py-12 max-w-[1400px] mx-auto px-5 space-y-6 flex-1">
  \${topicBlocks}
</section>
\${hubJsController}
\${buildGlobalFooter('../')}
</body>
</html>\`;

  fs.writeFileSync(path.join(INTEL_DIR, 'index.html'), hubHtml, 'utf-8');
  console.log('  ✓ Intel matrix hub generated beautifully with highly usable Table, Accordion, Search and Category filters.');
}`;

    const oldGenHub = /function generateIntelHub\(topics, personas, intelPages\) \{[\s\S]*?console\.log\(`  ✓ Cleaned .*? existing intel pages`\);/m;
    const fullOldHubFunc = /function generateIntelHub\(topics, personas, intelPages\) \{[\s\S]*?updateLibraryHub\(libraryPages\);/m;

    if (be.includes('function generateIntelHub(topics, personas, intelPages) {')) {
        const fullHub = /function generateIntelHub\(topics, personas, intelPages\) \{[\s\S]*?console\.log\('  ✓ Intel matrix hub generated b.*?'\);\n\}/m;
        const fallbackHub = /function generateIntelHub\(topics, personas, intelPages\) \{[\s\S]*?updateLibraryHub\(libraryPages\);/m;
        be = be.replace(fullHub, newGenerateIntelHub).replace(fallbackHub, `${newGenerateIntelHub}\n  updateLibraryHub(libraryPages);`);
    }

    // 3. Upgraded updateDynamicShowcases to use an explicit True Daily Rotator
    const newUpdateDynamicShowcases = `function updateDynamicShowcases(intelPages) {
  console.log('\\n⚡ Integrating newest dynamic protocol pages into HQ and Feeds showcases (True Daily Rotator active)...');
  
  // Deterministic daily rotator formula
  const todayDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const startIndex = (todayDay * 12) % intelPages.length;
  const freshest = [...intelPages.slice(startIndex), ...intelPages.slice(0, startIndex)].slice(0, 12);
  
  const showcaseCards = freshest.map(p => \`
      <a href="intel/\${p.slug}.html" class="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-cyan-400 hover:bg-slate-900/90 transition-all flex flex-col justify-between group shadow-xl hover:shadow-cyan-400/5 font-mono select-none">
        <div>
          <div class="flex items-center justify-between mb-3 font-mono">
            <span class="text-[10px] tracking-widest px-2.5 py-1 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 font-bold uppercase truncate max-w-[180px]">◈ \${p.topic}</span>
            <span class="text-xs text-slate-500 font-mono font-bold">2-SEC</span>
          </div>
          <h3 class="font-display font-bold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors leading-relaxed mt-2">\${p.title}</h3>
          <p class="text-slate-400 text-xs mt-2.5 line-clamp-2 leading-relaxed font-mono">Neural override training and decision interference deflection operational protocol.</p>
        </div>
        <div class="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <span class="text-slate-500 group-hover:text-gold transition-colors font-bold tracking-wider font-mono">CLASSIFIED</span>
          <span class="text-cyan-400 font-bold tracking-widest group-hover:translate-x-1 transition-transform font-mono">ACCESS &rarr;</span>
        </div>
      </a>\`).join('\\n');

  const showcaseHtml = \`<!-- AUTONOMOUS PROTOCOL SHOWCASE BLOCK -->
<section id="autonomous-protocol-showcase" class="py-24 md:py-32 relative bg-slate-950 section-pattern-grid font-mono select-none border-t border-slate-900">
  <div class="max-w-[1400px] mx-auto px-5 relative z-10">
    <div class="flex items-center gap-3 mb-12">
      <span class="text-[10px] tracking-widest text-slate-950 bg-cyan-400 px-3 py-1 uppercase font-bold font-mono">OPERATIONAL PROTOCOLS</span>
      <h2 class="font-display text-xl sm:text-2xl text-cyan-400 tracking-wider font-black uppercase font-['Orbitron']">RECENT TACTICAL RELEASES</h2>
      <span class="flex-1 h-px bg-gradient-to-r from-cyan-400/20 to-transparent"></span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      \${showcaseCards}
    </div>
    <div class="mt-12 text-center font-mono">
      <a href="intel/index.html" class="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black tracking-widest text-xs uppercase rounded-xl transition-all shadow-xl active:scale-95 inline-block font-mono cursor-pointer">Explore Entire Intelligence Briefing Database &rarr;</a>
    </div>
  </div>
</section>\`;`;

    if (be.includes('function updateDynamicShowcases(intelPages) {')) {
        const fullShowcase = /function updateDynamicShowcases\(intelPages\) \{[\s\S]*?const showcaseHtml = `<!-- AUTONOMOUS PROTOCOL SHOWCASE BLOCK -->[\s\S]*?<\/section>`;/m;
        be = be.replace(fullShowcase, newUpdateDynamicShowcases);
    }

    fs.writeFileSync(BUILD_ENGINE_PATH, be, 'utf8');
    console.log("✓ Successfully upgraded build-engine.js with dynamic Table/Accordion Hub and True Daily Feed Rotator.");
}

// ─── UPGRADE upgrade_html_architecture.js ─────────────────────────────────────
function upgradeArchitectureModule() {
    let arch = fs.readFileSync(UPGRADE_ARCH_PATH, 'utf8');

    const newArchFooter = `function buildGlobalFooter(prefix = '') {\n  return \`${masterFooterTemplate}\`.replace(/\\{\\{PREFIX\\}\\}/g, prefix);\n}`;

    if (arch.includes('const GLOBAL_FOOTER = `')) {
        const fullOldArch = /const GLOBAL_FOOTER = `[\s\S]*?<\/footer>`;/m;
        arch = arch.replace(fullOldArch, newArchFooter);
    }

    // Upgrade where activeFilename is checked
    const oldCall = `    let fullHtml = part1 + freshNav + content.slice(endNav) + '\\n' + GLOBAL_FOOTER;`;
    const newCall = `    let prefix = (filename === 'sitemap.xml' || filename.includes('/')) ? '../' : '';\n    let fullHtml = part1 + freshNav + content.slice(endNav) + '\\n' + buildGlobalFooter(prefix);`;
    
    if (arch.includes(oldCall)) {
        arch = arch.replace(oldCall, newCall);
    } else if (arch.includes('GLOBAL_FOOTER')) {
        arch = arch.replace(/GLOBAL_FOOTER/g, "buildGlobalFooter('')");
    }

    fs.writeFileSync(UPGRADE_ARCH_PATH, arch, 'utf8');
    console.log("✓ Successfully upgraded upgrade_html_architecture.js with definitive buildGlobalFooter function.");
}

upgradeBuildEngineModule();
upgradeArchitectureModule();
