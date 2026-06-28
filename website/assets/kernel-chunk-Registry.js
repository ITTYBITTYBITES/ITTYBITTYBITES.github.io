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
			["access-terminal-telemetry", {
				nodeId: "access-terminal-telemetry",
				gearId: "memory",
				kernelEvent: "system.telemetry_projection",
				title: "Access Terminal // System Telemetry",
				category: "system",
				description: "Pure 3D WebGL floating void telemetry HUD projection node.",
				isInternalTelemetry: !0,
				metrics: [
					{
						key: "games",
						sourceEvent: "library.game_opened",
						label: "Arcade Genesis",
						baseline: 26
					},
					{
						key: "witness",
						sourceEvent: "witness.landing_opened",
						label: "Witness Division",
						baseline: 14
					},
					{
						key: "rewards",
						sourceEvent: "system.reward_offered",
						label: "Reward Vortex",
						baseline: 42
					}
				]
			}],
			["witness-chamber", {
				nodeId: "witness-chamber",
				gearId: "games",
				kernelEvent: "witness.landing_opened",
				route: "./witness/index.html",
				title: "Two-Second Witness (Android App)",
				category: "flagship",
				description: "Dedicated Android App interactive landing experience.",
				seoLabel: "Liquid Memory Witness App",
				payload: {
					resource: "trace",
					amount: 25,
					chamber: "Arcade Genesis"
				}
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
			}],
			["echo-void", {
				nodeId: "echo-void",
				gearId: "archive",
				kernelEvent: "library.echo_void",
				route: "./library/echo-void.html",
				title: "Experimental Echo-Void Spatial Prototype",
				category: "legacy",
				description: "An experimental acoustic spatial WebGL prototype probing deep obsidian chambers via spatialized echo reverberation loops.",
				seoLabel: "Liquid Memory Echo Void Prototype",
				isLegacyStatic: !0
			}]
		]);
	}
	static {
		this.aliases = new Map([
			["echo void", "echo-void"],
			["echo-void.html", "echo-void"],
			["games", "arcade-main"],
			["library.game_opened", "arcade-main"],
			["arcade genesis", "arcade-main"],
			["two-second-witness", "two-second-witness-chamber"],
			["2-second-witness", "two-second-witness-chamber"],
			["witness.chamber_opened", "two-second-witness-chamber"],
			["witness", "witness-chamber"],
			["archive", "legacy-static-content"],
			["library.archive_opened", "legacy-static-content"],
			["old memory vault", "legacy-static-content"],
			["community", "community-vortex"],
			["community.vortex", "community-vortex"],
			["blueprint", "blueprint-dial"],
			["milestone.level_up", "blueprint-dial"],
			["memory", "memory-mycelium"],
			["economic.resource_gained", "memory-mycelium"],
			["signals-dashboard", "access-terminal-telemetry"],
			["signals", "access-terminal-telemetry"]
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
		}), [
			["cyber-vector", "3D Cyber Vector Grid Hover-Racer"],
			["neon-polygon", "3D Neon Geometric Defender"],
			["quantum-breakout", "3D Particle Breakout Engine"],
			["attentional-blink", "Attentional Blink Assessor"],
			["cosmic-tunnel", "Cosmic Tunnel 3D"],
			["hover-drone", "Cyber Flappy Hover-Drone"],
			["cyber-snake", "Cyber Snake 2026"],
			["cyber-mines", "Cyber Sweeper Sentinel"],
			["grid-delver", "Grid Delver: 1-Minute Micro-Rogue"],
			["metronomic-rhythm", "METRONOMIC RHYTHM ANCHOR"],
			["nback-sentinel", "N-BACK SENTINEL LOG"],
			["neon-pong", "Neon Cyber Pong 1v1"],
			["orbital-sandbox", "Orbital Gravitational Physics Sandbox"],
			["quantum-sentinel", "Quantum Sentinel: Fast Spatial Reflex"],
			["raycasted-doom", "Raycasted 3D Doom Labyrinth"],
			["gravity-slingshot", "Relivistic Space Slingshot"],
			["retro-breakout", "Retro Cyber Neon Breakout"],
			["saccadic-target", "SACCADIC TARGET ACQUISITION"],
			["shifting-selector", "SHIFTING ATTENTIONAL ATTRIBUTE SELECTOR"],
			["signal-detection", "SIGNAL DETECTION FILTER"],
			["space-asteroids", "Space Asteroids Retro Vector"],
			["spatial-matrix", "SPATIAL MATRIX EXPANSION"],
			["stroop-calibrator", "Stroop Interference Calibrator"],
			["tachistoscope", "TACHISTOSCOPE RECOGNITION MATRIX"],
			["tachyon-racer", "Tachyon Hyper-Speed Interceptor"],
			["memory-churn", "WORKING MEMORY CALIBRATION CHURN"]
		].forEach(([e, t]) => {
			let n = `arcade-game-${e}`;
			this.nodes.set(n, {
				nodeId: n,
				gearId: "games",
				kernelEvent: "library.game_opened",
				route: `./games/${e}/index.html`,
				title: t,
				category: "arcade",
				description: `Arcade chamber: ${t}`,
				payload: {
					resource: "trace",
					amount: 25,
					chamber: "Arcade Genesis"
				}
			}), this.aliases.set(e, n), this.aliases.set(t.toLowerCase(), n);
		}), this.updateJsonLdSchema();
	}
	static updateJsonLdSchema() {
		if (typeof document > "u" || !document.head) return;
		let e = document.head.querySelector("script[type=\"application/ld+json\"][data-registry-schema]");
		e || (e = document.createElement("script"), e.setAttribute("type", "application/ld+json"), e.setAttribute("data-registry-schema", "true"), document.head.appendChild(e));
		let t = {
			"@context": "https://schema.org",
			"@type": "ItemList",
			name: "Liquid Memory Spatial Registry Archive",
			description: "Monolithic WebGL spatial gaming and publication collection.",
			itemListElement: Array.from(this.nodes.values()).map((e, t) => ({
				"@type": "ListItem",
				position: t + 1,
				item: {
					"@type": e.category === "arcade" ? "VideoGame" : "WebPage",
					name: e.title,
					url: `https://ittybittybites.github.io/#${e.nodeId}`,
					description: e.description || e.title
				}
			}))
		};
		e.textContent = JSON.stringify(t);
	}
	static register(e, t = []) {
		this.nodes.set(e.nodeId, e), t.forEach((t) => this.aliases.set(t.toLowerCase(), e.nodeId)), this.updateJsonLdSchema();
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
