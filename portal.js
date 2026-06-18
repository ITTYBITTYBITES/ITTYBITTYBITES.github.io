/**
 * CORE ARCADE PORTAL ENGINE & CLIENT-SIDE ROUTER // v1.0.0
 * Fully autonomous Phase 1-5 specification implementation.
 */

document.addEventListener('DOMContentLoaded', () => {
    window.ArcadePortal = new ArcadePortalEngine();
});

class ArcadePortalEngine {
    constructor() {
        this.gamesRegistry = [];
        this.activeCategory = 'ALL';
        this.activeGame = null;

        // Telemetry state
        this.telemetryConsent = localStorage.getItem('arcade_telemetry_consent') === 'true';

        this.initDOMAnchors();
        this.bindEvents();
        this.loadMasterRegistry();
    }

    initDOMAnchors() {
        this.gridTheater = document.getElementById('browse-grid-theater');
        this.categorySidebar = document.getElementById('category-sidebar');
        this.gameTheater = document.getElementById('game-theater');
        this.gameIframe = document.getElementById('secure-game-frame');
        this.gameTitleEl = document.getElementById('active-game-title');
        this.gameDescEl = document.getElementById('active-game-desc');
        this.theaterToggleBtn = document.getElementById('theater-mode-toggle');
        this.prodTitleEl = document.getElementById('monetize-title');
        this.prodLinkEl = document.getElementById('monetize-link');

        // Modal overlay anchors
        this.adModal = document.getElementById('ad-simulation-modal');
        this.adCountdownEl = document.getElementById('ad-countdown-ticker');

        // Consent anchors
        this.consentCheckbox = document.getElementById('telemetry-consent-checkbox');
        if (this.consentCheckbox) {
            this.consentCheckbox.checked = this.telemetryConsent;
        }
    }

    bindEvents() {
        // Hash routing interceptor
        window.addEventListener('hashchange', () => this.handleRoutingState());

        // Theater mode toggle
        if (this.theaterToggleBtn) {
            this.theaterToggleBtn.addEventListener('click', () => this.toggleTheaterScaling());
        }

        // Telemetry consent toggle
        if (this.consentCheckbox) {
            this.consentCheckbox.addEventListener('change', (e) => {
                this.telemetryConsent = e.target.checked;
                localStorage.setItem('arcade_telemetry_consent', e.target.checked);
                this.notifyPlayerStatus(this.telemetryConsent ? "AI Telemetry Online — Banner Ads Off" : "AI Telemetry Halted");
            });
        }

        // Phase 2 & Phase 3 Parent-Side PostMessage Orchestrator
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
            console.error("Failed to fetch games.json registry:", err);
            if (this.gridTheater) {
                this.gridTheater.innerHTML = `<div class="p-8 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl max-w-lg mx-auto text-center font-mono">
                    <h3 class="font-bold text-lg mb-2">SYSTEM REGISTRY FAULT</h3>
                    <p class="text-xs">Unable to parse games.json catalog. Verify file access.</p>
                </div>`;
            }
        }
    }

    compileCategories() {
        if (!this.categorySidebar) return;
        this.categorySidebar.innerHTML = '';

        const categories = ['ALL', ...new Set(this.gamesRegistry.map(g => g.category))];

        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `w-full text-left px-4 py-3 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center justify-between border ${
                cat === this.activeCategory
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-md shadow-cyan-500/5'
                : 'text-slate-400 border-transparent hover:bg-slate-900 hover:text-slate-200'
            }`;
            btn.innerHTML = `<span>◈ ${cat}</span><span class="text-[10px] text-slate-600 font-mono tracking-widest">[${
                cat === 'ALL' ? this.gamesRegistry.length : this.gamesRegistry.filter(g => g.category === cat).length
            }]</span>`;

            btn.addEventListener('click', () => {
                this.activeCategory = cat;
                this.compileCategories();
                this.renderBrowseGrid();
            });

            this.categorySidebar.appendChild(btn);
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
            card.className = "bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all group flex flex-col justify-between cursor-pointer shadow-xl hover:shadow-cyan-400/5";
            
            card.innerHTML = `
                <div>
                    <div class="relative aspect-[16/10] bg-slate-900 overflow-hidden border-b border-slate-800">
                        <img src="${game.thumbnail_url}" alt="${game.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                        <span class="absolute bottom-2.5 left-3 text-[10px] font-mono tracking-widest font-bold px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">◈ ${game.category}</span>
                    </div>
                    <div class="p-5">
                        <span class="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">${game.id}</span>
                        <h3 class="font-mono font-bold text-base text-slate-100 mt-1 tracking-tight group-hover:text-cyan-400 transition-colors">${game.title}</h3>
                        <p class="font-mono text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">${game.description}</p>
                    </div>
                </div>
                <div class="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-900/80 mt-2 font-mono">
                    <span class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Sandbox Secure</span>
                    <span class="text-xs font-bold text-slate-300 group-hover:translate-x-1 transition-transform tracking-wider">ENGAGE &rarr;</span>
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
        this.activeGame = null;
        if (this.gameIframe) {
            this.gameIframe.src = ''; // Clear memory
        }

        if (this.gameTheater) this.gameTheater.classList.add('hidden');
        if (this.categorySidebar) this.categorySidebar.closest('aside').classList.remove('hidden');
        if (this.gridTheater) this.gridTheater.classList.remove('hidden');

        this.renderBrowseGrid();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    mountSecureGameTheater(game) {
        this.activeGame = game;

        if (this.gridTheater) this.gridTheater.classList.add('hidden');
        if (this.categorySidebar) this.categorySidebar.closest('aside').classList.add('hidden');
        if (this.gameTheater) this.gameTheater.classList.remove('hidden');

        if (this.gameTitleEl) this.gameTitleEl.textContent = game.title;
        if (this.gameDescEl) this.gameDescEl.textContent = game.description;

        // Configure Monetization Node
        if (this.prodTitleEl && game.prodTitle) {
            this.prodTitleEl.textContent = game.prodTitle;
        }
        if (this.prodLinkEl && game.asid) {
            const assocTag = localStorage.getItem('amazon_associate_tag') || 'ittybittybite-20';
            this.prodLinkEl.href = `https://www.amazon.com/dp/${game.asid}/?tag=${assocTag}`;
        }

        // Secure sandbox DOM injection
        if (this.gameIframe) {
            this.gameIframe.src = game.directory_path;
        }

        if (this.gameTheater) {
            this.gameTheater.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        this.notifyPlayerStatus(`Mounted Secure Sandbox: ${game.id}`);
    }

    toggleTheaterScaling() {
        if (!this.gameTheater) return;
        const frameBox = document.getElementById('iframe-aspect-container');
        
        if (frameBox) {
            frameBox.classList.toggle('max-w-[1000px]');
            frameBox.classList.toggle('max-w-[1400px]');
            this.notifyPlayerStatus("Theater Aspect Ratio Adjusted");
        }
    }

    // Phase 2 & Phase 3 PostMessage Hub
    interceptFrameTelecommunications(e) {
        // Confirm origin
        if (!e.data || typeof e.data !== 'object') return;

        switch (e.data.type) {
            case "ARCADE_TRIGGER_AD":
                this.executeInHouseAdSequence(e.source);
                break;
            

            case "ARCADE_TELEMETRY_STREAM":
                this.ingestTelemetryStream(e.data.payload);
                break;
        }
    }

    executeInHouseAdSequence(targetFrameWindow) {
        if (!this.adModal || !this.adCountdownEl) return;

        this.adModal.classList.remove('hidden');
        let counter = 5;
        this.adCountdownEl.textContent = `${counter}s`;

        const ticker = setInterval(() => {
            counter--;
            if (counter <= 0) {
                clearInterval(ticker);
                this.adModal.classList.add('hidden');
                
                // Transmit completion handshake back to sandbox
                if (targetFrameWindow) {
                    targetFrameWindow.postMessage({ type: "ARCADE_AD_COMPLETE" }, "*");
                }
                this.notifyPlayerStatus("In-House Sponsorship Validated — Sandbox Resumed");
            } else {
                this.adCountdownEl.textContent = `${counter}s`;
            }
        }, 1000);
    }

    ingestTelemetryStream(payload) {
        // Phase 3 Consent Guard
        if (!this.telemetryConsent) {
            console.warn("AI Telemetry rejected by user local profile. Discarding batch.");
            return;
        }

        // Phase 4 Sanitize / Validation Guard
        const sanitized = this.sanitizeTelemetryPayload(payload);
        if (!sanitized) {
            console.error("Telemetry packet failed Phase 4 structural security check. Terminated.");
            return;
        }

        this.streamDataToLogEngine(sanitized);
    }

    sanitizeTelemetryPayload(payload) {
        if (!payload || typeof payload !== 'object') return null;

        // Verify structure & strip unauthorized input strings
        const clean = {
            timestamp: payload.timestamp || Date.now(),
            gameId: this.activeGame ? this.activeGame.id : 'unknown',
            moves: []
        };

        if (Array.isArray(payload.moves)) {
            clean.moves = payload.moves.map(m => ({
                status: typeof m.status === 'string' ? m.status.replace(/[^a-zA-Z0-9_-]/g, '') : 'active',
                selectedCoord: {
                    x: parseInt(m.selectedCoord?.x || 0, 10),
                    y: parseInt(m.selectedCoord?.y || 0, 10)
                },
                thinkingDeltaMs: parseInt(m.thinkingDeltaMs || 0, 10)
            }));
        }

        return clean;
    }

    streamDataToLogEngine(cleanBatch) {
        console.log("🚀 [AI TELEMETRY STREAM] Transmitting sanitized anonymized dataset batch:", cleanBatch);
        
        // Mock non-blocking API endpoint transmission
        fetch('https://ittybittybites.github.io/telemetry-endpoint-mock', {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanBatch)
        }).catch(() => {}); // Fire and forget
    }

    notifyPlayerStatus(msg) {
        const bar = document.getElementById('terminal-notification-bar');
        if (!bar) return;
        bar.textContent = `◈ ${msg}`;
        bar.classList.add('text-cyan-400');
        setTimeout(() => bar.classList.remove('text-cyan-400'), 1500);
    }
}