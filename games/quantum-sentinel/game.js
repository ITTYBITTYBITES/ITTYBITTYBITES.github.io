/**
 * QUANTUM SENTINEL: FAST SPATIAL REFLEX // GAME ENGINE
 * Highly optimized Phase 5 WebAssembly / JS module.
 */

class QuantumSentinelEngine {
    constructor() {
        this.score = 0;
        this.shields = 100;
        this.wave = 1;
        this.targetsCleared = 0;
        this.waveTargetCount = 20;

        // Ticker & Telemetry states
        this.isPaused = false;
        this.isGameOver = false;
        this.lastTargetSpawnTime = Date.now();
        this.interceptionHistoryBatch = [];
        this.totalInterceptions = 0;

        // Visual Canvas states
        this.canvas = null;
        this.ctx = null;
        this.activeTargets = [];
        this.particles = [];

        this.initDOMAnchors();
        this.initWebAudio();
        this.bindParentHandshake();
        this.mountCanvasTheater();
        this.startExecutionLoop();
    }

    initDOMAnchors() {
        this.scoreEl = document.getElementById('stat-score');
        this.shieldsEl = document.getElementById('stat-shields');
        this.waveEl = document.getElementById('stat-wave');
        this.logBoxEl = document.getElementById('tactical-log-box');
    }

    initWebAudio() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn("Web Audio API not supported in this sandbox mode.");
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
            case 'hit':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now); // A5
                osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1); // A6
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;

            case 'fault':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
                gain.gain.setValueAtTime(0.35, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;

            case 'wave':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
                osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
                osc.frequency.setValueAtTime(1046.50, now + 0.36); // C6
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                osc.start(now);
                osc.stop(now + 0.6);
                break;
        }
    }

    bindParentHandshake() {
        // Phase 2 Cascade Waterfall Handshake Listener
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === "ARCADE_AD_COMPLETE") {
                this.resumeAfterInterruption();
            }
        });
    }

    mountCanvasTheater() {
        const wrapper = document.getElementById('quantum-canvas-wrapper');
        if (!wrapper) return;
        wrapper.innerHTML = '';

        this.canvas = document.createElement('canvas');
        this.canvas.width = 1000;
        this.canvas.height = 625;
        this.ctx = this.canvas.getContext('2d');
        wrapper.appendChild(this.canvas);

        // Bind interactive target interception
        this.canvas.addEventListener('pointerdown', (e) => {
            try { e.target.setPointerCapture(e.pointerId); } catch(err){} e.preventDefault(); this.handleReticleInterception(e); });
        this.canvas.style.touchAction = 'none';

        // Spawn initial targets
        this.activeTargets = [];
        this.spawnTargetReticle();
        this.appendLogEntry(`Initialized Quantum Sentinel // Wave ${this.wave}`, 'wave');
    }

    spawnTargetReticle() {
        if (this.isPaused || this.isGameOver) return;

        const margin = 50;
        const x = margin + Math.random() * (this.canvas.width - margin * 2);
        const y = margin + Math.random() * (this.canvas.height - margin * 2);
        
        // Duration implodes faster at higher waves
        const lifespanMs = Math.max(700, 1600 - (this.wave * 120));

        this.activeTargets.push({
            id: `QT_${Math.random().toString(36).substring(2,7).toUpperCase()}`,
            x: x,
            y: y,
            radius: 22,
            spawnTime: Date.now(),
            lifespanMs: lifespanMs
        });
    }

    startExecutionLoop() {
        const loop = () => {
            if (!this.isPaused && !this.isGameOver && this.ctx) {
                this.updateExecutionTheater();
                this.renderVisualsTheater();
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    updateExecutionTheater() {
        const now = Date.now();

        // Spawn new targets if needed
        if (this.activeTargets.length < Math.min(4, 1 + Math.floor(this.wave / 2))) {
            if (now - this.lastTargetSpawnTime > Math.max(400, 1200 - this.wave * 100)) {
                this.spawnTargetReticle();
                this.lastTargetSpawnTime = now;
            }
        }

        // Process expiring targets
        for (let i = this.activeTargets.length - 1; i >= 0; i--) {
            const t = this.activeTargets[i];
            const elapsed = now - t.spawnTime;

            if (elapsed >= t.lifespanMs) {
                // Interception Fault — Implosion damage
                this.shields -= 15;
                this.playAudioTone('fault');
                this.createExplosionParticles(t.x, t.y, '#f43f5e');
                this.appendLogEntry(`Target Implosion Fault! Shields -15%`, 'fault');
                this.activeTargets.splice(i, 1);

                if (this.shields <= 0) {
                    this.executeSystemTerminated("SHIELD CAPACITY EXHAUSTED — CORE CRASH");
                }
                this.updateStatsHUD();
            }
        }

        // Process physics particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx; p.y += p.vy;
            p.alpha -= 0.03;
            if (p.alpha <= 0) this.particles.splice(i, 1);
        }
    }

    renderVisualsTheater() {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);

        // Tactical coordinate radar lines
        this.ctx.strokeStyle = '#0f172a';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width/2, 0); this.ctx.lineTo(this.canvas.width/2, this.canvas.height);
        this.ctx.moveTo(0, this.canvas.height/2); this.ctx.lineTo(this.canvas.width, this.canvas.height/2);
        this.ctx.stroke();

        // Render active target reticles
        const now = Date.now();
        this.activeTargets.forEach(t => {
            const elapsed = now - t.spawnTime;
            const pct = elapsed / t.lifespanMs;

            // Outer Threat Radar Ring
            this.ctx.strokeStyle = pct > 0.75 ? '#f43f5e' : '#facc15';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, t.radius + 15 - (pct * 15), 0, Math.PI * 2);
            this.ctx.stroke();

            // Core Reticle Node
            this.ctx.fillStyle = '#22d3ee';
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Inner Hex Identifier
            this.ctx.fillStyle = '#020617';
            this.ctx.font = 'bold 9px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(t.id, t.x, t.y + 3);
        });

        // Render visual particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
            this.ctx.globalAlpha = 1.0;
        });
    }

    handleReticleInterception(e) {
        if (this.isPaused || this.isGameOver || !this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;
        const clickTime = Date.now();

        // Check active targets
        let hitFound = false;

        for (let i = this.activeTargets.length - 1; i >= 0; i--) {
            const t = this.activeTargets[i];
            const dist = Math.hypot(clickX - t.x, clickY - t.y);

            if (dist <= t.radius + 14) {
                // Successful Target Interception! Compute accurate thinking T_delta
                const thinkingDeltaMs = clickTime - t.spawnTime;
                this.score += Math.floor(100 * (1 - (thinkingDeltaMs / t.lifespanMs)));
                this.targetsCleared++;
                this.totalInterceptions++;
                hitFound = true;

                this.playAudioTone('hit');
                this.createExplosionParticles(t.x, t.y, '#22d3ee');
                this.appendLogEntry(`Target Ingested! Latency: ${thinkingDeltaMs}ms`, 'hit');
                this.activeTargets.splice(i, 1);

                // Track & Stream Phase 5 AI Telemetry
                this.logTurnTelemetryPacket(t.x, t.y, thinkingDeltaMs);

                // Check for Wave Completion
                if (this.targetsCleared >= this.waveTargetCount) {
                    this.executeWaveCompleted();
                }
                break;
            }
        }

        if (!hitFound) {
            // Misfire Execution Fault
            this.shields = Math.max(0, this.shields - 5);
            this.playAudioTone('fault');
            this.appendLogEntry(`Spatial Misfire Fault! Shields -5%`, 'fault');
            if (this.shields <= 0) this.executeSystemTerminated("SHIELD DEPLETION — FATAL CORE DESYNC");
        }

        this.updateStatsHUD();
    }

    createExplosionParticles(px, py, hexColor) {
        for (let i = 0; i < 18; i++) {
            this.particles.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: 2 + Math.random() * 3,
                color: hexColor,
                alpha: 1.0
            });
        }
    }

    executeWaveCompleted() {
        this.playAudioTone('wave');
        this.wave++;
        this.targetsCleared = 0;
        this.shields = Math.min(100, this.shields + 25); // Restore shields
        this.appendLogEntry(`Wave Cleared! Advancing to Wave ${this.wave} (+25% Shields)`, 'wave');

        // Execute Phase 2 Asynchronous Waterfall Interstitial Handshake
        this.triggerPhase2AdHandshake('interstitial');
    }

    triggerPhase2AdHandshake(type) {
        this.isPaused = true;
        if (this.audioCtx) this.audioCtx.suspend();

        console.log(`🚀 [AD HOOK] Suspending Quantum Sentinel tickers and Web Audio. Halting for ${type} network bridge...`);
        window.parent.postMessage({ type: "ARCADE_TRIGGER_AD", adType: type }, "*");
    }

    resumeAfterInterruption() {
        this.isPaused = false;
        if (this.audioCtx) this.audioCtx.resume();
        console.log("🚀 [AD HOOK CONFIRMED] Asynchronous handshake received from Parent Hub. Resuming Quantum Sentinel execution loop...");

        if (this.shields <= 0) {
            this.showEndgameModalDOM();
        } else {
            this.activeTargets = [];
            this.spawnTargetReticle();
        }
    }

    executeSystemTerminated(cause) {
        this.shields = 0;
        this.isGameOver = true;
        this.isPaused = true;
        this.updateStatsHUD();
        this.appendLogEntry(`TERMINATED: ${cause}`, 'fault');

        // Execute Endgame Interstitial Hook
        this.triggerPhase2AdHandshake('endgame_interstitial');
    }

    showEndgameModalDOM() {
        const wrapper = document.getElementById('quantum-canvas-wrapper');
        if (!wrapper) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay font-mono';
        modal.innerHTML = `
            <div class="modal-card">
                <span class="text-rose-500 text-5xl mb-4 block">💀</span>
                <h2 class="modal-title defeat">SYSTEM BREACHED</h2>
                <p class="modal-msg">Quantum degradation window uncalibrated at **Wave ${this.wave}**.<br>Total Interceptions: **${this.totalInterceptions}**</p>
                
                <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 flex justify-around text-slate-300 font-mono text-xs">
                    <div><span>FINAL SCORE</span><br><span class="text-gold font-bold text-base mt-1 block">◈ ${this.score}</span></div>
                    <div><span>WAVES CLEARED</span><br><span class="text-cyan-400 font-bold text-base mt-1 block">${this.wave - 1}</span></div>
                </div>

                <button id="sentinel-reboot-btn" class="btn-tactical">
                    Mount New Operative Stream &rarr;
                </button>
            </div>
        `;

        wrapper.appendChild(modal);

        document.getElementById('sentinel-reboot-btn').addEventListener('click', () => {
            this.score = 0;
            this.shields = 100;
            this.wave = 1;
            this.targetsCleared = 0;
            this.isGameOver = false;
            this.isPaused = false;
            this.mountCanvasTheater();
        });
    }

    // Phase 5 Granular AI Telemetry Batch Hub
    logTurnTelemetryPacket(tx, ty, latencyMs) {
        const packet = {
            moveIdx: this.totalInterceptions,
            playerState: { score: this.score, shields: this.shields, wave: this.wave },
            selectedCoord: { x: Math.floor(tx), y: Math.floor(ty) },
            thinkingDeltaMs: latencyMs
        };

        this.interceptionHistoryBatch.push(packet);

        if (this.interceptionHistoryBatch.length >= 5) {
            console.log("🚀 [TELEMETRY BATCH] Ingesting 5-interception Quantum latency batch upwards...");
            window.parent.postMessage({
                type: "ARCADE_TELEMETRY_STREAM",
                payload: {
                    timestamp: Date.now(),
                    moves: [...this.interceptionHistoryBatch]
                }
            }, "*");
            this.interceptionHistoryBatch = [];
        }
    }

    updateStatsHUD() {
        if (this.scoreEl) this.scoreEl.textContent = `${this.score}`;
        if (this.shieldsEl) this.shieldsEl.textContent = `${this.shields}%`;
        if (this.waveEl) this.waveEl.textContent = `${this.wave}`;
    }

    appendLogEntry(txt, theme) {
        if (!this.logBoxEl) return;

        const el = document.createElement('div');
        el.className = `log-entry ${theme}`;
        el.textContent = `◈ ${txt}`;

        this.logBoxEl.appendChild(el);
        this.logBoxEl.scrollTop = this.logBoxEl.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.QuantumSentinel = new QuantumSentinelEngine();
});