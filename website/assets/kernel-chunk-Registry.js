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
}, r = class {
	static {
		this.nodes = new Map([
			["arcade-main", {
				nodeId: "arcade-main",
				gearId: "games",
				kernelEvent: "library.game_opened",
				route: "./arcade.html",
				title: "Arcade Genesis",
				category: "arcade",
				description: "Experimental browser arcade and prototype chamber.",
				seoLabel: "Liquid Memory Arcade Genesis",
				payload: {
					resource: "trace",
					amount: 25,
					chamber: "Arcade Genesis"
				}
			}],
			["two-second-witness-chamber", {
				nodeId: "two-second-witness-chamber",
				gearId: "games",
				kernelEvent: "witness.chamber_opened",
				route: "./2-second-witness.html",
				title: "2 Second Witness",
				category: "flagship",
				description: "Flagship cognitive training rapid-fire Stroop game.",
				seoLabel: "Liquid Memory 2 Second Witness",
				payload: {
					resource: "trace",
					amount: 25,
					chamber: "Arcade Genesis"
				}
			}],
			["two-second-witness-leaderboard", {
				nodeId: "two-second-witness-leaderboard",
				gearId: "games",
				kernelEvent: "witness.leaderboard_opened",
				route: "./2-second-witness.html#leaderboard",
				title: "2SW Clearance Leaderboard",
				category: "flagship",
				description: "Global operative clearance rankings.",
				seoLabel: "Liquid Memory 2SW Leaderboard"
			}],
			["legacy-static-content", {
				nodeId: "legacy-static-content",
				gearId: "archive",
				kernelEvent: "library.archive_opened",
				route: "./library.html",
				title: "Old Memory Vault",
				category: "legacy",
				description: "Archived static library and historical studio pages.",
				seoLabel: "Liquid Memory Archive Vault",
				payload: {
					resource: "trace",
					amount: 5,
					chamber: "Old Memory Vault"
				},
				isLegacyStatic: !0
			}],
			["community-vortex", {
				nodeId: "community-vortex",
				gearId: "community",
				kernelEvent: "community.vortex",
				route: "./feed.html",
				title: "Community Vortex",
				category: "community",
				description: "Living community updates and reward vortex.",
				seoLabel: "Liquid Memory Community Vortex",
				payload: {
					resource: "pearls",
					amount: 60,
					chamber: "Community Vortex"
				}
			}],
			["blueprint-dial", {
				nodeId: "blueprint-dial",
				gearId: "blueprint",
				kernelEvent: "milestone.level_up",
				title: "Blueprint Dial",
				category: "system",
				description: "Workstation growth mechanism.",
				seoLabel: "Liquid Memory Growth Chamber",
				payload: { chamber: "Blueprint Dial" }
			}],
			["memory-mycelium", {
				nodeId: "memory-mycelium",
				gearId: "memory",
				kernelEvent: "economic.resource_gained",
				title: "Memory Mycelium",
				category: "system",
				description: "Persistent resource echo network.",
				seoLabel: "Liquid Memory Echo",
				payload: {
					resource: "trace",
					amount: 10,
					chamber: "Memory Mycelium"
				}
			}]
		]);
	}
	static {
		this.aliases = new Map([
			["games", "arcade-main"],
			["library.game_opened", "arcade-main"],
			["arcade genesis", "arcade-main"],
			["two-second-witness", "two-second-witness-chamber"],
			["2-second-witness", "two-second-witness-chamber"],
			["witness.chamber_opened", "two-second-witness-chamber"],
			["archive", "legacy-static-content"],
			["library.archive_opened", "legacy-static-content"],
			["old memory vault", "legacy-static-content"],
			["community", "community-vortex"],
			["community.vortex", "community-vortex"],
			["blueprint", "blueprint-dial"],
			["milestone.level_up", "blueprint-dial"],
			["memory", "memory-mycelium"],
			["economic.resource_gained", "memory-mycelium"]
		]);
	}
	static {
		[
			["behavioral-economics", "Behavioral Economics"],
			["best-brain-games", "Best Brain Games"],
			["best-psychology-books", "Best Psychology Books"],
			["brain-training-tips", "Brain Training Tips"],
			["cognitive-biases", "Cognitive Biases"],
			["cybersecurity-beginners", "Cybersecurity Beginners"],
			["decision-making", "Decision Making"],
			["dunning-kruger", "Dunning-Kruger Effect"],
			["false-memory", "False Memory"],
			["first-aid-basics", "First Aid Basics"],
			["flow-state", "Flow State"],
			["food-safety", "Food Safety"],
			["how-doctors-think", "How Doctors Think"],
			["logical-fallacies", "Logical Fallacies"],
			["pattern-recognition", "Pattern Recognition"],
			["priming-effect", "Priming Effect"],
			["rapid-thinking", "Rapid Thinking"],
			["social-engineering", "Social Engineering"],
			["stroop-effect", "Stroop Effect"],
			["survival-skills", "Survival Skills"]
		].forEach(([e, t]) => {
			let n = `legacy-article-${e}`;
			this.nodes.set(n, {
				nodeId: n,
				gearId: "archive",
				kernelEvent: `legacy.${e}`,
				route: `./articles/${e}.html`,
				title: t,
				category: "legacy",
				description: `Legacy studio publication: ${t}`,
				isLegacyStatic: !0
			}), this.aliases.set(e, n), this.aliases.set(`${e}.html`, n), this.aliases.set(t.toLowerCase(), n);
		});
	}
	static register(e, t = []) {
		this.nodes.set(e.nodeId, e), t.forEach((t) => this.aliases.set(t.toLowerCase(), e.nodeId));
	}
	static lookup(e) {
		if (!e) return null;
		let t = e.trim();
		if (this.nodes.has(t)) return this.nodes.get(t);
		let n = t.toLowerCase(), r = this.aliases.get(n);
		if (r && this.nodes.has(r)) return this.nodes.get(r);
		for (let e of this.nodes.values()) if (e.kernelEvent === t || e.title.toLowerCase() === n || e.seoLabel?.toLowerCase() === n || e.gearId === t) return e;
		return null;
	}
	static getAllNodes() {
		return Array.from(this.nodes.values());
	}
	static getNodesByCategory(e) {
		return this.getAllNodes().filter((t) => t.category === e);
	}
};
//#endregion
export { n, r as t };
