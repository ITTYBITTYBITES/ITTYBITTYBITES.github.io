/**
 * Global Unified Navigation & Footer Mounter v1.2
 *
 * Standardized absolute-relative link paths and universal brand identity:
 * Studio: Ittybittybites | Platform: Liquid Memory
 */
(function(){
  if (document.getElementById('lm-global-nav') && document.getElementById('lm-global-footer')) return;

  const nav = document.createElement('nav');
  nav.id = 'lm-global-nav';
  nav.className = 'lm-shared-nav';
  nav.setAttribute('aria-label', 'Global Unified Tactical Navigation');
  nav.innerHTML = `
    <div class="lm-nav-inner">
      <a class="lm-logo" href="/website/index.html">
        <span class="lm-status-dot" title="Ecosystem Online">🟢</span>
        <span>LIQUID MEMORY</span>
      </a>
      <div class="lm-nav-links">
        <a href="/website/arcade.html">ARCADE</a>
        <a href="/website/library.html">LIBRARY</a>
        <a href="/website/signals/index.html">SIGNALS</a>
      </div>
    </div>
  `;

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
        <p>© 2026 Ittybittybites • <a href="/website/privacy_policy.html">Privacy</a> • <a href="/website/terms_of_service.html">Terms</a> • <a href="/website/contact.html">Contact the Curator</a></p>
        <p style="margin-top:6px;font-size:10px;color:#64748b;">LIQUID MEMORY // COGNITIVE GAMING DIVISION</p>
      </div>
    `;
    document.querySelectorAll('footer:not(#lm-global-footer), .ibb-footer').forEach(f => f.remove());
  };

  const purgeOldHeaders = () => {
    document.querySelectorAll('nav:not(#lm-global-nav), header.ibb-nav, .ibb-nav').forEach(n => n.remove());
  };

  const mount = () => {
    purgeOldHeaders();
    if (document.body) {
      if (!document.getElementById('lm-global-nav')) {
        document.body.insertBefore(nav, document.body.firstChild);
      }
      document.body.style.paddingTop = '64px';
      mountFooter();
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
