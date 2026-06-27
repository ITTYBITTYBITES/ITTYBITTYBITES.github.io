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
function i() {
	let i = document.querySelector("main[data-gear-id], body[data-gear-id], main[data-kernel-event]") || document.body, a = i?.getAttribute("data-gear-id") || "games", o = i?.getAttribute("data-kernel-event") || "library.game_opened", s = window.location.pathname, c = s.split("/").pop()?.replace(".html", "") || "", l = t.lookup(o) || t.lookup(c) || t.lookup(a), u = l?.title || (a === "archive" ? "Old Memory Vault" : "Arcade Genesis"), d = n();
	(l?.isLegacyStatic || s.includes("/articles/") || document.body?.classList.contains("legacy-article")) && r(u, d), e.markPortalArrival(u);
	let f = (t) => {
		e.storeChamberDeparture(u, o, s, t);
	};
	window.addEventListener("pagehide", () => f("pagehide"), { passive: !0 }), document.addEventListener("visibilitychange", () => {
		document.visibilityState === "hidden" && f("visibility-hidden");
	}, { passive: !0 });
	let p = null, m = 0, h = 0, g = 0, _ = 0;
	document.addEventListener("pointerdown", (e) => {
		p !== null || e.button > 0 || e.pointerType !== "touch" || (p = e.pointerId, m = e.clientX, h = e.clientY, g = 0, _ = 0);
	}, { passive: !0 }), document.addEventListener("pointermove", (e) => {
		p === e.pointerId && (g = e.clientX - m, _ = e.clientY - h);
	}, { passive: !0 }), document.addEventListener("pointerup", (e) => {
		if (p !== e.pointerId) return;
		let t = Math.abs(g), n = Math.abs(_);
		p = null, t >= 70 && t > n * 1.2 && (f("portal-swipe-exit"), window.location.assign(d));
	}, { passive: !0 }), document.addEventListener("pointercancel", () => {
		p = null;
	}, { passive: !0 }), window.LiquidMemoryChamber = {
		version: "1.0.0",
		telemetry: e,
		registry: t
	};
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", i) : i();
//#endregion
