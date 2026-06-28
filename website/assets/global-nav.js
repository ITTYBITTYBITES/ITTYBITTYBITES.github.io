/**
 * Global Unified Navigation Mounter v1.0
 *
 * Automatically injects the Cyber-minimalist dark navigation bar
 * across all ecosystem portals and purges fragmented legacy headers.
 */
(function(){
  if (document.getElementById('lm-global-nav')) return;

  const depth = (window.location.pathname.match(/\//g) || []).length;
  let base = './';
  if (window.location.pathname.includes('/games/') && depth > 2) base = '../../';
  else if (depth > 2) base = '../../';
  else if (depth > 1 && !window.location.pathname.endsWith('/website/')) base = '../';

  const nav = document.createElement('nav');
  nav.id = 'lm-global-nav';
  nav.className = 'lm-shared-nav';
  nav.setAttribute('aria-label', 'Global Unified Tactical Navigation');
  nav.innerHTML = `
    <div class="lm-nav-inner">
      <a class="lm-logo" href="${base}index.html">
        <span class="lm-status-dot" title="Ecosystem Online">🟢</span>
        <span>LIQUID MEMORY</span>
      </a>
      <div class="lm-nav-links">
        <a href="${base}arcade.html">ARCADE</a>
        <a href="${base}library.html">LIBRARY</a>
        <a href="${base}signals/index.html">SIGNALS</a>
      </div>
    </div>
  `;

  // Remove existing fragmented nav headers
  const purgeOldHeaders = () => {
    document.querySelectorAll('nav:not(#lm-global-nav), header.ibb-nav, .ibb-nav').forEach(n => n.remove());
  };

  if (document.body) {
    purgeOldHeaders();
    document.body.insertBefore(nav, document.body.firstChild);
    document.body.style.paddingTop = '64px';
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      purgeOldHeaders();
      document.body.insertBefore(nav, document.body.firstChild);
      document.body.style.paddingTop = '64px';
    });
  }
})();
