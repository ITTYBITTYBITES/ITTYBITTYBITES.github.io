//#region src/core/telemetry/LiquidMemoryTelemetry.ts
var e = "lm_portal_arrival", t = "lm_chamber_departure", n = class n {
	constructor(e = "lm_portal_telemetry") {
		this.telemetryKey = e;
	}
	static stagePortalArrivalStatic(t, n) {
		try {
			sessionStorage.setItem(e, JSON.stringify({
				type: "portal_arrival",
				nodeId: t.nodeId,
				chamber: t.chamber,
				route: t.route,
				seoLabel: t.seoLabel,
				interactionEvent: t.interactionEvent,
				trigger: t.trigger,
				confirmedAt: n
			}));
		} catch {}
	}
	static markPortalArrival(t) {
		try {
			let t = sessionStorage.getItem(e);
			if (!t) return null;
			let n = JSON.parse(t);
			return sessionStorage.removeItem(e), n ? (document.documentElement && (document.documentElement.dataset.portalArrival = n.chamber || n.nodeId || "confirmed"), document.body && (document.body.dataset.portalArrival = n.chamber || n.nodeId || "confirmed"), n.chamber || n.nodeId) : null;
		} catch {
			return null;
		}
	}
	static storeChamberDeparture(e, n, r, i = "pagehide") {
		try {
			sessionStorage.setItem(t, JSON.stringify({
				chamber: e,
				nodeId: n,
				route: r,
				interactionEvent: n,
				reason: i,
				departedAt: (/* @__PURE__ */ new Date()).toISOString()
			}));
		} catch {}
	}
	stagePortalArrival(e, t) {
		n.stagePortalArrivalStatic(e, t);
	}
	logPortalConfirmed(e, t) {
		try {
			let n = {
				type: "portal_confirmed",
				nodeId: e.nodeId,
				chamber: e.chamber,
				route: e.route,
				seoLabel: e.seoLabel,
				interactionEvent: e.interactionEvent,
				trigger: e.trigger,
				confirmedAt: t
			}, r = this.getPortalTelemetry();
			r.push(n), localStorage.setItem(this.telemetryKey, JSON.stringify(r.slice(-25)));
		} catch {}
	}
	consumeChamberDeparture() {
		try {
			let e = sessionStorage.getItem(t);
			if (!e) return null;
			sessionStorage.removeItem(t);
			let n = JSON.parse(e);
			return n?.chamber ? n : null;
		} catch {
			return null;
		}
	}
	getPortalTelemetry() {
		try {
			let e = JSON.parse(localStorage.getItem(this.telemetryKey) || "[]");
			return Array.isArray(e) ? e : [];
		} catch {
			return [];
		}
	}
	syncTelemetry(e = "console://liquid-memory/portal-telemetry") {
		let t = this.getPortalTelemetry(), n = {
			endpoint: e,
			count: t.length,
			syncedAt: (/* @__PURE__ */ new Date()).toISOString(),
			entries: t
		};
		return console.info("[LiquidMemoryTelemetry]", JSON.stringify(n)), n;
	}
};
//#endregion
export { n as t };
