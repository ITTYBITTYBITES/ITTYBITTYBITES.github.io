/**
 * Total Spatial Purge (Zero-Nav State) & Universal Footer Mounter v2.0
 *
 * Studio: Ittybittybites | Platform: Liquid Memory
 * Completely purges top visual navigation bars (#lm-global-nav) and replaces
 * with a persistent top-center 1x1px glowing dot root return icon.
 */
(function(){
  if (window.self !== window.top) {
    if (document.documentElement) document.documentElement.classList.add('is-iframe-sandbox');
    const cleanIframe = () => {
      document.querySelectorAll('nav, header, footer, .ibb-nav, .ibb-footer, #lm-global-nav, #lm-global-footer, #lm-spatial-return').forEach(el => el.remove());
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
    // Total Spatial Purge of visual navigation
    document.querySelectorAll('nav, header.ibb-nav, .ibb-nav, #lm-global-nav, header[class*="sticky"]').forEach(n => n.remove());

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
