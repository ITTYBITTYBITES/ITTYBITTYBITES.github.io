/* Liquid Memory Arcade Monetization + Reward Bridge
   Public, static, no account data. Provides a visible in-game sponsor rail and a modal reward loop.
   Games trigger: window.parent.postMessage({type:'ARCADE_TRIGGER_AD', adType:'rewarded'|'interstitial'}, '*')
   Completion sent: {type:'ARCADE_AD_COMPLETE'}
*/
(function () {
  'use strict';

  const CONFIG = {
    adsenseClient: 'ca-pub-1566091161594729',
    rewardSeconds: 6,
    minSecondsBetweenBreaks: 45,
  };

  let initialized = false;
  let modalOpen = false;
  let lastBreakAt = 0;
  let timer = null;

  function injectStyles() {
    if (document.getElementById('ibb-arcade-monetization-style')) return;
    const style = document.createElement('style');
    style.id = 'ibb-arcade-monetization-style';
    style.textContent = `
      :root { --ibb-ad-bg: rgba(3, 7, 18, .92); --ibb-ad-line: rgba(95,232,255,.36); --ibb-ad-text: #f7fbff; --ibb-ad-muted: #aeb8d6; --ibb-ad-cyan: #5fe8ff; --ibb-ad-gold: #ffe27a; --ibb-ad-green: #58ffbd; }
      .ibb-ad-rail { position: fixed; left: 12px; right: 12px; bottom: 10px; z-index: 2147483000; display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 46px; padding: 8px 12px; border: 1px solid var(--ibb-ad-line); border-radius: 16px; background: var(--ibb-ad-bg); color: var(--ibb-ad-text); font-family: Inter, ui-sans-serif, system-ui, sans-serif; box-shadow: 0 16px 48px rgba(0,0,0,.36); backdrop-filter: blur(12px); }
      .ibb-ad-rail strong { color: var(--ibb-ad-cyan); font-size: 12px; text-transform: uppercase; letter-spacing: .12em; white-space: nowrap; }
      .ibb-ad-rail span { color: var(--ibb-ad-muted); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ibb-ad-rail button { border: 1px solid rgba(255,255,255,.18); border-radius: 999px; background: rgba(255,255,255,.06); color: var(--ibb-ad-text); min-height: 32px; padding: 0 12px; font-weight: 800; cursor: pointer; }
      .ibb-ad-rail[hidden] { display: none; }
      .ibb-reward-modal { position: fixed; inset: 0; z-index: 2147483001; display: none; align-items: center; justify-content: center; padding: 18px; background: rgba(2,6,23,.72); backdrop-filter: blur(16px); font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      .ibb-reward-modal.is-open { display: flex; }
      .ibb-reward-card { width: min(92vw, 520px); border: 1px solid var(--ibb-ad-line); border-radius: 26px; padding: 26px; background: linear-gradient(135deg, rgba(8,13,32,.98), rgba(20,11,31,.98)); box-shadow: 0 24px 90px rgba(0,0,0,.55); color: var(--ibb-ad-text); text-align: center; }
      .ibb-reward-card .kicker { margin: 0 0 10px; color: var(--ibb-ad-cyan); font-size: 11px; font-weight: 950; letter-spacing: .18em; text-transform: uppercase; }
      .ibb-reward-card h2 { margin: 0; font-size: clamp(28px, 6vw, 42px); line-height: .95; letter-spacing: -.04em; }
      .ibb-reward-card p { color: var(--ibb-ad-muted); line-height: 1.55; }
      .ibb-reward-count { margin: 14px auto; width: 78px; height: 78px; display: grid; place-items: center; border-radius: 50%; border: 1px solid rgba(255,226,122,.45); color: var(--ibb-ad-gold); font-size: 34px; font-weight: 1000; background: rgba(255,226,122,.08); }
      .ibb-reward-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 16px; }
      .ibb-reward-actions button { min-height: 44px; border: 1px solid rgba(255,255,255,.16); border-radius: 14px; padding: 0 16px; color: #061018; background: linear-gradient(135deg, var(--ibb-ad-cyan), var(--ibb-ad-green)); font-weight: 950; text-transform: uppercase; letter-spacing: .08em; cursor: pointer; }
      .ibb-reward-actions button.secondary { color: var(--ibb-ad-text); background: rgba(255,255,255,.06); }
      .ibb-reward-actions button:disabled { opacity: .48; cursor: not-allowed; }
      .ibb-ad-spacer { height: 66px; }
      @media (max-width: 520px) { .ibb-ad-rail { left: 8px; right: 8px; bottom: 8px; } .ibb-ad-rail span { display:none; } }
    `;
    document.head.appendChild(style);
  }

  function loadAdSense() {
    if (document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + CONFIG.adsenseClient;
    document.head.appendChild(script);
  }

  function createRail() {
    if (document.getElementById('ibb-ad-rail')) return;
    const rail = document.createElement('aside');
    rail.id = 'ibb-ad-rail';
    rail.className = 'ibb-ad-rail';
    rail.setAttribute('aria-label', 'Advertisement and sponsor message');
    rail.innerHTML = '<strong>Ad</strong><span>Thanks for supporting free Liquid Memory browser games.</span><button type="button" id="ibb-ad-rail-hide">Hide</button>';
    document.body.appendChild(rail);
    const spacer = document.createElement('div');
    spacer.className = 'ibb-ad-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(spacer);
    document.getElementById('ibb-ad-rail-hide').addEventListener('click', () => { rail.hidden = true; });
  }

  function createModal() {
    if (document.getElementById('ibb-reward-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'ibb-reward-modal';
    modal.className = 'ibb-reward-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="ibb-reward-card">
        <p class="kicker" id="ibb-reward-kicker">Sponsor break</p>
        <h2>Reward loading</h2>
        <p id="ibb-reward-copy">A short in-game sponsor window keeps the arcade free. No new website opens; stay here and continue when the timer completes.</p>
        <div class="ibb-reward-count" id="ibb-reward-count">${CONFIG.rewardSeconds}</div>
        <div class="ibb-reward-actions">
          <button type="button" id="ibb-reward-continue" disabled>Continue</button>
          <button type="button" class="secondary" id="ibb-reward-skip">Skip</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('ibb-reward-continue').addEventListener('click', completeBreak);
    document.getElementById('ibb-reward-skip').addEventListener('click', completeBreak);
  }

  function emitComplete() {
    try { window.postMessage({ type: 'ARCADE_AD_COMPLETE' }, '*'); } catch (e) {}
    try { if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'ARCADE_CHILD_AD_COMPLETE' }, '*'); } catch (e) {}
  }

  function completeBreak() {
    const modal = document.getElementById('ibb-reward-modal');
    if (modal) modal.classList.remove('is-open');
    modalOpen = false;
    clearInterval(timer);
    emitComplete();
  }

  function showBreak(adType) {
    const now = Date.now();
    if (modalOpen) return;
    if (now - lastBreakAt < CONFIG.minSecondsBetweenBreaks * 1000) { emitComplete(); return; }
    lastBreakAt = now;
    modalOpen = true;
    createModal();
    const modal = document.getElementById('ibb-reward-modal');
    const kicker = document.getElementById('ibb-reward-kicker');
    const count = document.getElementById('ibb-reward-count');
    const btn = document.getElementById('ibb-reward-continue');
    kicker.textContent = adType === 'rewarded' ? 'Rewarded sponsor window' : 'Interstitial sponsor window';
    btn.disabled = true;
    let n = CONFIG.rewardSeconds;
    count.textContent = String(n);
    modal.classList.add('is-open');
    clearInterval(timer);
    timer = setInterval(() => {
      n -= 1;
      count.textContent = String(Math.max(0, n));
      if (n <= 0) {
        clearInterval(timer);
        btn.disabled = false;
        btn.focus();
      }
    }, 1000);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    injectStyles();
    loadAdSense();
    createRail();
    createModal();
    window.addEventListener('message', (event) => {
      const data = event.data || {};
      if (data.type === 'ARCADE_TRIGGER_AD') showBreak(data.adType || 'interstitial');
    });
    window.LiquidMemoryArcadeAds = { showBreak, completeBreak };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
