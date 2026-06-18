/**
 * MASTER ARCADE PORTAL ENGINE, CASCADE AD WATERFALL & CLIENT-SIDE ROUTER // v3.0
 * Pure Phase 1-5 specification implementation with complete legal hardening and AI telemetry guard.
 */

document.addEventListener('DOMContentLoaded', () => {
    window.ArcadePortal = new ArcadePortalEngine();
});

class ArcadePortalEngine {
    constructor() {
        this.gamesRegistry = [];
        this.activeCategory = 'ALL';
        this.activeGame = null;

        // Commercial Adsterra Mediation States
        this.globalAdCooldownMs = 180000; // 3 Minutes strict Commercial Ad Standard
        this.lastAdExecutedTime = 0;
        this.activeGameWindow = null;
        
        // Master Adsterra Smartlink Gateway with Anti-Adblock Encrypted Proxy
        this.adsterraSmartlinkUrl = "https://undergocutlery.com/q9gfrv2v8?key=2cd3374e4c6ba143d74108a029fb0dd5"; // Formatted for Popunder Smartlink_1 (ID 3317235)

        this.initDOMAnchors();
        this.bindEvents();
        this.loadMasterRegistry();
    }

    initDOMAnchors() {
        this.browseHub = document.getElementById('browse-hub-container');
        this.complexGrid = document.getElementById('complex-games-grid');
        this.retroGrid = document.getElementById('retro-classics-grid');
        this.gridTheater = document.getElementById('browse-grid-theater'); // Fallback
        this.gameTheater = document.getElementById('game-theater');
        this.gameIframe = document.getElementById('secure-game-frame');
        this.gameTitleEl = document.getElementById('active-game-title');
        this.gameDescEl = document.getElementById('active-game-desc');
        this.theaterToggleBtn = document.getElementById('theater-mode-toggle');
        this.prodTitleEl = document.getElementById('monetize-title');
        this.prodLinkEl = document.getElementById('monetize-link');

        // Waterfall Modal Simulation Anchors
        this.adModal = document.getElementById('ad-simulation-modal');
        this.adNetLabel = document.getElementById('ad-network-identifier');
        this.adCountdownEl = document.getElementById('ad-countdown-ticker');
    }

    bindEvents() {
        // Hash routing orchestrator
        window.addEventListener('hashchange', () => this.handleRoutingState());

        // Theater aspect toggle
        if (this.theaterToggleBtn) {
            this.theaterToggleBtn.addEventListener('click', () => this.toggleTheaterScaling());
        }

        // Instant sponsorship skip / continue button
        const instantSkipBtn = document.getElementById('instant-ad-skip-btn');
        if (instantSkipBtn) {
            instantSkipBtn.addEventListener('click', () => {
                if (this.adModal) this.adModal.classList.add('hidden');
                this.lastAdExecutedTime = Date.now();
                if (this.activeGameWindow) this.activeGameWindow.postMessage({ type: "ARCADE_AD_COMPLETE" }, "*");
                this.notifyPlayerStatus("◈ Sponsorship Bypassed — Execution Resumed");
            });
        }

        // Phase 2 PostMessage Orchestrator
        window.addEventListener('message', (e) => this.interceptFrameTelecommunications(e));
    }

    async loadMasterRegistry() {
        try {
            const res = await fetch('games.json');
            if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
            this.gamesRegistry = await res.json();
            
            this.compileCategories();
            this.handleRoutingState();
        } catch (err) {
            console.error("Failed to fetch games.json catalog:", err);
            if (this.gridTheater) {
                this.gridTheater.innerHTML = `<div class="p-8 bg-rose-500/10 border-2 border-rose-500/30 text-rose-500 rounded-2xl max-w-lg mx-auto text-center font-mono shadow-2xl">
                    <h3 class="font-bold text-xl mb-2">MASTER REGISTRY FAULT</h3>
                    <p class="text-xs">Unable to ingest games.json metadata catalog. Verify directory privileges.</p>
                </div>`;
            }
        }
    }

    compileCategories() {
        const sidebar = document.getElementById('category-sidebar');
        if (!sidebar) return;
        sidebar.innerHTML = '';

        const categories = ['ALL', ...new Set(this.gamesRegistry.map(g => g.category))];

        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `px-4 py-2 sm:py-3.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 md:justify-between shrink-0 border ${
                cat === this.activeCategory
                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 border-slate-800/80 md:border-transparent hover:bg-slate-900 hover:text-slate-200'
            }`;
            btn.innerHTML = `<span>◈ ${cat}</span><span class="text-[10px] text-slate-500 font-mono tracking-widest">[${
                cat === 'ALL' ? this.gamesRegistry.length : this.gamesRegistry.filter(g => g.category === cat).length
            }]</span>`;

            btn.addEventListener('click', () => {
                this.activeCategory = cat;
                this.compileCategories();
                this.renderBrowseGrid();
            });

            sidebar.appendChild(btn);
        });
    }

    createGameCardDOM(game) {
        const card = document.createElement('div');
        card.className = "bg-slate-950/80 border-2 border-slate-800/80 rounded-2xl overflow-hidden hover:border-cyan-400 transition-all group flex flex-col justify-between cursor-pointer shadow-2xl hover:shadow-cyan-400/10 font-mono";
        
        const svgPlaceholder = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'><rect width='600' height='375' fill='%230f172a'/><circle cx='300' cy='187' r='80' fill='%2322d3ee' opacity='0.15'/><path d='M300 137l50 86h-100z' fill='%2322d3ee' opacity='0.4'/><text x='300' y='295' font-family='monospace' font-size='16' font-weight='bold' fill='%2364748b' text-anchor='middle'>◈ ${game.id.toUpperCase()} ◈</text></svg>`;

        card.innerHTML = `
            <div>
                <div class="relative aspect-[16/10] bg-slate-900 overflow-hidden border-b border-slate-800">
                    <img 
                        src="${game.thumbnail_url || svgPlaceholder}" 
                        onerror="this.onerror=null; this.src='${svgPlaceholder}';" 
                        alt="${game.title}" 
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                    <span class="absolute bottom-2 left-2 sm:bottom-3 sm:left-3.5 text-[9px] sm:text-[10px] font-mono tracking-widest font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-cyan-400/15 text-cyan-400 border border-cyan-400/30 uppercase truncate max-w-[130px] sm:max-w-none">◈ ${game.category}</span>
                </div>
                <div class="p-3 sm:p-6 font-mono">
                    <span class="text-[9px] sm:text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">${game.id}</span>
                    <h3 class="font-display font-black text-xs sm:text-lg text-white mt-1 sm:mt-1.5 tracking-tight group-hover:text-cyan-400 transition-colors line-clamp-1 sm:line-clamp-none">${game.title}</h3>
                    <p class="font-mono text-xs text-slate-400 mt-2.5 line-clamp-3 leading-relaxed hidden sm:block">${game.description}</p>
                </div>
            </div>
            <div class="px-3 sm:px-6 pb-3 sm:pb-6 pt-2 flex items-center justify-between border-t border-slate-900/80 mt-1 sm:mt-2 font-mono text-[10px] sm:text-xs">
                <span class="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse"></span> <span class="hidden sm:inline">Sandbox Secure</span><span class="sm:hidden">SECURE</span></span>
                <span class="font-black text-cyan-400 group-hover:translate-x-1 sm:group-hover:translate-x-1.5 transition-transform tracking-widest uppercase font-mono">PLAY &rarr;</span>
            </div>
        `;

        card.addEventListener('click', () => {
            window.location.hash = `/play/${game.id}`;
        });
        return card;
    }

    renderBrowseGrid() {
        if (this.gridTheater) this.gridTheater.innerHTML = '';
        if (this.complexGrid) this.complexGrid.innerHTML = '';
        if (this.retroGrid) this.retroGrid.innerHTML = '';

        const filtered = this.activeCategory === 'ALL' 
            ? this.gamesRegistry 
            : this.gamesRegistry.filter(g => g.category === this.activeCategory);

        filtered.forEach(game => {
            const card = document.createElement('div');
            card.className = "bg-slate-950/80 border-2 border-slate-800/80 rounded-2xl overflow-hidden hover:border-cyan-400 transition-all group flex flex-col justify-between cursor-pointer shadow-2xl hover:shadow-cyan-400/10 font-mono";
            
            // Inline SVG fallback thumbnail generator
            const svgPlaceholder = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'><rect width='600' height='375' fill='%230f172a'/><circle cx='300' cy='187' r='80' fill='%2322d3ee' opacity='0.15'/><path d='M300 137l50 86h-100z' fill='%2322d3ee' opacity='0.4'/><text x='300' y='295' font-family='monospace' font-size='16' font-weight='bold' fill='%2364748b' text-anchor='middle'>◈ ${game.id.toUpperCase()} ◈</text></svg>`;

            card.innerHTML = `
                <div>
                    <div class="relative aspect-[16/10] bg-slate-900 overflow-hidden border-b border-slate-800">
                        <img 
                            src="${game.thumbnail_url || svgPlaceholder}" 
                            onerror="this.onerror=null; this.src='${svgPlaceholder}';" 
                            alt="${game.title}" 
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block">
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                        <span class="absolute bottom-2 left-2 sm:bottom-3 sm:left-3.5 text-[9px] sm:text-[10px] font-mono tracking-widest font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-cyan-400/15 text-cyan-400 border border-cyan-400/30 uppercase truncate max-w-[130px] sm:max-w-none">◈ ${game.category}</span>
                    </div>
                    <div class="p-3 sm:p-6 font-mono">
                        <span class="text-[9px] sm:text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">${game.id}</span>
                        <h3 class="font-display font-black text-xs sm:text-lg text-white mt-1 sm:mt-1.5 tracking-tight group-hover:text-cyan-400 transition-colors line-clamp-1 sm:line-clamp-none">${game.title}</h3>
                        <p class="font-mono text-xs text-slate-400 mt-2.5 line-clamp-3 leading-relaxed hidden sm:block">${game.description}</p>
                    </div>
                </div>
                <div class="px-3 sm:px-6 pb-3 sm:pb-6 pt-2 flex items-center justify-between border-t border-slate-900/80 mt-1 sm:mt-2 font-mono text-[10px] sm:text-xs">
                    <span class="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse"></span> <span class="hidden sm:inline">Sandbox Secure</span><span class="sm:hidden">SECURE</span></span>
                    <span class="font-black text-cyan-400 group-hover:translate-x-1 sm:group-hover:translate-x-1.5 transition-transform tracking-widest uppercase font-mono">PLAY &rarr;</span>
                </div>
            `;

            card.addEventListener('click', () => {
                window.location.hash = `/play/${game.id}`;
            });

            if (game.category === 'Classics & Mainstream Retro' && this.retroGrid) {
                this.retroGrid.appendChild(card);
            } else if (this.complexGrid) {
                this.complexGrid.appendChild(card);
            } else if (this.gridTheater) {
                this.gridTheater.appendChild(card);
            }
        });

        if (this.complexGrid) {
            const sec = this.complexGrid.closest('.space-y-4');
            if (sec) sec.style.display = this.complexGrid.children.length === 0 ? 'none' : '';
        }
        if (this.retroGrid) {
            const sec = this.retroGrid.closest('.space-y-4');
            if (sec) sec.style.display = this.retroGrid.children.length === 0 ? 'none' : '';
        }
    }

    handleRoutingState() {
        const hash = window.location.hash;

        if (hash.startsWith('#/play/')) {
            const gameId = hash.replace('#/play/', '');
            const target = this.gamesRegistry.find(g => g.id === gameId);

            if (target) {
                this.mountSecureGameTheater(target);
            } else {
                this.returnToBrowseGrid();
            }
        } else {
            this.returnToBrowseGrid();
        }
    }

    returnToBrowseGrid() {
        document.body.style.overflow = ''; 
        document.body.style.overscrollBehavior = '';
        document.documentElement.style.overscrollBehavior = '';
        this.activeGame = null;
        if (this.gameIframe) {
            this.gameIframe.src = ''; // Clean WebAssembly buffer memory
        }

        if (this.gameTheater) this.gameTheater.classList.add('hidden');
        const aside = document.querySelector('aside');
        if (aside) aside.classList.remove('hidden');
        if (this.browseHub) this.browseHub.classList.remove('hidden');
        if (this.gridTheater) this.gridTheater.classList.remove('hidden');

        this.renderBrowseGrid();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    mountSecureGameTheater(game) {
        document.body.style.overflow = 'hidden'; 
        document.body.style.overscrollBehavior = 'none';
        document.documentElement.style.overscrollBehavior = 'none';
        this.activeGame = game;

        if (this.browseHub) this.browseHub.classList.add('hidden');
        if (this.gridTheater) this.gridTheater.classList.add('hidden');
        const aside = document.querySelector('aside');
        if (aside) aside.classList.add('hidden'); // Isolate platform viewport completely
        if (this.gameTheater) this.gameTheater.classList.remove('hidden');

        if (this.gameTitleEl) this.gameTitleEl.textContent = game.title;
        if (this.gameDescEl) this.gameDescEl.textContent = game.description;

        // Configure Personally Vetted Hardware Node
        if (this.prodTitleEl && game.prodTitle) {
            this.prodTitleEl.textContent = game.prodTitle;
        }
        if (this.prodLinkEl && game.asid) {
            const assocTag = localStorage.getItem('amazon_associate_tag') || 'ittybittybite-20';
            this.prodLinkEl.href = `https://www.amazon.com/dp/${game.asid}/?tag=${assocTag}`;
        }

        // Complete Strict Iframe Injection
        if (this.gameIframe) {
            this.gameIframe.src = game.directory_path;
        }

        // Execute Automated Background Adsterra Prefetching Engine
        this.executeBackgroundAdPrefetch();

        if (this.gameTheater) {
            this.gameTheater.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        this.notifyPlayerStatus(`Mounted Secure Operative Sandbox: ${game.id}`);
    }

    executeBackgroundAdPrefetch() {
        console.log("⚡ [Adsterra Engine] Initiating automated background prefetching engine to warm Adsterra Direct Link endpoints...");
        
        // 1. Inject DOM prefetch link
        let existingPrefetch = document.getElementById('adsterra-prefetch-node');
        if (!existingPrefetch) {
            existingPrefetch = document.createElement('link');
            existingPrefetch.id = 'adsterra-prefetch-node';
            existingPrefetch.rel = 'prefetch';
            existingPrefetch.href = this.adsterraSmartlinkUrl;
            document.head.appendChild(existingPrefetch);
        } else {
            existingPrefetch.href = this.adsterraSmartlinkUrl;
        }

        // 2. Perform non-blocking background connection pre-warm ping
        fetch(this.adsterraSmartlinkUrl, {
            mode: 'no-cors',
            cache: 'force-cache'
        }).catch(() => {});
    }

    toggleTheaterScaling() {
        if (!this.gameTheater) return;
        const frameBox = document.getElementById('iframe-aspect-container');
        
        if (frameBox) {
            frameBox.classList.toggle('max-w-[1000px]');
            frameBox.classList.toggle('max-w-[1500px]');
            this.notifyPlayerStatus("◈ Theater Viewport Scaling Calibrated");
        }
    }

    // ─── Universal Adsterra Commercial Monetization Engine ───────────────────────
    interceptFrameTelecommunications(e) {
        if (!e.data || typeof e.data !== 'object') return;

        switch (e.data.type) {
            case "ARCADE_TRIGGER_AD":
                this.executeAdsterraMonetizationLoop(e.source, e.data.adType);
                break;
        }
    }

    executeAdsterraMonetizationLoop(targetFrameWindow, adType) {
        this.activeGameWindow = targetFrameWindow;
        const now = Date.now();

        // 1. Strict Global Ad Cooldown Timer (3 Minutes / 180000ms)
        if (now - this.lastAdExecutedTime < this.globalAdCooldownMs) {
            console.log(`⚡ [Adsterra Engine] Global Ad Cooldown active (${((this.globalAdCooldownMs - (now - this.lastAdExecutedTime)) / 1000).toFixed(1)}s remaining). Skipping Adsterra monetization routine and firing instant clearance handshake...`);
            if (targetFrameWindow) targetFrameWindow.postMessage({ type: "ARCADE_AD_COMPLETE" }, "*");
            return;
        }

        console.log(`🚀 [Adsterra Engine] Triggering commercial monetization routine for ad break: ${adType}`);

        // 2. Deploy Sleek Immersive 5-Second Adsterra Interstitial Buffer Proxy Modal
        if (this.adModal && this.adCountdownEl && this.adNetLabel) {
            this.adNetLabel.textContent = adType === 'rewarded' ? "ADSTERRA COMMERCIAL REWARD // OPERATIVE PERK" : "ADSTERRA COMMERCIAL SPONSORSHIP // INTERSTITIAL";
            this.adModal.classList.remove('hidden');
            
            // Link the exact Adsterra button
            const directBtn = document.getElementById('adsterra-direct-launch-btn');
            if (directBtn) {
                directBtn.href = this.adsterraSmartlinkUrl;
            }

            let counter = 5;
            this.adCountdownEl.textContent = `${counter}s`;

            const ticker = setInterval(() => {
                counter--;
                if (counter <= 0) {
                    clearInterval(ticker);
                    this.adModal.classList.add('hidden');
                    this.lastAdExecutedTime = Date.now();
                    
                    // Transmit absolute clearance handshake back to game sandbox
                    if (targetFrameWindow) targetFrameWindow.postMessage({ type: "ARCADE_AD_COMPLETE" }, "*");
                    this.notifyPlayerStatus("◈ Adsterra Commercial Sponsorship Validated");
                } else {
                    this.adCountdownEl.textContent = `${counter}s`;
                }
            }, 1000);
        } else {
            this.lastAdExecutedTime = Date.now();
            if (targetFrameWindow) targetFrameWindow.postMessage({ type: "ARCADE_AD_COMPLETE" }, "*");
        }
    }

    notifyPlayerStatus(msg) {
        const bar = document.getElementById('terminal-notification-bar');
        if (!bar) return;
        bar.textContent = `◈ ${msg}`;
        bar.classList.add('text-cyan-400');
        setTimeout(() => bar.classList.remove('text-cyan-400'), 1500);
    }
}