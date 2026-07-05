/* ============================================
   Two Second Witness — Static Safe Analytics
   Phase 6 Launch Structure Alignment Layer
   ============================================ */

(function () {
  'use strict';

  window.TWO_SECOND_CONFIG = window.TWO_SECOND_CONFIG || {
    analyticsEnabled: true,
    debugMode: false
  };

  /**
   * Static event telemetry tracker.
   * Aligns with Phase 6 schema requirements: attaches timestamp, traffic_source, scenario_id, world_id.
   */
  window.trackWitnessEvent = function (eventName, eventData) {
    if (!window.TWO_SECOND_CONFIG.analyticsEnabled) return;

    try {
      var data = eventData || {};
      var src = 'direct';
      try {
        src = sessionStorage.getItem('trafficSource') || 'direct';
      } catch (e) {}

      var payload = {
        event: eventName,
        timestamp: performance.now(),
        iso_time: new Date().toISOString(),
        traffic_source: src,
        scenario_id: data.scenarioId || data.scenario || 'N/A',
        world_id: data.worldId || data.world || 'N/A',
        reaction_time: data.reactionTimeMs || data.reactionTime || 0,
        accuracy: data.isCorrect !== undefined ? (data.isCorrect ? 100 : 0) : null,
        rating: data.rating || null,
        meta: data
      };

      // Dispatch custom DOM event for frontend hooks & measurement
      var customEvt = new CustomEvent('twosecondwitness:analytics', {
        detail: payload,
        bubbles: true
      });
      document.dispatchEvent(customEvt);

      if (window.TWO_SECOND_CONFIG.debugMode && console && console.log) {
        console.log('[Witness Telemetry]', eventName, payload);
      }

      // Safe hook for analytics receivers
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, payload);
      } else if (typeof window.plausible === 'function') {
        window.plausible(eventName, { props: payload });
      }
    } catch (e) {}
  };

})();
