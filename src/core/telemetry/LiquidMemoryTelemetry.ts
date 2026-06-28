/**
 * Liquid Memory Telemetry v1.0
 *
 * Session/local-scoped observability helpers for portal arrivals,
 * chamber returns, and diagnostic sync. Centralizes all telemetry and
 * session storage operations across Hub and Chamber shells.
 */

export const PORTAL_ARRIVAL_KEY = 'lm_portal_arrival';
export const CHAMBER_DEPARTURE_KEY = 'lm_chamber_departure';

export type PortalTelemetryIntent = {
  nodeId: string;
  chamber: string;
  route?: string;
  seoLabel?: string;
  interactionEvent?: string;
  trigger: string;
  updatedAt?: string;
};

export type ChamberDepartureMarker = {
  chamber: string;
  nodeId?: string;
  route?: string;
  interactionEvent?: string;
  departedAt?: string;
  reason?: string;
};

export type PortalTelemetryEntry = {
  type: 'portal_confirmed';
  nodeId: string;
  chamber: string;
  route?: string;
  seoLabel?: string;
  interactionEvent?: string;
  trigger: string;
  confirmedAt: string;
};

export type PortalTelemetrySyncPayload = {
  endpoint: string;
  count: number;
  syncedAt: string;
  entries: PortalTelemetryEntry[];
};

export class LiquidMemoryTelemetry {
  constructor(private telemetryKey: string = 'lm_portal_telemetry') {}

  static stagePortalArrivalStatic(intent: PortalTelemetryIntent, confirmedAt: string): void {
    try {
      sessionStorage.setItem(PORTAL_ARRIVAL_KEY, JSON.stringify({
        type: 'portal_arrival',
        nodeId: intent.nodeId,
        chamber: intent.chamber,
        route: intent.route,
        seoLabel: intent.seoLabel,
        interactionEvent: intent.interactionEvent,
        trigger: intent.trigger,
        confirmedAt,
      }));
    } catch {}
  }

  static markPortalArrival(expectedChamber?: string): string | null {
    try {
      const raw = sessionStorage.getItem(PORTAL_ARRIVAL_KEY);
      if (!raw) return null;
      const arrival = JSON.parse(raw);
      sessionStorage.removeItem(PORTAL_ARRIVAL_KEY);
      if (arrival) {
        if (document.documentElement) document.documentElement.dataset.portalArrival = arrival.chamber || arrival.nodeId || 'confirmed';
        if (document.body) document.body.dataset.portalArrival = arrival.chamber || arrival.nodeId || 'confirmed';
        return arrival.chamber || arrival.nodeId;
      }
      return null;
    } catch {
      return null;
    }
  }

  static storeChamberDeparture(chamber: string, nodeId: string, route: string, reason = 'pagehide'): void {
    try {
      sessionStorage.setItem(CHAMBER_DEPARTURE_KEY, JSON.stringify({
        chamber,
        nodeId,
        route,
        interactionEvent: nodeId,
        reason,
        departedAt: new Date().toISOString(),
      }));
    } catch {}
  }

  static capture(nodeId: string, deltaMs: number): void {
    try {
      const key = `lm_telemetry_${nodeId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{"count":0,"throughputMs":[]}');
      existing.count = (existing.count || 0) + 1;
      existing.throughputMs = existing.throughputMs || [];
      existing.throughputMs.push(deltaMs);
      if (existing.throughputMs.length > 50) existing.throughputMs.shift();
      existing.lastThroughputMs = deltaMs;

      // Adaptive Cognitive Pacing calculation (moving average of last 10 entries)
      const recent = existing.throughputMs.slice(-10);
      const avg = Math.round(recent.reduce((a: number, b: number) => a + b, 0) / recent.length);
      let pacingFactor = 1.0;
      if (avg < 200) pacingFactor = 1.2;
      else if (avg > 300) pacingFactor = 0.8;

      existing.averageThroughputMs = avg;
      existing.pacingFactor = pacingFactor;
      existing.updatedAt = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(existing));

      (window as any).LiquidMemoryPacingFactor = pacingFactor;
      localStorage.setItem('lm_adaptive_pacing_factor', String(pacingFactor));
      localStorage.setItem('lm_adaptive_average_throughput', String(avg));

      const srLive = document.getElementById('spatial-live-region') || document.querySelector('[aria-live="polite"]');
      if (srLive) {
        const modeTxt = pacingFactor >= 1.2 ? 'high-performance 1.2x velocity mode' : pacingFactor <= 0.8 ? 'deliberate calm 0.8x mode' : 'standard 1.0x baseline mode';
        srLive.textContent = `Reaction time recorded: ${deltaMs} milliseconds. Platform Pacing adjusted to ${modeTxt}`;
      }
    } catch {}
  }

  stagePortalArrival(intent: PortalTelemetryIntent, confirmedAt: string): void {
    LiquidMemoryTelemetry.stagePortalArrivalStatic(intent, confirmedAt);
  }

  logPortalConfirmed(intent: PortalTelemetryIntent, confirmedAt: string): void {
    try {
      const entry: PortalTelemetryEntry = {
        type: 'portal_confirmed',
        nodeId: intent.nodeId,
        chamber: intent.chamber,
        route: intent.route,
        seoLabel: intent.seoLabel,
        interactionEvent: intent.interactionEvent,
        trigger: intent.trigger,
        confirmedAt,
      };
      const history = this.getPortalTelemetry();
      history.push(entry);
      localStorage.setItem(this.telemetryKey, JSON.stringify(history.slice(-25)));
    } catch {}
  }

  consumeChamberDeparture(): ChamberDepartureMarker | null {
    try {
      const raw = sessionStorage.getItem(CHAMBER_DEPARTURE_KEY);
      if (!raw) return null;
      sessionStorage.removeItem(CHAMBER_DEPARTURE_KEY);
      const parsed = JSON.parse(raw) as ChamberDepartureMarker;
      return parsed?.chamber ? parsed : null;
    } catch {
      return null;
    }
  }

  getPortalTelemetry(): PortalTelemetryEntry[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(this.telemetryKey) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  syncTelemetry(endpoint = 'console://liquid-memory/portal-telemetry'): PortalTelemetrySyncPayload {
    const entries = this.getPortalTelemetry();
    const payload = {
      endpoint,
      count: entries.length,
      syncedAt: new Date().toISOString(),
      entries,
    };
    console.info('[LiquidMemoryTelemetry]', JSON.stringify(payload));
    return payload;
  }
}
