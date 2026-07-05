/* ============================================
   Two Second Witness — Launch State Config
   Phase 6 Controlled Launch Activation Layer
   ============================================ */

(function () {
  'use strict';

  window.WITNESS_LAUNCH_CONFIG = {
    launchMode: true,
    trafficSourceTaggingEnabled: true,
    experimentFlags: {
      demo_ui_variant: "A",
      share_card_variant: "A",
      onboarding_variant: "minimal"
    }
  };

  window.__WITNESS_DEBUG = false; // Dev debug visibility flag

  // --- Source Tracking Initialization ---
  function initSourceTracking() {
    if (!window.WITNESS_LAUNCH_CONFIG.trafficSourceTaggingEnabled) return;
    try {
      if (window.location.search) {
        var params = new URLSearchParams(window.location.search);
        var src = params.get('src') || params.get('utm_source');
        if (src) {
          sessionStorage.setItem('trafficSource', src);
        }
      }
      if (!sessionStorage.getItem('trafficSource')) {
        sessionStorage.setItem('trafficSource', 'direct');
      }
    } catch (e) {}
  }

  // --- First-Session Experience Optimization ---
  function initFirstSessionOptimization() {
    try {
      var isFirstVisit = !localStorage.getItem('twosecondwitness_onboarded');
      if (isFirstVisit && window.WITNESS_LAUNCH_CONFIG.experimentFlags.onboarding_variant === 'minimal') {
        localStorage.setItem('twosecondwitness_onboarded', 'true');
        document.documentElement.classList.add('witness-first-visit');
      }
    } catch (e) {}
  }

  // --- Debug Visibility Mode Overlay ---
  function initDebugMode() {
    if (!window.__WITNESS_DEBUG) return;
    var devOverlay = document.createElement('div');
    devOverlay.id = 'witnessDevHUD';
    devOverlay.style.cssText = 'position:fixed; bottom:10px; left:10px; z-index:99999; background:rgba(0,0,0,0.9); border:1px solid #00e5ff; padding:10px 14px; border-radius:6px; font-family:monospace; font-size:11px; color:#00e5ff; pointer-events:none; line-height:1.5; box-shadow:0 0 10px rgba(0,229,255,0.3);';
    document.body.appendChild(devOverlay);

    setInterval(function() {
      if (!window.__WITNESS_DEBUG || !document.getElementById('witnessDevHUD')) return;
      var state = window.__engineDebugState || { phase: 'IDLE', time: 0, scenario: 'N/A', locked: false };
      devOverlay.innerHTML = `
        <div style="font-weight:bold; border-bottom:1px solid #00e5ff33; margin-bottom:4px;">WITNESS DEV HUD // PHASE 6</div>
        <div>PHASE: <span style="color:#fff;">${state.phase}</span></div>
        <div>SCENARIO: <span style="color:#fff;">${state.scenario}</span></div>
        <div>TIMING: <span style="color:#fff;">${state.time} ms</span></div>
        <div>INPUT LOCK: <span style="color:${state.locked ? '#ef4444' : '#10b981'};">${state.locked}</span></div>
        <div>SOURCE: <span style="color:#facc15;">${sessionStorage.getItem('trafficSource') || 'direct'}</span></div>
      `;
    }, 200);
  }

  document.addEventListener('DOMContentLoaded', function() {
    initSourceTracking();
    initFirstSessionOptimization();
    initDebugMode();
  });

})();
