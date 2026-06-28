/**
 * Global Unified Navigation Mounter v1.1
 *
 * Standardized absolute-relative link paths matching GitHub Pages root structure.
 */
(function(){
  if (document.getElementById('lm-global-nav')) return;

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

  const purgeOldHeaders = () => {
    document.querySelectorAll('nav:not(#lm-global-nav), header.ibb-nav, .ibb-nav').forEach(n => n.remove());
  };

  const mount = () => {
    purgeOldHeaders();
    if (document.body) {
      document.body.insertBefore(nav, document.body.firstChild);
      document.body.style.paddingTop = '64px';
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
