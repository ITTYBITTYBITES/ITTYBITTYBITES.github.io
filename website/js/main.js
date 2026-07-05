/* ============================================
   Two Second Witness — Global Interactions
   Vanilla JS only, no dependencies
   ============================================ */

(function () {
  'use strict';

  // --- Click Ripple Effect ---
  document.addEventListener('click', function (e) {
    // Don't spawn ripple on nav toggle or links
    if (e.target.closest('.nav-toggle') || e.target.closest('a') || e.target.closest('button')) {
      return;
    }
    var ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = (e.clientX - 100) + 'px';
    ripple.style.top = (e.clientY - 100) + 'px';
    document.body.appendChild(ripple);

    // Cleanup after animation
    setTimeout(function () {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 900);
  });

  // --- Prevent disabled button default ---
  var playButton = document.getElementById('playButton');
  if (playButton) {
    playButton.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  // --- Subtle parallax on title (desktop only) ---
  var title = document.getElementById('mainTitle');
  if (title && window.matchMedia('(min-width: 768px)').matches) {
    document.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 8;
      var y = (e.clientY / window.innerHeight - 0.5) * 4;
      title.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    });
  }

  // --- Mobile Navigation Toggle ---
  var navToggle = document.getElementById('navToggle');
  var navList = document.getElementById('navList');
  if (navToggle && navList) {
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      navList.classList.toggle('open');
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navList.classList.contains('open')) {
        navList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (navList.classList.contains('open') && !e.target.closest('.site-header')) {
        navList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

})();
