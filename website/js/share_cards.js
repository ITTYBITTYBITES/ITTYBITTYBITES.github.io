/* ============================================
   Two Second Witness — Share Cards & Viral Loop
   Phase 4 Shareable Result System (Vanilla JS)
   ============================================ */

(function () {
  'use strict';

  // --- 1. Check for Challenger Query Params on Load ---
  document.addEventListener('DOMContentLoaded', function () {
    if (!window.location.search) return;
    var params = new URLSearchParams(window.location.search);
    var challengeId = params.get('challenge');
    var challengerScore = params.get('score');
    var challengerTime = params.get('time');

    if (challengeId && (challengerScore || challengerTime)) {
      renderChallengerBanner(challengeId, challengerScore, challengerTime);
    }

    // Start monitoring demo-root for result screen
    monitorDemoResults();
  });

  function renderChallengerBanner(scenarioId, score, timeMs) {
    var root = document.getElementById('demo-root');
    if (!root) return;

    var timeText = timeMs ? (parseInt(timeMs, 10) / 1000).toFixed(2) + 's' : '2.10s';
    var banner = document.createElement('div');
    banner.className = 'card';
    banner.style.borderColor = 'var(--accent-purple)';
    banner.style.background = 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(5,5,16,0.9))';
    banner.style.marginBottom = '1.5rem';
    banner.style.padding = '1.25rem';

    banner.innerHTML = `
      <div class="flex flex-between" style="align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="status-text" style="color: var(--accent-purple); font-size: 0.75rem; letter-spacing: 0.15em;">GHOST CHALLENGE ACTIVE</span>
          <h3 class="h3" style="font-size: 1.15rem; margin-top: 0.25rem;">Beat Your Challenger's Record!</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Challenger Testimony Speed: <strong style="color: var(--accent-cyan);">${timeText}</strong> | Accuracy: <strong style="color:#10b981;">100%</strong>
          </p>
        </div>
        <div style="background: rgba(168,85,247,0.2); border: 1px solid var(--accent-purple); padding: 0.5rem 1rem; border-radius: 999px; font-size: 0.85rem; font-weight: bold; color: var(--text-primary);">
          Target Time &le; ${timeText}
        </div>
      </div>
    `;

    root.parentNode.insertBefore(banner, root);
  }

  // --- 2. Observe Result Screen Injection ---
  function monitorDemoResults() {
    var root = document.getElementById('demo-root');
    if (!root) return;

    var observer = new MutationObserver(function () {
      // Check if result card is rendered
      var resultCard = root.querySelector('.demo-card');
      if (resultCard && resultCard.innerHTML.indexOf('RATING:') !== -1 && !root.querySelector('#shareCardContainer')) {
        injectShareSystem(resultCard);
      }
    });

    observer.observe(root, { childList: true, subtree: true });
  }

  function injectShareSystem(resultCard) {
    // Extract metrics from result card
    var ratingEl = resultCard.querySelector('div[style*="border-radius: 999px"]');
    var ratingText = ratingEl ? ratingEl.textContent.replace('RATING:', '').trim() : 'SHARP OBSERVER';
    
    var timeEl = resultCard.querySelector('span[style*="font-size: 1.5rem"]');
    var timeText = timeEl ? timeEl.textContent.trim() : '2.00s';
    
    var isCorrect = resultCard.innerHTML.indexOf('Testimony Verified') !== -1;
    var accuracyText = isCorrect ? '100%' : '0%';

    var selectEl = document.getElementById('scenarioSelect');
    var scenarioName = selectEl && selectEl.options[selectEl.selectedIndex] ? selectEl.options[selectEl.selectedIndex].text : 'Ancient Egypt — Pharaoh Chamber Trial';

    var container = document.createElement('div');
    container.id = 'shareCardContainer';
    container.style.marginTop = '2rem';
    container.style.paddingTop = '1.75rem';
    container.style.borderTop = '1px dashed rgba(0, 229, 255, 0.2)';
    container.style.textAlign = 'center';

    container.innerHTML = `
      <span class="status-text" style="color: var(--accent-cyan); font-size: 0.75rem; letter-spacing: 0.15em; display:block; margin-bottom: 0.75rem;">VIRAL TRANSMISSION LAYER</span>
      <h3 class="h3" style="font-size: 1.2rem; margin-bottom: 1rem;">Share Your Testimony Record</h3>
      
      <!-- HTML Share Card Preview -->
      <div id="visualShareCard" style="background: linear-gradient(135deg, #0a0a1a, #15102a); border: 2px solid var(--accent-cyan); border-radius: 12px; padding: 1.5rem; max-width: 480px; margin: 0 auto 1.5rem; text-align: left; position: relative; overflow: hidden; box-shadow: 0 0 25px rgba(0,229,255,0.15);">
        <div style="position:absolute; top:0; right:0; width:120px; height:120px; background:radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 70%); pointer-events:none;"></div>
        <div style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 800; letter-spacing: 0.15em; margin-bottom: 0.35rem;">TWO SECOND WITNESS // FORENSIC RECORD</div>
        <h4 style="font-size: 1.35rem; color: #fff; font-weight: 800; margin-bottom: 0.75rem;">${ratingText}</h4>
        
        <div style="background: rgba(5,5,16,0.6); padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); display:flex; justify-content: space-between; margin-bottom: 0.85rem;">
          <div>
            <span style="font-size: 0.7rem; color: #94a3b8; display: block;">REACTION SPEED</span>
            <span style="font-size: 1.25rem; color: var(--accent-cyan); font-weight: bold; font-family: monospace;">${timeText}</span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 0.7rem; color: #94a3b8; display: block;">ACCURACY</span>
            <span style="font-size: 1.25rem; color: ${isCorrect ? '#10b981' : '#ef4444'}; font-weight: bold; font-family: monospace;">${accuracyText}</span>
          </div>
        </div>

        <div style="font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.75rem;">
          Trial Biome: <strong>${scenarioName}</strong>
        </div>
        <div style="font-size: 0.75rem; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem;">
          Can you trust what you just saw? &rarr; <span style="color: var(--accent-cyan);">twosecondwitness.com</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-center gap-sm" style="flex-wrap: wrap;">
        <button id="copyResultBtn" class="btn btn-outline btn-sm">
          &#128203; Copy Result Text
        </button>
        <button id="downloadCardBtn" class="btn btn-outline btn-sm">
          &#128190; Download Image Card
        </button>
        <button id="challengeFriendBtn" class="btn btn-primary btn-sm" style="background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));">
          &#9876; Challenge a Friend
        </button>
      </div>
      <div id="shareStatusMsg" style="margin-top: 0.75rem; font-size: 0.85rem; color: var(--accent-cyan); min-height: 1.2rem;"></div>
    `;

    resultCard.appendChild(container);

    // Setup handlers
    var copyBtn = document.getElementById('copyResultBtn');
    var downloadBtn = document.getElementById('downloadCardBtn');
    var challengeBtn = document.getElementById('challengeFriendBtn');
    var statusMsg = document.getElementById('shareStatusMsg');

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = `I achieved ${ratingText} in Two Second Witness (${scenarioName}) with a reaction speed of ${timeText} (${accuracyText} accuracy)!\nCan you beat my visual memory? https://twosecondwitness.com/pages/scenarios.html`;
        if (typeof window.trackWitnessEvent === 'function') {
          window.trackWitnessEvent('share_card_generated', { type: 'text', rating: ratingText });
        }
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            showStatus('Testimony text copied to clipboard!');
          });
        } else {
          showStatus('Testimony ready to share: ' + text);
        }
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', function () {
        if (typeof window.trackWitnessEvent === 'function') {
          window.trackWitnessEvent('share_card_generated', { type: 'image_canvas', rating: ratingText });
        }
        exportCanvasCard(ratingText, timeText, accuracyText, scenarioName, isCorrect);
      });
    }

    if (challengeBtn) {
      challengeBtn.addEventListener('click', function () {
        var timeVal = timeText.replace('s', '').replace(' ms', '') * (timeText.indexOf('ms') !== -1 ? 1 : 1000);
        var challengeUrl = window.location.origin + window.location.pathname + '?challenge=trial_active&time=' + Math.round(timeVal) + '&score=' + ratingText;
        if (typeof window.trackWitnessEvent === 'function') {
          window.trackWitnessEvent('challenge_link_opened', { targetSpeed: timeText, rating: ratingText });
        }
        if (navigator.clipboard) {
          navigator.clipboard.writeText(challengeUrl).then(function () {
            showStatus('Viral Challenge Link copied! Send it to a friend.');
          });
        } else {
          showStatus('Challenge Link: ' + challengeUrl);
        }
      });
    }

    function showStatus(msg) {
      if (statusMsg) {
        statusMsg.textContent = msg;
        setTimeout(function () { statusMsg.textContent = ''; }, 4000);
      }
    }
  }

  function exportCanvasCard(rating, time, accuracy, scenario, isCorrect) {
    var canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    var ctx = canvas.getContext('2d');

    // Draw Dark Background
    var grad = ctx.createLinearGradient(0, 0, 640, 360);
    grad.addColorStop(0, '#050510');
    grad.addColorStop(1, '#15102a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 360);

    // Neon Border
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 632, 352);

    // Header
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('TWO SECOND WITNESS // FORENSIC TESTIMONY RECORD', 36, 48);

    // Rating
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(rating, 36, 105);

    // Metrics Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(36, 130, 568, 90);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(36, 130, 568, 90);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('REACTION SPEED', 60, 160);
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(time, 60, 198);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('ACCURACY', 380, 160);
    ctx.fillStyle = isCorrect ? '#10b981' : '#ef4444';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(accuracy, 380, 198);

    // Scenario details
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '16px sans-serif';
    ctx.fillText('Biome: ' + scenario, 36, 265);

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '14px monospace';
    ctx.fillText('Can you trust what you just saw? -> twosecondwitness.com', 36, 315);

    // Trigger Download
    var link = document.createElement('a');
    link.download = 'TwoSecondWitness_Record.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

})();
