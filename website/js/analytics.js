/* ============================================
   Two Second Witness — Static Safe Analytics
   Phase 5 Production Hardening Layer
   ============================================ */

(function () {
  'use strict';

  window.TWO_SECOND_CONFIG = window.TWO_SECOND_CONFIG || {
    analyticsEnabled: true,
    debugMode: false
  };

  /**
   * Lightweight static event tracker.
   * Dispatches custom DOM events and safely logs to console if debug mode is active.
   */
  window.trackWitnessEvent = function (eventName, eventData) {
    if (!window.TWO_SECOND_CONFIG.analyticsEnabled) return;

    try {
      var detail = {
        event: eventName,
        data: eventData || {},
        timestamp: new Date().toISOString()
      };

      // Dispatch custom DOM event for any frontend listeners
      var customEvt = new CustomEvent('twosecondwitness:analytics', {
        detail: detail,
        bubbles: true
      });
      document.dispatchEvent(customEvt);

      if (window.TWO_SECOND_CONFIG.debugMode && console && console.log) {
        console.log('[Witness Analytics]', eventName, eventData);
      }

      // Safe hook for Google Analytics / gtag / Plausible if configured later
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, eventData);
      } else if (typeof window.plausible === 'function') {
        window.plausible(eventName, { props: eventData });
      }
    } catch (e) {
      // Never let telemetry errors break the application
    }
  };

})();
