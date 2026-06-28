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
	let a = 1, s = 240;
	try {
		let e = localStorage.getItem("lm_telemetry_cog-assess-01");
		if (e) {
			let t = (JSON.parse(e).throughputMs || []).slice(-10);
			t.length > 0 && (s = Math.round(t.reduce((e, t) => e + t, 0) / t.length), s < 200 ? a = 1.2 : s > 300 && (a = .8));
		}
	} catch {}
	window.LiquidMemoryPacingFactor = a, localStorage.setItem("lm_adaptive_pacing_factor", String(a)), localStorage.setItem("lm_adaptive_average_throughput", String(s));
	let c = document.querySelector("main[data-gear-id], body[data-gear-id], main[data-kernel-event]") || document.body, l = c?.getAttribute("data-gear-id") || "games", u = c?.getAttribute("data-kernel-event") || "library.game_opened", d = window.location.pathname, f = d.split("/").pop()?.replace(".html", "") || "", p = t.lookup(f) || t.lookup(u) || t.lookup(l), m = p?.title || (l === "archive" ? "Old Memory Vault" : "Arcade Genesis"), h = n();
	if ((p?.isLegacyStatic || d.includes("/articles/") || document.body?.classList.contains("legacy-article")) && r(m, h), i(p, h), e.markPortalArrival(m), p?.nodeId === "cog-assess-01" || p?.payload?.type === "interactive-assessment" || d.includes("cog-assess-01")) {
		let t = document.createElement("section");
		t.id = "lm-cog-assessment-hud", t.style.cssText = "position:relative;min-height:340px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid #58ffbd;border-radius:24px;padding:24px;margin:24px 0;background:rgba(2,6,23,0.92);box-shadow:0 0 30px rgba(88,255,189,0.18);font-family:monospace;select-none;";
		let n = document.createElement("div");
		n.id = "assess-throughput-pill", n.style.cssText = "font-size:14px;color:#58ffbd;font-weight:900;letter-spacing:1px;margin-bottom:20px;padding:8px 16px;background:rgba(0,0,0,0.6);border:1px solid rgba(88,255,189,0.4);border-radius:12px;", n.textContent = "THROUGHPUT HUD // Awaiting Stimulus";
		let r = document.createElement("div");
		r.id = "assess-stimulus-target", r.style.cssText = "width:80px;height:80px;border-radius:16px;background:#58ffbd;box-shadow:0 0 25px #58ffbd;cursor:pointer;transition:transform .1s;display:flex;align-items:center;justify-content:center;color:#020617;font-weight:900;font-size:12px;", r.textContent = "ENGAGE";
		let i = performance.now(), a = () => {
			i = performance.now(), r.style.background = "#ff00ff", r.style.boxShadow = "0 0 30px #ff00ff", r.textContent = "CLICK";
		};
		setTimeout(a, 800);
		let o = () => {
			let t = Math.round(performance.now() - i);
			e.capture(p?.nodeId || "cog-assess-01", t), n.textContent = `THROUGHPUT HUD // Recorded: ${t} ms`;
			let o = document.getElementById("spatial-live-region") || document.querySelector("[aria-live=\"polite\"]");
			o && (o.textContent = `Reaction time recorded: ${t} milliseconds`), r.style.background = "#22d3ee", r.style.boxShadow = "0 0 20px #22d3ee", r.textContent = `${t}ms`, setTimeout(a, 1500 + Math.random() * 1e3);
		};
		r.addEventListener("pointerdown", (e) => {
			e.stopPropagation(), o();
		}), t.appendChild(n), t.appendChild(r), c?.insertBefore(t, c.firstChild);
		let s = document.createElement("button");
		s.className = "sr-only assess-twin-btn", s.tabIndex = 0, s.id = "twin-node-cog-assess-01", s.setAttribute("aria-label", "Cognitive Assessment Stimulus Target Twin. Press Enter or Space to record reaction time."), s.addEventListener("keydown", (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), o());
		}), document.body && document.body.appendChild(s);
	}
	if (!document.getElementById(`twin-spatial-${p?.nodeId || f || l}`)) {
		let e = document.createElement("button");
		e.className = "sr-only chamber-twin-btn", e.tabIndex = 0, e.id = `twin-spatial-${p?.nodeId || f || l}`, e.setAttribute("aria-label", `Spatial Twin: ${m}. Press Enter to return to Master Hub.`), e.addEventListener("keydown", (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), g("twin-keyboard-exit"), window.location.assign(h));
		}), document.body && document.body.appendChild(e);
	}
	let g = (t) => {
		e.storeChamberDeparture(m, u, d, t);
	};
	window.addEventListener("pagehide", () => g("pagehide"), { passive: !0 }), document.addEventListener("visibilitychange", () => {
		document.visibilityState === "hidden" && g("visibility-hidden");
	}, { passive: !0 });
	let _ = null, v = 0, y = 0, b = 0, x = 0;
	document.addEventListener("pointerdown", (e) => {
		_ !== null || e.button > 0 || e.pointerType !== "touch" || (_ = e.pointerId, v = e.clientX, y = e.clientY, b = 0, x = 0);
	}, { passive: !0 }), document.addEventListener("pointermove", (e) => {
		_ === e.pointerId && (b = e.clientX - v, x = e.clientY - y);
	}, { passive: !0 }), document.addEventListener("pointerup", (e) => {
		if (_ !== e.pointerId) return;
		let t = Math.abs(b), n = Math.abs(x);
		_ = null, t >= 70 && t > n * 1.2 && (g("portal-swipe-exit"), window.location.assign(h));
	}, { passive: !0 }), document.addEventListener("pointercancel", () => {
		_ = null;
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
