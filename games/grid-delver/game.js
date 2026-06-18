/**
 * GRID DELVER: 1-MINUTE MICRO-ROGUE // GAME ENGINE
 * Phase 5 self-contained WebAssembly / JS module.
 */

class GridDelverEngine {
    constructor() {
        this.boardSize = 5;
        this.playerHp = 100;
        this.maxHp = 100;
        this.gold = 0;
        this.level = 1;
        this.xp = 0;

        // Ticker & Telemetry states
        this.timeRemainingMs = 60000; // 1 Minute
        this.isPaused = false;
        this.isGameOver = false;
        this.lastTurnReadyTime = Date.now();
        this.moveHistoryBatch = [];
        this.totalMoves = 0;

        // Board data
        this.gridMatrix = [];
        this.playerCoord = { x: 2, y: 4 }; // Bottom center start

        this.initDOMAnchors();
        this.initWebAudio();
        this.bindParentHandshake();
        this.generateLevelTheater();
        this.engageMasterClock();
    }

    initDOMAnchors() {
        this.gridBoardEl = document.getElementById('delver-grid-board');
        this.hpValEl = document.getElementById('stat-hp');
        this.goldValEl = document.getElementById('stat-gold');
        this.lvlValEl = document.getElementById('stat-lvl');
        this.xpValEl = document.getElementById('stat-xp');
        this.timeFillEl = document.getElementById('time-fill-bar');
        this.logBoxEl = document.getElementById('tactical-log-box');
        this.modalEl = document.getElementById('interactive-modal');
    }

    initWebAudio() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn("Web Audio API not supported or disabled in this browser mode.");
        }
    }

    playAudioTone(type) {
        if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;

        switch (type) {
            case 'step':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
                break;
            

            case 'gold':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(587.33, now); // D5
                osc.frequency.setValueAtTime(880, now + 0.08); // A5
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.25);
                break;
            

            case 'damage':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(140, now);
                osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
                osc.start(now);
                osc.stop(now + 0.18);
                break;
            

            case 'victory':
                osc.type = 'square';
                osc.frequency.setValueAtTime(440, now); // A4
                osc.frequency.setValueAtTime(554.37, now + 0.1); // C#5
                osc.frequency.setValueAtTime(659.25, now + 0.2); // E5
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
                osc.start(now);
                osc.stop(now + 0.45);
                break;
        }
    }

    bindParentHandshake() {
        // Phase 2: Asynchronous Ad Interstitial Handshake Listener
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === "ARCADE_AD_COMPLETE") {
                this.resumeAfterInterruption();
            }
        });
    }

    generateLevelTheater() {
        this.gridMatrix = [];
        this.playerCoord = { x: 2, y: 4 };

        // Blueprint card deck composition
        const deck = [];
        const nonStartCardsCount = (this.boardSize * this.boardSize) - 1; // 24 cards

        // 1 Stairs, 6 Gold tokens, 6 Shadow Monsters, 4 Spike Traps, 7 Blank Corridors
        deck.push({ type: 'stairs', icon: '⎈', title: 'Stairs depth', badge: 'stairs' });
        
        for (let i = 0; i < 6; i++) deck.push({ type: 'gold', icon: '◈', title: 'Gold Token', val: 15 + Math.floor(Math.random() * 25), badge: 'gold' });
        for (let i = 0; i < 6; i++) deck.push({ type: 'monster', icon: '🀙', title: 'Shadow Beast', dmg: 18 + Math.floor(Math.random() * 16), xp: 35, badge: 'monster' });
        for (let i = 0; i < 4; i++) deck.push({ type: 'trap', icon: '⁕', title: 'Spike Wire', dmg: 12 + Math.floor(Math.random() * 10), badge: 'trap' });
        for (let i = 0; i < 7; i++) deck.push({ type: 'blank', icon: '·', title: 'Stone Pathway' });

        // Shuffle tactical deck
        this.shuffleArray(deck);

        // Build 5x5 board
        let deckIdx = 0;
        for (let y = 0; y < this.boardSize; y++) {
            const row = [];
            for (let x = 0; x < this.boardSize; x++) {
                if (x === this.playerCoord.x && y === this.playerCoord.y) {
                    row.push({ type: 'start', icon: '🜌', title: 'Drop Zone', isRevealed: true });
                } else {
                    row.push({ ...deck[deckIdx], isRevealed: false });
                    deckIdx++;
                }
            }
            this.gridMatrix.push(row);
        }

        // Reveal starting adjacent neighbors
        this.revealAdjacentNodes(this.playerCoord.x, this.playerCoord.y);

        this.renderBoardDOM();
        this.updateStatsHUD();
        this.appendLogEntry(`Entered Classification Depth: ${this.level}`, 'success');
        this.lastTurnReadyTime = Date.now();
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    revealAdjacentNodes(px, py) {
        const neighbors = [
            { x: px, y: py - 1 },
            { x: px, y: py + 1 },
            { x: px - 1, y: py },
            { x: px + 1, y: py }
        ];

        neighbors.forEach(n => {
            if (this.isValidCoord(n.x, n.y)) {
                this.gridMatrix[n.y][n.x].isRevealed = true;
            }
        });
    }

    isValidCoord(x, y) {
        return x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize;
    }

    renderBoardDOM() {
        if (!this.gridBoardEl) return;
        this.gridBoardEl.innerHTML = '';

        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                const nodeData = this.gridMatrix[y][x];
                const isPlayer = x === this.playerCoord.x && y === this.playerCoord.y;
                const isOrthogonal = Math.hypot(x - this.playerCoord.x, y - this.playerCoord.y) === 1;

                const card = document.createElement('div');
                card.className = `card-node ${isPlayer ? 'player' : ''} ${nodeData.isRevealed ? 'revealed' : ''} ${!isOrthogonal && !isPlayer && !nodeData.isRevealed ? 'locked' : ''}`;
                
                if (isPlayer) {
                    card.innerHTML = `<span class="card-icon">🜌</span><span class="absolute bottom-1 text-[9px] font-bold text-cyan-400">AGENT</span>`;
                } else if (nodeData.isRevealed) {
                    card.innerHTML = `<span class="card-icon" style="${nodeData.type === 'gold' ? 'color:#facc15' : nodeData.type === 'monster' ? 'color:#c084fc' : nodeData.type === 'trap' ? 'color:#f43f5e' : nodeData.type === 'stairs' ? 'color:#22d3ee' : '#64748b'}">${nodeData.icon}</span>
                    ${nodeData.badge ? `<span class="card-badge ${nodeData.badge}">${nodeData.badge === 'gold' ? `+${nodeData.val}` : nodeData.badge === 'monster' ? `-${nodeData.dmg}` : nodeData.badge === 'trap' ? `-${nodeData.dmg}` : 'LVL'}</span>` : ''}`;
                } else {
                    card.innerHTML = `<span class="card-icon text-slate-700">?</span>`;
                }

                card.addEventListener('pointerdown', (e) => {
                try { e.target.setPointerCapture(e.pointerId); } catch(err){} e.preventDefault(); this.handlePlayerMove(x, y); });
                card.style.touchAction = 'none';
                this.gridBoardEl.appendChild(card);
            }
        }
    }

    updateStatsHUD() {
        if (this.hpValEl) this.hpValEl.textContent = `${this.playerHp}/${this.maxHp}`;
        if (this.goldValEl) this.goldValEl.textContent = `${this.gold}`;
        if (this.lvlValEl) this.lvlValEl.textContent = `${this.level}`;
        if (this.xpValEl) this.xpValEl.textContent = `${this.xp}`;
    }

    engageMasterClock() {
        this.masterClockTicker = setInterval(() => {
            if (this.isPaused || this.isGameOver) return;

            this.timeRemainingMs -= 100;
            if (this.timeRemainingMs <= 0) {
                this.timeRemainingMs = 0;
                this.executePlayerTerminated("TICKING CHRONO TIMEOUT — NEURAL SHUTDOWN");
            }

            if (this.timeFillEl) {
                const pct = (this.timeRemainingMs / 60000) * 100;
                this.timeFillEl.style.width = `${pct}%`;
            }
        }, 100);
    }

    handlePlayerMove(destX, destY) {
        if (this.isPaused || this.isGameOver) return;

        const isOrthogonal = Math.hypot(destX - this.playerCoord.x, destY - this.playerCoord.y) === 1;
        if (!isOrthogonal) return;

        // Compute Delta Thinking Latency
        const clickTime = Date.now();
        const thinkingDeltaMs = clickTime - this.lastTurnReadyTime;
        this.totalMoves++;

        // Ingest Card Node
        const targetNode = this.gridMatrix[destY][destX];
        targetNode.isRevealed = true;
        this.playerCoord = { x: destX, y: destY };

        // Resolve structural encounters
        this.resolveCardEncounter(targetNode);

        // Track & Ingest Phase 5 AI Telemetry
        this.logTurnTelemetryPacket(destX, destY, thinkingDeltaMs);

        // Reveal subsequent neighbors
        this.revealAdjacentNodes(destX, destY);
        this.renderBoardDOM();
        this.lastTurnReadyTime = Date.now();
    }

    resolveCardEncounter(card) {
        switch (card.type) {
            case 'gold':
                this.gold += card.val;
                this.xp += 10;
                this.playAudioTone('gold');
                this.appendLogEntry(`Secured +${card.val} Classified Gold Tokens`, 'gold');
                card.type = 'blank'; // Clean node
                card.icon = '·';
                card.badge = null;
                break;
            

            case 'monster':
                this.playerHp -= card.dmg;
                this.xp += card.xp;
                this.playAudioTone('damage');
                this.appendLogEntry(`Shadow Beast Ambush! Sustained -${card.dmg} System Damage`, 'danger');
                card.type = 'blank';
                card.icon = '·';
                card.badge = null;
                if (this.playerHp <= 0) {
                    this.executePlayerTerminated("SHADOW BEAST ASSAULT — STRUCTURAL BREACH");
                }
                break;
            

            case 'trap':
                this.playerHp -= card.dmg;
                this.playAudioTone('damage');
                this.appendLogEntry(`Triggered Spike Wire! Sustained -${card.dmg} Execution Fault`, 'danger');
                card.type = 'blank';
                card.icon = '·';
                card.badge = null;
                if (this.playerHp <= 0) {
                    this.executePlayerTerminated("SPIKE WIRE LACERATION — CORE CRASH");
                }
                break;
            

            case 'stairs':
                this.playAudioTone('victory');
                this.level++;
                this.timeRemainingMs = Math.min(60000, this.timeRemainingMs + 15000); // Bonus 15s
                this.appendLogEntry(`Advanced Level Core — Time Extended +15s`, 'success');
                this.triggerPhase2AdHandshake('interstitial');
                break;

            case 'blank':
            case 'start':
                this.playAudioTone('step');
                break;
        }
        this.updateStatsHUD();
    }

    // Phase 5: Asynchronous Ad Hook Handshake Trigger
    triggerPhase2AdHandshake(type) {
        this.isPaused = true;
        if (this.audioCtx) this.audioCtx.suspend();

        console.log(`🚀 [AD HOOK] Suspending Grid Delver tickers and Web Audio. Halting for ${type} verification...`);
        window.parent.postMessage({ type: "ARCADE_TRIGGER_AD", adType: type }, "*");
    }

    resumeAfterInterruption() {
        this.isPaused = false;
        if (this.audioCtx) this.audioCtx.resume();
        console.log("🚀 [AD HOOK CONFIRMED] Asynchronous handshake received from Parent Hub. Resuming Grid Delver level theater...");

        if (this.playerHp <= 0 || this.timeRemainingMs <= 0) {
            this.showEndgameModalDOM();
        } else {
            this.generateLevelTheater();
        }
    }

    executePlayerTerminated(cause) {
        this.playerHp = 0;
        this.isGameOver = true;
        this.isPaused = true;
        this.updateStatsHUD();
        this.appendLogEntry(`TERMINATED: ${cause}`, 'danger');

        // Mount endgame interruption
        this.triggerPhase2AdHandshake('endgame_interstitial');
    }

    showEndgameModalDOM() {
        if (!this.gridBoardEl) return;
        
        const modal = document.createElement('div');
        modal.className = "absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-50 animate-fadeIn";
        
        modal.innerHTML = `
            <div class="modal-card">
                <span class="text-rose-500 text-5xl mb-4 block">💀</span>
                <h2 class="modal-title defeat">EVALUATION FAILED</h2>
                <p class="modal-msg">Neural response cascade collapsed at **Depth ${this.level}**.<br>Total Moves Executed: **${this.totalMoves}**</p>
                
                <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 flex justify-around text-slate-300 font-mono text-xs">
                    <div><span>GOLD SECURED</span><br><span class="text-gold font-bold text-base mt-1 block">◈ ${this.gold}</span></div>
                    <div><span>TOTAL XP</span><br><span class="text-emerald-400 font-bold text-base mt-1 block">+${this.xp}</span></div>
                </div>

                <button id="delver-reboot-btn" class="btn-tactical">
                    Mount New Operative Loop &rarr;
                </button>
            </div>
        `;

        this.gridBoardEl.appendChild(modal);

        document.getElementById('delver-reboot-btn').addEventListener('click', () => {
            this.playerHp = 100;
            this.gold = 0;
            this.level = 1;
            this.xp = 0;
            this.timeRemainingMs = 60000;
            this.isGameOver = false;
            this.isPaused = false;
            this.totalMoves = 0;
            this.generateLevelTheater();
        });
    }

    // Phase 5: Granular High-Value AI Telemetry Batch Hub
    logTurnTelemetryPacket(destX, destY, thinkingTimeMs) {
        const packet = {
            moveIdx: this.totalMoves,
            playerState: { hp: this.playerHp, gold: this.gold, lvl: this.level, timeRemainingMs: this.timeRemainingMs },
            selectedCoord: { x: destX, y: destY },
            thinkingDeltaMs: thinkingTimeMs
        };

        this.moveHistoryBatch.push(packet);

        // Every 5 moves, compile batch and transmit upwards to Parent Portal Guard
        if (this.moveHistoryBatch.length >= 5) {
            console.log("🚀 [TELEMETRY BATCH] Compiling 5-move tactical logic batch upwards...");
            window.parent.postMessage({
                type: "ARCADE_TELEMETRY_STREAM",
                payload: {
                    timestamp: Date.now(),
                    moves: [...this.moveHistoryBatch]
                }
            }, "*");

            // Clean batch queue
            this.moveHistoryBatch = [];
        }
    }

    appendLogEntry(txt, theme) {
        if (!this.logBoxEl) return;

        const el = document.createElement('div');
        el.className = `log-entry ${theme}`;
        el.innerHTML = `<span>[${this.formatTimeChrono(this.timeRemainingMs)}]</span> ${txt}`;

        this.logBoxEl.appendChild(el);
        this.logBoxEl.scrollTop = this.logBoxEl.scrollHeight;
    }

    formatTimeChrono(ms) {
        const sec = Math.floor(ms / 1000);
        const msec = Math.floor((ms % 1000) / 100);
        return `00:${sec < 10 ? '0' : ''}${sec}.${msec}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.GridDelver = new GridDelverEngine();
});