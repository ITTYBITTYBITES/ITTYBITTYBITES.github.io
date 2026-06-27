/**
 * Liquid Memory Telemetry v1.0
 *
 * Session/local-scoped observability helpers for portal arrivals,
 * chamber returns, and diagnostic sync. This module intentionally avoids
 * Kernel bus emission so telemetry never changes reducer state, node count,
 * or the 19/19 Kernel Contract.
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
  constructor(private telemetryKey: string) {}

  stagePortalArrival(intent: PortalTelemetryIntent, confirmedAt: string): void {
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
    } catch {
      // Session storage is best-effort chamber context only.
    }
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
    } catch {
      // Telemetry is intentionally non-blocking and never emits Kernel events.
    }
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
