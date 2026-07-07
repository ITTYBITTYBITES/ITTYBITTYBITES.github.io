import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';

interface SignalStats {
  found: number;
  missed: number;
  falsePositives: number;
  bestStreak: number;
  currentStreak: number;
  totalTimeMs: number;
  roundsPlayed: number;
}

const STORAGE_KEY = 'signal-detection-stats';

function loadStats(): SignalStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { found: 0, missed: 0, falsePositives: 0, bestStreak: 0, currentStreak: 0, totalTimeMs: 0, roundsPlayed: 0 };
}

function saveStats(stats: SignalStats): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch { /* ignore */ }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isSignal: boolean;
  phase: number;
  radius: number;
  id: number;
}

const signalDetection: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'signal-detection';
    wrapper.style.cssText = 'padding: 1rem; max-width: 640px; margin: 0 auto;';

    let stats = loadStats();
    let particles: Particle[] = [];
    let running = false;
    let roundStart = 0;
    let foundThisRound = 0;
    let signalsThisRound = 0;
    let animationId = 0;
    let roundTimeout = 0;

    const title = document.createElement('h2');
    title.textContent = 'Signal Detection';

    const desc = document.createElement('p');
    desc.className = 'lead';
    desc.textContent = 'Find the particles that move with purpose. Ignore the noise.';

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 360;
    canvas.style.cssText = 'width:100%;max-width:600px;height:auto;border:1px solid ButtonBorder;border-radius:0.25rem;background:#0a0a0a;cursor:crosshair;touch-action:none;display:block;';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Signal detection field. Click or tap particles that move in coherent patterns.');

    const ctx = canvas.getContext('2d')!;

    const status = document.createElement('div');
    status.className = 'signal-status';
    status.style.cssText = 'display:flex;gap:1rem;flex-wrap:wrap;margin:0.75rem 0;font-size:0.875rem;';

    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;gap:0.5rem;flex-wrap:wrap;margin:0.5rem 0;';

    const startBtn = document.createElement('button');
    startBtn.className = 'btn primary';
    startBtn.textContent = 'Start Round';

    const statsEl = document.createElement('div');
    statsEl.className = 'signal-stats';
    statsEl.style.cssText = 'margin-top:0.75rem;padding:0.75rem;border:1px solid ButtonBorder;border-radius:0.25rem;background:ButtonFace;';

    function renderStats() {
      statsEl.innerHTML = `
        <div style="display:flex;gap:1rem;flex-wrap:wrap;font-size:0.875rem;">
          <span>Found: <strong>${stats.found}</strong></span>
          <span>Missed: <strong>${stats.missed}</strong></span>
          <span>False alarms: <strong>${stats.falsePositives}</strong></span>
          <span>Best streak: <strong>${stats.bestStreak}</strong></span>
          <span>Rounds: <strong>${stats.roundsPlayed}</strong></span>
        </div>
      `;
    }

    function spawnParticles(signalCount: number, noiseCount: number) {
      particles = [];
      let id = 0;
      for (let i = 0; i < signalCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0, vy: 0,
          isSignal: true,
          phase: Math.random() * Math.PI * 2,
          radius: 3 + Math.random() * 2,
          id: id++
        });
      }
      for (let i = 0; i < noiseCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 1.2;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          isSignal: false,
          phase: 0,
          radius: 2 + Math.random() * 2,
          id: id++
        });
      }
    }

    function updateParticles() {
      const time = Date.now() / 1000;
      particles.forEach(p => {
        if (p.isSignal) {
          const freq = 0.5 + Math.sin(p.phase) * 0.3;
          p.vx = Math.cos(time * freq + p.phase) * 0.8;
          p.vy = Math.sin(time * freq + p.phase * 1.3) * 0.8;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x += canvas.width;
        if (p.x > canvas.width) p.x -= canvas.width;
        if (p.y < 0) p.y += canvas.height;
        if (p.y > canvas.height) p.y -= canvas.height;
      });
    }

    function drawParticles() {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        if (p.isSignal) {
          ctx.fillStyle = '#4ade80';
          ctx.shadowColor = '#4ade80';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = '#64748b';
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    function loop() {
      if (!running) return;
      updateParticles();
      drawParticles();
      animationId = requestAnimationFrame(loop);
    }

    function startRound() {
      if (running) return;
      running = true;
      foundThisRound = 0;
      const difficulty = Math.min(5, 1 + Math.floor(stats.roundsPlayed / 3));
      signalsThisRound = 2 + difficulty;
      const noise = 25 + difficulty * 8;
      spawnParticles(signalsThisRound, noise);
      roundStart = Date.now();
      status.textContent = `Find ${signalsThisRound} signals hiding in ${noise} particles.`;
      startBtn.textContent = 'Round in progress…';
      startBtn.disabled = true;
      loop();
      roundTimeout = window.setTimeout(() => {
        endRound(false);
      }, 15000 + difficulty * 2000);
    }

    function endRound(completed: boolean) {
      running = false;
      cancelAnimationFrame(animationId);
      clearTimeout(roundTimeout);
      const elapsed = Date.now() - roundStart;
      stats.totalTimeMs += elapsed;
      stats.roundsPlayed += 1;

      const missed = signalsThisRound - foundThisRound;
      stats.missed += missed;
      if (missed === 0 && foundThisRound === signalsThisRound) {
        stats.currentStreak += 1;
        stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
      } else {
        stats.currentStreak = 0;
      }
      saveStats(stats);
      renderStats();
      startBtn.textContent = 'Start Round';
      startBtn.disabled = false;
      status.textContent = completed
        ? `Round complete! Found ${foundThisRound}/${signalsThisRound} signals.`
        : `Time's up. Found ${foundThisRound}/${signalsThisRound} signals.`;

      events.emit('experience_interaction', {
        experience_id: context.meta.id,
        action: 'round_complete',
        found: foundThisRound,
        total: signalsThisRound,
        streak: stats.currentStreak
      });
    }

    function handleInput(clientX: number, clientY: number) {
      if (!running) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      let hit = false;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const dx = x - p.x;
        const dy = y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 12) {
          hit = true;
          if (p.isSignal) {
            foundThisRound += 1;
            stats.found += 1;
            particles.splice(i, 1);
            if (foundThisRound >= signalsThisRound) {
              endRound(true);
            }
          } else {
            stats.falsePositives += 1;
            particles.splice(i, 1);
          }
          break;
        }
      }
      if (!hit) {
        stats.falsePositives += 1;
      }
      saveStats(stats);
      renderStats();
    }

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handleInput(e.clientX, e.clientY);
    });

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      handleInput(t.clientX, t.clientY);
    }, { passive: false });

    startBtn.addEventListener('click', startRound);

    controls.appendChild(startBtn);
    wrapper.append(title, desc, canvas, controls, status, statsEl);
    container.appendChild(wrapper);

    renderStats();
    drawParticles();

    return () => {
      running = false;
      cancelAnimationFrame(animationId);
      clearTimeout(roundTimeout);
    };
  }
};

export default signalDetection;
