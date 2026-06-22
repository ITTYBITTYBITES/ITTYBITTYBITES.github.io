//#region src/core/kernel/bus/GlobalEventBus.ts
var e = class e {
	constructor() {
		this.listeners = [], this.processedEventIds = /* @__PURE__ */ new Set();
	}
	static getInstance() {
		return e.instance ||= new e(), e.instance;
	}
	emit(e) {
		return this.processedEventIds.has(e.eventId) ? !1 : (this.processedEventIds.add(e.eventId), this.listeners.forEach((t) => {
			try {
				t(e);
			} catch (e) {
				console.error("[EventBus] Listener error:", e);
			}
		}), !0);
	}
	subscribe(e) {
		return this.listeners.push(e), () => {
			this.listeners = this.listeners.filter((t) => t !== e);
		};
	}
	reset() {
		this.listeners = [], this.processedEventIds.clear();
	}
}, t = {
	version: "1.0.0",
	timestamp: (/* @__PURE__ */ new Date()).toISOString(),
	processedEventIds: /* @__PURE__ */ new Set(),
	lastSequenceIds: {},
	player: {
		id: "player_default",
		level: 1,
		xp: 0,
		resources: {}
	},
	world: {
		entities: {},
		time: {
			totalElapsedMs: 0,
			lastEventTimestamp: (/* @__PURE__ */ new Date()).toISOString()
		}
	},
	system: {
		eventCount: 0,
		errors: []
	}
};
//#endregion
//#region src/core/kernel/reducer/PlatformReducer.ts
function n(e = t, n) {
	if (e.processedEventIds.has(n.eventId)) return console.log(`[Reducer] DUPLICATE eventId dropped: ${n.eventId}`), e;
	let r = e.lastSequenceIds[n.source] ?? -1;
	if (n.sequenceId <= r) return {
		...e,
		system: {
			...e.system,
			errors: [...e.system.errors, {
				eventId: n.eventId,
				message: `Out-of-order sequenceId from ${n.source}`
			}]
		}
	};
	let i = {
		...e,
		processedEventIds: new Set(e.processedEventIds).add(n.eventId),
		lastSequenceIds: {
			...e.lastSequenceIds,
			[n.source]: n.sequenceId
		},
		timestamp: n.timestamp,
		system: {
			...e.system,
			eventCount: e.system.eventCount + 1
		}
	};
	if (n.type === "milestone.level_up") {
		let t = n.payload.newLevel ?? e.player.level + 1;
		i.player = {
			...e.player,
			level: t,
			xp: n.payload.xp ?? e.player.xp
		};
	}
	if (n.type === "economic.resource_gained") {
		let { resource: t, amount: r } = n.payload;
		i.player.resources = {
			...e.player.resources,
			[t]: (e.player.resources[t] || 0) + r
		};
	}
	if (n.type === "economic.reward_claimed") {
		let t = n.payload.amount ?? 25;
		i.player.resources = {
			...e.player.resources,
			gold: (e.player.resources.gold || 0) + t
		};
	}
	if (e.world.time.lastEventTimestamp) {
		let t = new Date(e.world.time.lastEventTimestamp).getTime(), r = new Date(n.timestamp).getTime();
		i.world.time.totalElapsedMs += Math.max(0, r - t);
	}
	return i.world.time.lastEventTimestamp = n.timestamp, i;
}
//#endregion
//#region src/core/kernel/bridge/VisualBridge.ts
var r = class {
	constructor(e) {
		this.listeners = [], this.currentState = e;
	}
	onStateUpdated(e) {
		this.currentState = e, this.notifyListeners();
	}
	subscribe(e) {
		return this.listeners.push(e), e(this.currentState), () => {
			this.listeners = this.listeners.filter((t) => t !== e);
		};
	}
	notifyListeners() {
		this.listeners.forEach((e) => {
			try {
				e(this.currentState);
			} catch (e) {
				console.error("[VisualBridge] Listener error:", e);
			}
		});
	}
	getCurrentState() {
		return this.currentState;
	}
}, i = class {
	constructor(e = "platform_state", t = "platform_event_log") {
		this.stateKey = e, this.eventLogKey = t, this.eventLog = [];
	}
	save(e) {
		try {
			let t = {
				...e,
				processedEventIds: Array.from(e.processedEventIds)
			};
			localStorage.setItem(this.stateKey, JSON.stringify(t)), localStorage.setItem(this.eventLogKey, JSON.stringify(this.eventLog)), console.log("[Persistor] State and event log saved to localStorage");
		} catch (e) {
			console.error("[Persistor] Failed to save state:", e);
		}
	}
	load() {
		try {
			let e = localStorage.getItem(this.stateKey);
			if (!e) return null;
			let t = JSON.parse(e);
			return t.processedEventIds = new Set(t.processedEventIds || []), console.log("[Persistor] Loaded state snapshot from localStorage"), t;
		} catch (e) {
			return console.error("[Persistor] Failed to load state:", e), null;
		}
	}
	logEvent(e) {
		this.eventLog.push(e);
	}
	rehydrate() {
		try {
			let e = localStorage.getItem(this.eventLogKey);
			if (!e) return null;
			let t = JSON.parse(e);
			if (t.length === 0) return null;
			console.log(`[Persistor] Rehydrating from ${t.length} events...`);
			let r = n(void 0, t[0]);
			for (let e = 1; e < t.length; e++) r = n(r, t[e]);
			return this.eventLog = [...t], console.log("[Persistor] Rehydration complete"), r;
		} catch (e) {
			return console.error("[Persistor] Rehydration failed:", e), null;
		}
	}
	clear() {
		localStorage.removeItem(this.stateKey), localStorage.removeItem(this.eventLogKey), this.eventLog = [], console.log("[Persistor] All persisted data cleared");
	}
	getEventLog() {
		return [...this.eventLog];
	}
}, a = class {
	constructor() {
		this.playerLevel = 1, this.resourcesSpent = 0;
	}
	init(e) {
		this.bus = e, this.bus.subscribe(this.handleEvent.bind(this)), console.log("[MonetizationLayer] Initialized and listening");
	}
	handleEvent(e) {
		e.type === "milestone.level_up" && (this.playerLevel = e.payload.newLevel ?? this.playerLevel, (this.playerLevel === 5 || this.playerLevel === 10) && this.offerReward("milestone", this.playerLevel)), e.type === "economic.resource_spent" && (this.resourcesSpent += e.payload.amount || 0, this.resourcesSpent >= 50 && (this.offerReward("spending", this.resourcesSpent), this.resourcesSpent = 0));
	}
	offerReward(e, t) {
		let n = {
			eventId: crypto.randomUUID(),
			sequenceId: Date.now(),
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			type: "system.reward_offered",
			payload: {
				trigger: e,
				value: t,
				rewardType: e === "milestone" ? "premium_currency" : "bonus_pack"
			},
			source: "monetization-layer",
			metadata: { version: "1.0.0" }
		};
		console.log(`[MonetizationLayer] Emitting reward offer: ${e} @ ${t}`), this.bus.emit(n);
	}
	destroy() {
		console.log("[MonetizationLayer] Destroyed");
	}
};
//#endregion
//#region src/dom/KernelObserver.ts
function o(e, t) {
	return t.split(".").reduce((e, t) => e?.[t], e);
}
var s = class {
	constructor(e, t = document) {
		this.bridge = e, this.root = t;
	}
	start() {
		return this.bridge.subscribe((e) => this.render(e));
	}
	render(e) {
		this.root.querySelectorAll("[data-kernel-bind]").forEach((t) => {
			let n = o(e, t.dataset.kernelBind || "");
			t.textContent = n == null ? "0" : String(n);
		});
	}
};
//#endregion
//#region src/dom/KernelSpawner.ts
function c(e) {
	return e.replace(/[&<>"]/g, (e) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;"
	})[e] || e);
}
var l = class {
	constructor(e) {
		this.zone = e, this.count = 0;
	}
	handle(e) {
		let t = this.mapEvent(e);
		t && this.spawn(t);
	}
	spawn(e) {
		this.count += 1, this.zone.querySelector(".kernel-canvas-empty")?.remove();
		let t = document.createElement("article");
		for (t.className = `kernel-spawn-card kernel-spawn-card--${e.tone}`, t.dataset.spawnIndex = String(this.count), t.innerHTML = `
      <div class="kernel-spawn-card__glow" aria-hidden="true"></div>
      <div class="kernel-spawn-card__topline">
        <span class="kernel-spawn-card__icon" aria-hidden="true">${c(e.icon)}</span>
        <span class="kernel-spawn-card__eyebrow">${c(e.eyebrow)}</span>
      </div>
      <h3>${c(e.title)}</h3>
      <p>${c(e.copy)}</p>
      ${e.stat ? `<strong class="kernel-spawn-card__stat">${c(e.stat)}</strong>` : ""}
    `, this.zone.prepend(t); this.zone.children.length > 6;) this.zone.lastElementChild?.remove();
	}
	mapEvent(e) {
		if (e.type === "milestone.level_up") {
			let t = e.payload.newLevel || "?";
			return {
				eyebrow: "Achievement unlocked",
				title: `Studio Level ${t}`,
				copy: "The hub powered up and unlocked a brighter signal tier.",
				icon: "🏆",
				tone: "gold",
				stat: `Level ${t}`
			};
		}
		if (e.type === "economic.resource_gained") {
			let t = e.payload.amount || 0;
			return {
				eyebrow: "Resource cache",
				title: `${t} ${e.payload.resource || "bytes"} collected`,
				copy: "A fresh cache was added to the living site economy.",
				icon: "✦",
				tone: "cyan",
				stat: `+${t}`
			};
		}
		return e.type === "system.reward_offered" ? {
			eyebrow: "Reward drop",
			title: "Bonus ready",
			copy: "The reward layer detected a qualifying action and staged a studio bonus.",
			icon: "🎁",
			tone: "pink",
			stat: e.payload.rewardType || "Bonus"
		} : null;
	}
}, u = "ibb_home_kernel", d = 0;
function f() {
	return {
		...t,
		timestamp: (/* @__PURE__ */ new Date()).toISOString(),
		processedEventIds: /* @__PURE__ */ new Set(),
		lastSequenceIds: {},
		player: {
			...t.player,
			resources: {
				gold: 0,
				bytes: 0,
				sparks: 0
			}
		},
		world: {
			...t.world,
			entities: {},
			time: {
				totalElapsedMs: 0,
				lastEventTimestamp: (/* @__PURE__ */ new Date()).toISOString()
			}
		},
		system: {
			eventCount: 0,
			errors: []
		}
	};
}
function p(e, t = {}, n = "ibb-homepage") {
	return {
		eventId: crypto.randomUUID(),
		sequenceId: ++d,
		timestamp: (/* @__PURE__ */ new Date()).toISOString(),
		type: e,
		payload: t,
		source: n,
		metadata: { version: "1.0.0" }
	};
}
function m() {
	let t = e.getInstance();
	t.reset();
	let o = new i(`${u}_state`, `${u}_event_log`), c = new r(o.rehydrate() || f());
	new a().init(t), new s(c).start();
	let d = document.getElementById("spawn-zone"), m = d ? new l(d) : null;
	t.subscribe((e) => {
		m?.handle(e);
		let t = c.getCurrentState(), r = n(t, e);
		r !== t && r.processedEventIds.has(e.eventId) && (o.logEvent(e), o.save(r)), c.onStateUpdated(r);
	});
	let h = {
		bus: t,
		bridge: c,
		emit: (e, n = {}, r) => t.emit(p(e, n, r)),
		getState: () => c.getCurrentState(),
		levelUp: () => {
			let e = c.getCurrentState().player.level || 1;
			return t.emit(p("milestone.level_up", {
				newLevel: e + 1,
				xp: e * 150
			}));
		},
		gain: (e = "bytes", n = 10) => t.emit(p("economic.resource_gained", {
			resource: e,
			amount: n
		})),
		spend: (e = "gold", n = 60) => t.emit(p("economic.resource_spent", {
			resource: e,
			amount: n
		})),
		clear: () => {
			o.clear(), window.location.reload();
		}
	};
	window.IttyBittyKernel = h, document.querySelectorAll("[data-kernel-event]").forEach((e) => {
		e.addEventListener("click", () => {
			let n = e.dataset.kernelEvent || "system.heartbeat", r = e.dataset.kernelPayload ? JSON.parse(e.dataset.kernelPayload) : {};
			n === "milestone.level_up" ? h.levelUp() : t.emit(p(n, r));
		});
	}), t.emit(p("lifecycle.start", { page: location.pathname })), window.setInterval(() => t.emit(p("system.heartbeat", { path: location.pathname })), 3e4);
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", m) : m();
//#endregion
