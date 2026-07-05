/* ============================================
   Two Second Witness — Core Demo Engine
   Phase 3 Playable System Layer (Vanilla JS)
   ============================================ */

(function () {
  'use strict';

  var engineState = {
    currentScenarioIndex: 0,
    activeScenario: null,
    phase: 'IDLE', // IDLE | COUNTDOWN | OBSERVING | TRANSITION | SELECTING | RESULT
    countdownTimer: null,
    observationTimer: null,
    transitionTimer: null,
    observationStartTime: 0,
    selectionStartTime: 0,
    reactionTime: 0,
    selectedOptionId: null,
    isCorrect: false
  };

  var rootEl = null;

  function initDemoEngine(containerId, initialWorldId) {
    rootEl = document.getElementById(containerId);
    if (!rootEl) return;

    // Check if initialWorldId was passed or in URL query
    var targetWorld = initialWorldId;
    if (!targetWorld && window.location.search) {
      var params = new URLSearchParams(window.location.search);
      targetWorld = params.get('world');
    }

    var scenarios = window.DemoScenarios || [];
    if (scenarios.length === 0) {
      rootEl.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:2rem;">No demo scenarios loaded.</p>';
      return;
    }

    if (targetWorld) {
      for (var i = 0; i < scenarios.length; i++) {
        if (scenarios[i].worldId === targetWorld) {
          engineState.currentScenarioIndex = i;
          break;
        }
      }
    }

    // Attach global keyboard listener for selection phase (1-4 keys)
    document.addEventListener('keydown', handleKeyboardSelection);

    renderWelcomeScreen();
  }

  function handleKeyboardSelection(e) {
    if (engineState.phase !== 'SELECTING' || !engineState.activeScenario) return;
    var key = e.key;
    var index = -1;
    if (key === '1') index = 0;
    else if (key === '2') index = 1;
    else if (key === '3') index = 2;
    else if (key === '4') index = 3;

    if (index >= 0 && index < engineState.activeScenario.options.length) {
      selectOption(engineState.activeScenario.options[index].id);
    }
  }

  function renderWelcomeScreen() {
    engineState.phase = 'IDLE';
    var scenarios = window.DemoScenarios;
    var scenario = scenarios[engineState.currentScenarioIndex];

    var html = `
      <div class="card demo-card" style="border-color: var(--accent-cyan); box-shadow: 0 0 30px rgba(0,229,255,0.15);">
        <div class="flex flex-between" style="margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <span class="status-text" style="color: var(--accent-cyan); letter-spacing: 0.15em;">INTERACTIVE TRIAL SYSTEM</span>
          <span style="font-size: 0.8rem; background: rgba(0,229,255,0.1); padding: 0.25rem 0.75rem; border-radius: 999px; color: var(--accent-cyan); border: 1px solid rgba(0,229,255,0.2);">Difficulty Tier ${scenario.difficulty}</span>
        </div>
        
        <h2 class="h2" style="margin-bottom: 0.5rem;">${scenario.name}</h2>
        <p class="text-lead" style="font-size: 1rem; margin-bottom: 1.5rem;">Biome: <strong style="color:var(--text-primary);">${scenario.world}</strong></p>
        
        <div style="background: rgba(5,5,16,0.8); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.25rem; margin-bottom: 1.75rem;">
          <h3 class="h3" style="font-size: 1rem; color: var(--accent-cyan); margin-bottom: 0.5rem;">Trial Protocol:</h3>
          <ul style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.7; margin-left: 1.25rem;">
            <li>A 3-second countdown will prepare your focus.</li>
            <li>The visual scene will appear for <strong>exactly 2 seconds (2000ms)</strong>.</li>
            <li>During the blackout transition, one critical detail will change.</li>
            <li>Identify the anomaly as quickly and accurately as possible.</li>
          </ul>
        </div>

        <div class="flex flex-between" style="align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <label for="scenarioSelect" style="font-size: 0.85rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Select Scenario Biome:</label>
            <select id="scenarioSelect" style="background: var(--bg-deep); color: var(--text-primary); border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer;">
              ${scenarios.map(function(s, idx) {
                return `<option value="${idx}" ${idx === engineState.currentScenarioIndex ? 'selected' : ''}>${s.world} — ${s.name}</option>`;
              }).join('')}
            </select>
          </div>
          
          <button id="startTrialBtn" class="btn btn-primary" style="padding: 0.85rem 2.5rem; font-size: 1.05rem;">
            Launch Trial &#9654;
          </button>
        </div>
      </div>
    `;

    rootEl.innerHTML = html;

    var selectEl = document.getElementById('scenarioSelect');
    if (selectEl) {
      selectEl.addEventListener('change', function(e) {
        engineState.currentScenarioIndex = parseInt(e.target.value, 10);
        renderWelcomeScreen();
      });
    }

    var startBtn = document.getElementById('startTrialBtn');
    if (startBtn) {
      startBtn.addEventListener('click', function() {
        startCountdown();
      });
    }
  }

  function startCountdown() {
    engineState.phase = 'COUNTDOWN';
    engineState.activeScenario = window.DemoScenarios[engineState.currentScenarioIndex];
    var count = 3;

    function renderCount() {
      rootEl.innerHTML = `
        <div class="card demo-card flex flex-center" style="min-height: 380px; text-align: center; border-color: var(--accent-cyan);">
          <span class="status-text" style="color: var(--text-muted); margin-bottom: 1rem;">GET READY &mdash; PREPARE VISUAL FOCUS</span>
          <div style="font-size: clamp(4rem, 15vw, 7rem); font-weight: 800; color: var(--accent-cyan); filter: drop-shadow(0 0 30px var(--glow-cyan)); line-height: 1;">
            ${count > 0 ? count : 'WITNESS'}
          </div>
          <p style="color: var(--text-secondary); margin-top: 1.5rem; font-size: 0.95rem;">
            ${engineState.activeScenario.promptText}
          </p>
        </div>
      `;
    }

    renderCount();

    engineState.countdownTimer = setInterval(function() {
      count--;
      if (count > 0) {
        renderCount();
      } else if (count === 0) {
        renderCount();
      } else {
        clearInterval(engineState.countdownTimer);
        startObservationPhase();
      }
    }, 1000);
  }

  function startObservationPhase() {
    engineState.phase = 'OBSERVING';
    var scenario = engineState.activeScenario;
    engineState.observationStartTime = performance.now();

    rootEl.innerHTML = `
      <div class="card demo-card" style="padding: 1.25rem; border-color: var(--accent-cyan); box-shadow: 0 0 25px rgba(0,229,255,0.2);">
        <div class="flex flex-between" style="margin-bottom: 0.75rem; align-items: center;">
          <span class="status-text" style="color: var(--accent-cyan); font-size: 0.8rem;">OBSERVATION PHASE (2.0 SECONDS)</span>
          <span style="font-family: monospace; color: var(--accent-cyan); font-weight: bold; font-size: 0.9rem;">MEMORIZE DETAILS</span>
        </div>
        
        <!-- Progress Bar -->
        <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 1rem;">
          <div id="observationProgress" style="width: 100%; height: 100%; background: linear-gradient(90deg, var(--accent-cyan), var(--accent-purple)); transition: width 2000ms linear;"></div>
        </div>

        <div style="width: 100%; min-height: 320px; display: flex; align-items: center; justify-content: center; background: #050510; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
          ${scenario.sceneA}
        </div>
      </div>
    `;

    // Trigger CSS transition on next tick
    setTimeout(function() {
      var prog = document.getElementById('observationProgress');
      if (prog) prog.style.width = '0%';
    }, 20);

    engineState.observationTimer = setTimeout(function() {
      startFadeTransition();
    }, 2000); // EXACTLY 2000ms
  }

  function startFadeTransition() {
    engineState.phase = 'TRANSITION';

    rootEl.innerHTML = `
      <div class="card demo-card flex flex-center" style="min-height: 400px; background: #020208; border-color: rgba(255,255,255,0.05); text-align: center;">
        <div class="pulse-dot" style="margin-bottom: 1rem; width: 12px; height: 12px;"></div>
        <span class="status-text" style="color: var(--text-muted); letter-spacing: 0.2em;">SCENE SHIFTING...</span>
      </div>
    `;

    engineState.transitionTimer = setTimeout(function() {
      startSelectionPhase();
    }, 400); // 400ms transition blackout
  }

  function startSelectionPhase() {
    engineState.phase = 'SELECTING';
    var scenario = engineState.activeScenario;
    engineState.selectionStartTime = performance.now();

    var html = `
      <div class="card demo-card" style="padding: 1.25rem; border-color: var(--accent-purple); box-shadow: 0 0 25px rgba(168,85,247,0.2);">
        <div class="flex flex-between" style="margin-bottom: 0.75rem; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <span class="status-text" style="color: var(--accent-purple); font-size: 0.8rem;">TESTIMONY PHASE &mdash; SELECT ANOMALY</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Use mouse or press <kbd style="background:#1e293b; padding:0.15rem 0.4rem; border-radius:4px; border:1px solid #334155;">1</kbd>-<kbd style="background:#1e293b; padding:0.15rem 0.4rem; border-radius:4px; border:1px solid #334155;">4</kbd></span>
        </div>

        <div style="width: 100%; min-height: 280px; display: flex; align-items: center; justify-content: center; background: #050510; border-radius: 8px; overflow: hidden; margin-bottom: 1.25rem; border: 1px solid rgba(255,255,255,0.05);">
          ${scenario.sceneB}
        </div>

        <h3 class="h3" style="font-size: 1.05rem; margin-bottom: 0.75rem; color: var(--text-primary);">What changed from the initial 2-second flash?</h3>
        
        <div class="grid" style="gap: 0.6rem;">
          ${scenario.options.map(function(opt, idx) {
            return `
              <button class="btn btn-outline demo-option-btn" data-option-id="${opt.id}" style="justify-content: flex-start; text-align: left; padding: 0.8rem 1.2rem; font-size: 0.95rem; border-color: rgba(255,255,255,0.12); width: 100%;">
                <span style="color: var(--accent-cyan); font-weight: bold; margin-right: 0.5rem;">[${idx + 1}]</span> ${opt.label}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    rootEl.innerHTML = html;

    var btns = rootEl.querySelectorAll('.demo-option-btn');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        selectOption(btn.getAttribute('data-option-id'));
      });
    });
  }

  function selectOption(optionId) {
    if (engineState.phase !== 'SELECTING') return;
    engineState.reactionTime = Math.round(performance.now() - engineState.selectionStartTime);
    engineState.selectedOptionId = optionId;
    engineState.isCorrect = (optionId === engineState.activeScenario.correctAnswerId);
    
    renderResultScreen();
  }

  function renderResultScreen() {
    engineState.phase = 'RESULT';
    var scenario = engineState.activeScenario;
    var isCorrect = engineState.isCorrect;
    var timeMs = engineState.reactionTime;

    var rating = 'Keep Practicing';
    var ratingColor = '#ef4444';
    if (isCorrect) {
      if (timeMs <= 2200) {
        rating = 'Master Witness';
        ratingColor = '#00e5ff';
      } else {
        rating = 'Sharp Observer';
        ratingColor = '#a855f7';
      }
    }

    var score = isCorrect ? Math.max(1000 + Math.floor((5000 - timeMs) / 4), 500) : 0;

    var html = `
      <div class="card demo-card" style="border-color: ${isCorrect ? 'var(--accent-cyan)' : '#ef4444'}; box-shadow: 0 0 35px ${isCorrect ? 'rgba(0,229,255,0.2)' : 'rgba(239,68,68,0.2)'}; text-align: center; padding: 2rem 1.5rem;">
        <div style="display:inline-block; font-size: 3rem; margin-bottom: 0.75rem;">
          ${isCorrect ? '&#10004;' : '&#10008;'}
        </div>
        
        <h2 class="h1" style="color: ${isCorrect ? 'var(--text-primary)' : '#ef4444'}; margin-bottom: 0.5rem;">
          ${isCorrect ? 'Testimony Verified' : 'Inaccurate Testimony'}
        </h2>
        
        <div style="display: inline-block; background: rgba(255,255,255,0.05); border: 1px solid ${ratingColor}; color: ${ratingColor}; font-weight: 800; font-size: 1.1rem; padding: 0.4rem 1.2rem; border-radius: 999px; letter-spacing: 0.08em; margin-bottom: 1.5rem;">
          RATING: ${rating.toUpperCase()}
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-3" style="gap: 1rem; max-width: 600px; margin: 0 auto 1.75rem;">
          <div style="background: rgba(5,5,16,0.6); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">REACTION SPEED</span>
            <span style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">${(timeMs / 1000).toFixed(2)}s</span>
            <span style="font-size: 0.75rem; color: var(--accent-cyan); display: block;">(${timeMs} ms)</span>
          </div>

          <div style="background: rgba(5,5,16,0.6); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">ACCURACY</span>
            <span style="font-size: 1.5rem; font-weight: 800; color: ${isCorrect ? '#10b981' : '#ef4444'};">${isCorrect ? '100%' : '0%'}</span>
            <span style="font-size: 0.75rem; color: var(--text-secondary); display: block;">Single Trial</span>
          </div>

          <div style="background: rgba(5,5,16,0.6); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">COGNITIVE SCORE</span>
            <span style="font-size: 1.5rem; font-weight: 800; color: var(--accent-purple);">${score}</span>
            <span style="font-size: 0.75rem; color: var(--text-secondary); display: block;">PTS</span>
          </div>
        </div>

        <!-- Anomaly Explanation -->
        <div style="background: rgba(15,15,35,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1.25rem; max-width: 640px; margin: 0 auto 2rem; text-align: left;">
          <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 0.35rem;">FORENSIC ANOMALY REPORT:</span>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">
            ${scenario.changedElementDescription}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-center gap-md" style="flex-wrap: wrap;">
          <button id="retryBtn" class="btn btn-primary">
            Retry Scenario &#8635;
          </button>
          <button id="nextScenarioBtn" class="btn btn-outline">
            Next Scenario &#9658;
          </button>
          <a href="worlds.html" class="btn btn-outline" style="text-decoration:none;">
            Return to Biomes
          </a>
        </div>
      </div>
    `;

    rootEl.innerHTML = html;

    var retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', function() {
        renderWelcomeScreen();
      });
    }

    var nextBtn = document.getElementById('nextScenarioBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        engineState.currentScenarioIndex = (engineState.currentScenarioIndex + 1) % window.DemoScenarios.length;
        renderWelcomeScreen();
      });
    }
  }

  // Export initialization API
  window.initTwoSecondDemo = initDemoEngine;

  // Auto-initialize if DOM ready and demo-root exists
  document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('demo-root')) {
      window.initTwoSecondDemo('demo-root');
    }
  });

})();
