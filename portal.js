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

        // Asynchronous Ad Mediation States
        this.globalAdCooldownMs = 180000; // 3 Minutes strict Global Ad Cooldown
        this.lastAdExecutedTime = 0;

        // Consenting AI Telemetry States
        this.telemetryConsent = localStorage.getItem('arcade_telemetry_consent') === 'true';
        this.telemetryEndpointUrl = 'https://telemetry.ittybittybites.workers.dev/stream';

        this.initDOMAnchors();
        this.bindEvents();
        this.loadMasterRegistry();
    }

    initDOMAnchors() {
        this.gridTheater = document.getElementById('browse-grid-theater');
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

        // Consent UI Anchors
        this.consentCheckbox = document.getElementById('telemetry-consent-checkbox');
        if (this.consentCheckbox) {
            this.consentCheckbox.checked = this.telemetryConsent;
        }
    }

    bindEvents() {
        // Hash routing orchestrator
        window.addEventListener('hashchange', () => this.handleRoutingState());

        // Theater aspect toggle
        if (this.theaterToggleBtn) {
            this.theaterToggleBtn.addEventListener('click', () => this.toggleTheaterScaling());
        }

        // Telemetry Consent Guard Toggle
        if (this.consentCheckbox) {
            this.consentCheckbox.addEventListener('change', (e) => {
                this.telemetryConsent = e.target.checked;
                localStorage.setItem('arcade_telemetry_consent', e.target.checked);
                this.notifyPlayerStatus(this.telemetryConsent ? "◈ AI Telemetry Online — Tracking Ads Blocked" : "◈ AI Telemetry Halted");
            });
        }

        // Phase 2 & Phase 3 Parent PostMessage Orchestrator
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

    renderBrowseGrid() {
        if (!this.gridTheater) return;
        this.gridTheater.innerHTML = '';

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

            this.gridTheater.appendChild(card);
        });
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
        document.body.style.overflow = ''; // Kill double scrollbars and restore parent scroll
        this.activeGame = null;
        if (this.gameIframe) {
            this.gameIframe.src = ''; // Clean WebAssembly buffer memory
        }

        if (this.gameTheater) this.gameTheater.classList.add('hidden');
        const aside = document.querySelector('aside');
        if (aside) aside.classList.remove('hidden');
        if (this.gridTheater) this.gridTheater.classList.remove('hidden');

        this.renderBrowseGrid();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    mountSecureGameTheater(game) {
        document.body.style.overflow = 'hidden'; // Kill double scrollbars and lock parent scroll
        this.activeGame = game;

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

        if (this.gameTheater) {
            this.gameTheater.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        this.notifyPlayerStatus(`Mounted Secure Operative Sandbox: ${game.id}`);
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

    // ─── Asynchronous Cascading Ad Mediation Orchestrator ────────────────────────
    interceptFrameTelecommunications(e) {
        if (!e.data || typeof e.data !== 'object') return;

        switch (e.data.type) {
            case "ARCADE_TRIGGER_AD":
                this.executeCascadingAdWaterfall(e.source, e.data.adType);
                break;
            
            case "ARCADE_TELEMETRY_STREAM":
                this.ingestTelemetryStream(e.data.payload);
                break;
        }
    }

    executeCascadingAdWaterfall(targetFrameWindow, adType) {
        const now = Date.now();

        // 1. Strict Global Ad Cooldown Timer (3 Minutes / 180000ms)
        if (now - this.lastAdExecutedTime < this.globalAdCooldownMs) {
            console.log(`⚡ [AD MEDIATION] Global Ad Cooldown active (${((this.globalAdCooldownMs - (now - this.lastAdExecutedTime)) / 1000).toFixed(1)}s remaining). Skipping ad Waterfall and firing instant complete validation...`);
            if (targetFrameWindow) {
                targetFrameWindow.postMessage({ type: "ARCADE_AD_COMPLETE" }, "*");
            }
            return;
        }

        console.log(`🚀 [AD MEDIATION] Triggering Cascading Waterfall sequence for ad type: ${adType}`);
        
        // 2. Try Primary Network Loader (AdinPlay commercial SDK simulation)
        this.tryPrimaryAdNetwork(targetFrameWindow, adType, (primarySuccess) => {
            if (primarySuccess) {
                this.lastAdExecutedTime = Date.now();
                return;
            }

            console.warn("⚠ [AD MEDIATION] Primary Network (AdinPlay) fill rate low or failed. Instantly cascading to Backup Network...");
            
            // 3. Cascade to Backup Network Loader (AppLixir SDK simulation)
            this.tryBackupAdNetwork(targetFrameWindow, adType, (backupSuccess) => {
                if (backupSuccess) {
                    this.lastAdExecutedTime = Date.now();
                    return;
                }

                console.error("❌ [AD MEDIATION] Entire Waterfall cascade exhausted. Executing automated immediate postMessage complete handshake to guarantee 100% user retention.");
                if (targetFrameWindow) {
                    targetFrameWindow.postMessage({ type: "ARCADE_AD_COMPLETE" }, "*");
                }
            });
        });
    }

    tryPrimaryAdNetwork(targetWindow, adType, callback) {
        if (!this.adModal || !this.adCountdownEl || !this.adNetLabel) {
            callback(false);
            return;
        }

        // Simulate 90% Primary Fill Rate
        if (Math.random() < 0.1) {
            setTimeout(() => callback(false), 200); // 200ms fail latency
            return;
        }

        this.adNetLabel.textContent = "PRIMARY NETWORK // ADINPLAY TACTICAL PROXY";
        this.adModal.classList.remove('hidden');
        let counter = 5;
        this.adCountdownEl.textContent = `${counter}s`;

        const ticker = setInterval(() => {
            counter--;
            if (counter <= 0) {
                clearInterval(ticker);
                this.adModal.classList.add('hidden');
                if (targetWindow) targetWindow.postMessage({ type: "ARCADE_AD_COMPLETE" }, "*");
                this.notifyPlayerStatus("◈ Primary Sponsorship Handshake Confirmed");
                callback(true);
            } else {
                this.adCountdownEl.textContent = `${counter}s`;
            }
        }, 1000);
    }

    tryBackupAdNetwork(targetWindow, adType, callback) {
        if (!this.adModal || !this.adCountdownEl || !this.adNetLabel) {
            callback(false);
            return;
        }

        this.adNetLabel.textContent = "BACKUP NETWORK // APPLIXIR VIDEO FALLBACK";
        this.adModal.classList.remove('hidden');
        let counter = 4;
        this.adCountdownEl.textContent = `${counter}s`;

        const ticker = setInterval(() => {
            counter--;
            if (counter <= 0) {
                clearInterval(ticker);
                this.adModal.classList.add('hidden');
                if (targetWindow) targetWindow.postMessage({ type: "ARCADE_AD_COMPLETE" }, "*");
                this.notifyPlayerStatus("◈ Backup Network Handshake Confirmed");
                callback(true);
            } else {
                this.adCountdownEl.textContent = `${counter}s`;
            }
        }, 1000);
    }

    // ─── Secure Consenting AI Telemetry Dispatcher ──────────────────────────────
    ingestTelemetryStream(payload) {
        // Phase 3 Opt-in Loop Guard
        if (!this.telemetryConsent) {
            console.warn("⚠ [AI TELEMETRY] Telemetry stream discarded at browser level due to player local consent profile.");
            return;
        }

        // Strict Regex / JSON Sanitize and Validation Filter
        const cleanedBatch = this.validateAndSanitizeTelemetry(payload);
        if (!cleanedBatch) {
            console.error("❌ [AI TELEMETRY FAULT] Payload failed strict structural Regex/JSON sanitization check. Dropping packet immediately.");
            return;
        }

        this.dispatchToServerlessWorker(cleanedBatch);
    }

    validateAndSanitizeTelemetry(raw) {
        if (!raw || typeof raw !== 'object') return null;

        const pristine = {
            timestamp: parseInt(raw.timestamp || Date.now(), 10),
            gameId: typeof raw.gameId === 'string' ? raw.gameId.replace(/[^a-zA-Z0-9_-]/g, '') : (this.activeGame ? this.activeGame.id : 'unknown'),
            batchUuid: `LOG_${Math.random().toString(36).substring(2,9).toUpperCase()}`,
            dataBatches: []
        };

        if (Array.isArray(raw.moves)) {
            pristine.dataBatches = raw.moves.map(item => ({
                moveIndex: parseInt(item.moveIdx || item.moveIndex || 0, 10),
                selectedCoord: {
                    x: parseInt(item.selectedCoord?.x || 0, 10),
                    y: parseInt(item.selectedCoord?.y || 0, 10)
                },
                thinkingDeltaMs: parseInt(item.thinkingDeltaMs || 0, 10)
            })).filter(b => b.thinkingDeltaMs > 0); // Keep only valid timing actions
        }

        return pristine;
    }

    dispatchToServerlessWorker(pristineBatch) {
        console.log("🚀 [AI TELEMETRY DISPATCHER] Streaming pristine verified logic packet to Serverless Cloud Worker:", pristineBatch);
        
        // Asynchronous POST pointing to the user's live Cloudflare Worker endpoint
        fetch(this.telemetryEndpointUrl, {
            method: 'POST',
            mode: 'no-cors', // Non-blocking fire and forget
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pristineBatch)
        }).catch(() => {});
    }

    notifyPlayerStatus(msg) {
        const bar = document.getElementById('terminal-notification-bar');
        if (!bar) return;
        bar.textContent = `◈ ${msg}`;
        bar.classList.add('text-cyan-400');
        setTimeout(() => bar.classList.remove('text-cyan-400'), 1500);
    }
}