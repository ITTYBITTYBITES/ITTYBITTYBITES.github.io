import { n as e, t } from "./kernel-chunk-Registry.js";
//#region src/chamber.ts
function n() {
	let e = document.querySelector("nav a[href*=\"index.html\"]")?.getAttribute("href");
	if (e) return e;
	let t = (window.location.pathname.match(/\//g) || []).length;
	return t > 2 ? "../../index.html" : t > 1 ? "../index.html" : "./index.html";
}
function r(e, t) {
	if (document.getElementById("lm-legacy-bridge-header")) return;
	let n = document.createElement("header");
	n.id = "lm-legacy-bridge-header", n.style.cssText = "position:sticky;top:0;z-index:9999;background:rgba(0,16,28,0.85);backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,255,255,0.46);padding:12px 24px;display:flex;justify-content:space-between;align-items:center;color:#bfffff;font-family:monospace;box-shadow:0 0 20px rgba(0,255,255,0.15);", n.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;">
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#00ffff;box-shadow:0 0 10px #00ffff;"></span>
      <strong style="font-size:14px;letter-spacing:1px;text-transform:uppercase;">LM // ARCHIVE VAULT // ${e}</strong>
    </div>
    <div style="display:flex;gap:16px;">
      <a href="${t}" style="color:#00ffff;text-decoration:none;border:1px solid rgba(0,255,255,0.4);padding:6px 12px;border-radius:6px;font-size:12px;font-weight:bold;">&lt;&lt; MASTER PORTAL</a>
    </div>
  `;
	let r = document.createElement("footer");
	r.id = "lm-legacy-bridge-footer", r.style.cssText = "margin-top:60px;background:rgba(0,8,16,0.9);border-top:1px solid rgba(0,255,255,0.25);padding:24px;text-align:center;color:#6b8c96;font-family:monospace;font-size:12px;", r.innerHTML = `
    <p>LIQUID MEMORY // LEGACY PUBLICATION VAULT</p>
    <p style="margin-top:8px;"><a href="${t}" style="color:#00ffff;text-decoration:none;">Return to Holographic Hub</a></p>
  `, document.body && (document.body.insertBefore(n, document.body.firstChild), document.body.appendChild(r));
}
function i(e, n) {
	if (document.getElementById("lm-cross-pollination-banner")) return;
	let r = t.getAllNodes(), i;
	if (i = e?.category === "legacy" || window.location.pathname.includes("/articles/") ? r.find((e) => e.nodeId === "stroop-calibrator") || r.find((e) => e.category === "arcade") : r.find((e) => e.nodeId === "witness-chamber") || r.find((e) => e.category === "flagship"), !i || i.nodeId === e?.nodeId) return;
	let a = `${n.replace("index.html", "")}${i.route?.replace("./", "") || "index.html"}`, o = document.createElement("aside");
	o.id = "lm-cross-pollination-banner", o.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:99999;background:linear-gradient(135deg,#001628,#34135c);border:1px solid #00ffff;border-radius:16px;padding:16px 20px;box-shadow:0 10px 30px rgba(0,0,0,0.8),0 0 20px rgba(0,255,255,0.3);max-width:320px;color:#bfffff;font-family:monospace;", o.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <span style="font-size:10px;color:#facc15;font-weight:bold;letter-spacing:1px;">RECOMMENDED CHAMBER</span>
      <button onclick="this.closest('#lm-cross-pollination-banner').remove()" style="background:none;border:none;color:#bfffff;cursor:pointer;font-weight:bold;font-size:14px;">&times;</button>
    </div>
    <strong style="display:block;font-size:13px;color:#fff;margin-bottom:6px;">${i.title}</strong>
    <p style="font-size:11px;color:#aeb8d6;margin-bottom:12px;">${i.description || "Recommended next step in ecosystem."}</p>
    <a href="${a}" style="display:block;text-align:center;background:#00ffff;color:#001b1f;padding:8px;border-radius:8px;text-decoration:none;font-size:11px;font-weight:900;text-transform:uppercase;">ENGAGE PIPELINE &rarr;</a>
  `, document.body && document.body.appendChild(o);
}
function a() {
	let a = document.querySelector("main[data-gear-id], body[data-gear-id], main[data-kernel-event]") || document.body, s = a?.getAttribute("data-gear-id") || "games", c = a?.getAttribute("data-kernel-event") || "library.game_opened", l = window.location.pathname, u = l.split("/").pop()?.replace(".html", "") || "", d = t.lookup(u) || t.lookup(c) || t.lookup(s), f = d?.title || (s === "archive" ? "Old Memory Vault" : "Arcade Genesis"), p = n();
	if ((d?.isLegacyStatic || l.includes("/articles/") || document.body?.classList.contains("legacy-article")) && r(f, p), i(d, p), e.markPortalArrival(f), d?.nodeId === "cog-assess-01" || d?.payload?.type === "interactive-assessment" || l.includes("cog-assess-01")) {
		let t = document.createElement("section");
		t.id = "lm-cog-assessment-hud", t.style.cssText = "position:relative;min-height:340px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid #58ffbd;border-radius:24px;padding:24px;margin:24px 0;background:rgba(2,6,23,0.92);box-shadow:0 0 30px rgba(88,255,189,0.18);font-family:monospace;select-none;";
		let n = document.createElement("div");
		n.id = "assess-throughput-pill", n.style.cssText = "font-size:14px;color:#58ffbd;font-weight:900;letter-spacing:1px;margin-bottom:20px;padding:8px 16px;background:rgba(0,0,0,0.6);border:1px solid rgba(88,255,189,0.4);border-radius:12px;", n.textContent = "THROUGHPUT HUD // Awaiting Stimulus";
		let r = document.createElement("div");
		r.id = "assess-stimulus-target", r.style.cssText = "width:80px;height:80px;border-radius:16px;background:#58ffbd;box-shadow:0 0 25px #58ffbd;cursor:pointer;transition:transform .1s;display:flex;align-items:center;justify-content:center;color:#020617;font-weight:900;font-size:12px;", r.textContent = "ENGAGE";
		let i = performance.now(), o = () => {
			i = performance.now(), r.style.background = "#ff00ff", r.style.boxShadow = "0 0 30px #ff00ff", r.textContent = "CLICK";
		};
		setTimeout(o, 800);
		let s = () => {
			let t = Math.round(performance.now() - i);
			e.capture(d?.nodeId || "cog-assess-01", t), n.textContent = `THROUGHPUT HUD // Recorded: ${t} ms`;
			let a = document.getElementById("spatial-live-region") || document.querySelector("[aria-live=\"polite\"]");
			a && (a.textContent = `Reaction time recorded: ${t} milliseconds`), r.style.background = "#22d3ee", r.style.boxShadow = "0 0 20px #22d3ee", r.textContent = `${t}ms`, setTimeout(o, 1500 + Math.random() * 1e3);
		};
		r.addEventListener("pointerdown", (e) => {
			e.stopPropagation(), s();
		}), t.appendChild(n), t.appendChild(r), a?.insertBefore(t, a.firstChild);
		let c = document.createElement("button");
		c.className = "sr-only assess-twin-btn", c.tabIndex = 0, c.id = "twin-node-cog-assess-01", c.setAttribute("aria-label", "Cognitive Assessment Stimulus Target Twin. Press Enter or Space to record reaction time."), c.addEventListener("keydown", (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), s());
		}), document.body && document.body.appendChild(c);
	}
	if (!document.getElementById(`twin-spatial-${d?.nodeId || u || s}`)) {
		let e = document.createElement("button");
		e.className = "sr-only chamber-twin-btn", e.tabIndex = 0, e.id = `twin-spatial-${d?.nodeId || u || s}`, e.setAttribute("aria-label", `Spatial Twin: ${f}. Press Enter to return to Master Hub.`), e.addEventListener("keydown", (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), m("twin-keyboard-exit"), window.location.assign(p));
		}), document.body && document.body.appendChild(e);
	}
	let m = (t) => {
		e.storeChamberDeparture(f, c, l, t);
	};
	window.addEventListener("pagehide", () => m("pagehide"), { passive: !0 }), document.addEventListener("visibilitychange", () => {
		document.visibilityState === "hidden" && m("visibility-hidden");
	}, { passive: !0 });
	let h = null, g = 0, _ = 0, v = 0, y = 0;
	document.addEventListener("pointerdown", (e) => {
		h !== null || e.button > 0 || e.pointerType !== "touch" || (h = e.pointerId, g = e.clientX, _ = e.clientY, v = 0, y = 0);
	}, { passive: !0 }), document.addEventListener("pointermove", (e) => {
		h === e.pointerId && (v = e.clientX - g, y = e.clientY - _);
	}, { passive: !0 }), document.addEventListener("pointerup", (e) => {
		if (h !== e.pointerId) return;
		let t = Math.abs(v), n = Math.abs(y);
		h = null, t >= 70 && t > n * 1.2 && (m("portal-swipe-exit"), window.location.assign(p));
	}, { passive: !0 }), document.addEventListener("pointercancel", () => {
		h = null;
	}, { passive: !0 }), window.LiquidMemoryChamber = {
		version: "1.0.0",
		telemetry: e,
		registry: t,
		mountSpatialAssetNode: o
	};
}
async function o(e, t) {
	let n = await (await fetch(t)).text(), r = new DOMParser().parseFromString(n, "text/html"), i = r.querySelector("#spatial-root") || r.querySelector(".liquid-main") || r.body.firstChild;
	if (!i) return;
	(i instanceof Element || i instanceof DocumentFragment) && i.querySelectorAll("nav, header#lm-legacy-bridge-header").forEach((e) => e.remove());
	let a = document.getElementById("chamber") || document.querySelector("main");
	a && (a.innerHTML = "", a.appendChild(i));
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", a) : a();
//#endregion
export { o as mountSpatialAssetNode };
