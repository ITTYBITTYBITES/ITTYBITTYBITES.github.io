/**
 * Total Spatial Purge (Zero-Nav State), Universal Deep-Link Interception,
 * Entering Site Flash-Blanking Overlay & Footer Mounter v2.2
 *
 * Studio: Ittybittybites | Platform: Liquid Memory
 */
(function(){
  if (window.self !== window.top) {
    if (document.documentElement) document.documentElement.classList.add('is-iframe-sandbox');
    const cleanIframe = () => {
      document.querySelectorAll('nav, header, footer, .ibb-nav, .ibb-footer, #lm-global-nav, #lm-global-footer, #lm-spatial-return, #lm-boot-overlay').forEach(el => el.remove());
      if (document.body) {
        document.body.classList.add('is-iframe-sandbox');
        document.body.style.paddingTop = '0px';
        document.body.style.margin = '0px';
      }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cleanIframe);
    else cleanIframe();
    return;
  }

  // Intercept deep link requests and boot Kernel Master Hub
  const path = window.location.pathname;
  if (path.includes('/games/') || path.includes('/library/') || path.includes('/articles/') || path.includes('/arcade/')) {
    const slug = path.split('/').pop().replace('.html', '');
    if (slug && !['index', 'arcade', 'library', 'feed', 'sitemap'].includes(slug)) {
      try {
        sessionStorage.setItem('lm_portal_arrival', JSON.stringify({ chamber: 'Arcade Genesis', nodeId: slug }));
      } catch {}
      window.location.replace('/website/index.html#' + encodeURIComponent(slug));
      return;
    }
  }

  const mountFooter = () => {
    let footer = document.getElementById('lm-global-footer');
    if (!footer) {
      footer = document.createElement('footer');
      footer.id = 'lm-global-footer';
      footer.className = 'lm-shared-footer';
      if (document.body) document.body.appendChild(footer);
    }
    footer.innerHTML = `
      <div class="lm-footer-inner">
        <p>© 2026 Ittybittybites • <a href="/website/privacy_policy.html">Privacy</a> • <a href="/website/terms_of_service.html">Terms</a></p>
        <p style="margin-top:6px;font-size:10px;color:#64748b;">LIQUID MEMORY // COGNITIVE GAMING DIVISION</p>
      </div>
    `;
    document.querySelectorAll('footer:not(#lm-global-footer), .ibb-footer, footer.border-t, footer[class*="bg-"]').forEach(f => f.remove());
  };

  const purgeNavAndMountReturn = () => {
    document.querySelectorAll('nav, header.ibb-nav, .ibb-nav, #lm-global-nav, header[class*="sticky"]').forEach(n => n.remove());

    let bootOverlay = document.getElementById('lm-boot-overlay');
    if (!bootOverlay) {
      bootOverlay = document.createElement('div');
      bootOverlay.id = 'lm-boot-overlay';
      bootOverlay.dataset.start = performance.now();
      bootOverlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:999999;background-color:#020617;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#22d3ee;font-family:monospace;transition:opacity .4s ease, visibility .4s ease;';
      bootOverlay.innerHTML = `
        <style>
          @keyframes enteringSitePulse {
            0%, 100% { opacity: 0.3; transform: scale(0.98); filter: drop-shadow(0 0 10px #22d3ee); }
            50% { opacity: 1; transform: scale(1.02); filter: drop-shadow(0 0 25px #00ffff); }
          }
          .entering-site-anim { animation: enteringSitePulse 1.2s infinite ease-in-out; text-align: center; }
        </style>
        <div class="entering-site-anim">
          <span style="font-size:10px;letter-spacing:3px;color:#facc15;font-weight:900;display:block;margin-bottom:8px;">LIQUID MEMORY SYSTEM</span>
          <strong style="font-size:16px;letter-spacing:2px;color:#fff;">ENTERING SITE // HOLOGRAPHIC VOID</strong>
        </div>
      `;
      if (document.body) document.body.insertBefore(bootOverlay, document.body.firstChild);
      
      const start = Number(bootOverlay.dataset.start) || performance.now();
      const hideBoot = () => {
        if (performance.now() - start < 220) {
          setTimeout(hideBoot, 40);
          return;
        }
        bootOverlay.style.pointerEvents = 'none';
        bootOverlay.style.opacity = '0';
        setTimeout(() => { if (bootOverlay) bootOverlay.style.visibility = 'hidden'; }, 400);
      };
      if (!window.location.pathname.endsWith('/website/') && !window.location.pathname.endsWith('index.html')) {
        setTimeout(hideBoot, 220);
      }
    }

    let returnDot = document.getElementById('lm-spatial-return');
    if (!returnDot) {
      returnDot = document.createElement('a');
      returnDot.id = 'lm-spatial-return';
      returnDot.href = '/website/index.html';
      returnDot.setAttribute('aria-label', 'Spatial Return to Master Hub');
      returnDot.title = 'Return to Holographic Hub';
      returnDot.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:99999;width:8px;height:8px;border-radius:50%;background:#00ffff;box-shadow:0 0 12px #00ffff, 0 0 24px #00ffff;display:block;cursor:pointer;transition:transform .2s;';
      returnDot.addEventListener('pointerover', () => { returnDot.style.transform = 'translateX(-50%) scale(1.5)'; });
      returnDot.addEventListener('pointerout', () => { returnDot.style.transform = 'translateX(-50%) scale(1)'; });
      if (document.body) document.body.appendChild(returnDot);
    }

    if (document.body) {
      document.body.style.paddingTop = '0px';
      mountFooter();
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', purgeNavAndMountReturn);
  else purgeNavAndMountReturn();
})();
