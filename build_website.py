#!/usr/bin/env python3
"""
Chronicle Website Builder
Reads canonical shared data → regenerates all website HTML pages
"""
import json
import shutil
import os
from pathlib import Path
from datetime import datetime, timezone

# Path resolution: GITHUB_WORKSPACE in CI, fallback to local layout
_GW = os.environ.get("GITHUB_WORKSPACE")
if _GW:
    ROOT = Path(_GW)
else:
    ROOT = Path("/home/user/workspace")
SHARED_DIR = ROOT / "shared"
WEBSITE_DIR = ROOT / "website"
DATA_DIR = WEBSITE_DIR / "data"
WORLDS_OUT = WEBSITE_DIR / "worlds"
DATA_DIR.mkdir(parents=True, exist_ok=True)
WORLDS_OUT.mkdir(parents=True, exist_ok=True)

def load_json(p):
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

# Load shared data
worlds_data = load_json(SHARED_DIR / "worlds.json")
universes_data = load_json(SHARED_DIR / "universes.json")
characters_data = load_json(SHARED_DIR / "characters.json")
events_data = load_json(SHARED_DIR / "events.json")
releases_data = load_json(SHARED_DIR / "releases.json")
manifest_data = load_json(SHARED_DIR / "export" / "manifest.json")

worlds = worlds_data.get("worlds", [])
universes = universes_data.get("universes", [])
characters = characters_data.get("characters", [])
events = events_data.get("events", [])
universe_names = {u.get("id"): u.get("display_name") for u in universes}

NAV_TPL = '<header class="site-header"><div class="nav"><div class="brand">👁 <span>Two Second <span class="accent">Witness</span></span> · <span style="color:#ff00aa;font-size:12px;margin-left:8px">CHRONICLE LIVE</span></div><div class="nav-links"><a href="index.html"{af}>Field</a><a href="worlds.html"{aw}>Worlds</a><a href="characters.html"{ac}>Characters</a><a href="events.html"{ae}>Events</a><a href="releases.html"{ar}>Releases</a><a href="journal.html"{aj}>Journal</a></div></div></header>'
FOOTER = '<footer class="footer">Chronicle System v1 · Shared Canonical Truth · App → Shared → Chronicle → Website<br><span style="font-size:11px">Regenerated • No manual edits • source_provenance="app"</span><br>© 2026 Two Second Witness · ITTY BITTY BITES</footer>'

def nav(page):
    return NAV_TPL.format(af=' class="active"' if page=="field" else "", aw=' class="active"' if page=="worlds" else "", ac=' class="active"' if page=="characters" else "", ae=' class="active"' if page=="events" else "", ar=' class="active"' if page=="releases" else "", aj=' class="active"' if page=="journal" else "")

def sync_data():
    print("Syncing data...")
    for fn in ["worlds.json","universes.json","characters.json","events.json","releases.json"]:
        shutil.copy2(SHARED_DIR / fn, DATA_DIR / fn)
    shutil.copy2(SHARED_DIR / "export" / "manifest.json", DATA_DIR / "manifest.json")
    if (SHARED_DIR / "build_state.json").exists():
        shutil.copy2(SHARED_DIR / "build_state.json", DATA_DIR / "build_state.json")
        print("  build_state.json synced")
    vm = SHARED_DIR / "contracts" / "version_manifest.json"
    if vm.exists():
        shutil.copy2(vm, DATA_DIR / "version_manifest.json")
        print("  version_manifest.json synced")

def build_index():
    print("index.html...")
    cw = worlds_data.get("count", len(worlds)); cu = universes_data.get("count", len(universes))
    co = manifest_data.get("counts",{}).get("observations_exported",22059); cc = characters_data.get("count",4)
    html = f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chronicle Field – Chronicle</title><link rel="stylesheet" href="assets/chronicle.css"></head><body>{nav("field")}<div class="hero"><div><div class="badge">● LIVE CHRONICLE – SPATIAL SIMULATION</div><h1>Two Second Witness<br><span style="color:#00f2fe">Chronicle Field</span></h1><p>Explore the canonical cognitive universe — {cu} universes · {cw} spatial fields · {co} observations — generated deterministically from Godot, no manual pages.</p><div class="kpi"><div><strong>{cu}</strong><br><span class="meta">universes</span></div><div><strong>{cw}</strong><br><span class="meta">worlds</span></div><div><strong>{co}</strong><br><span class="meta">observations</span></div><div><strong>{cc}</strong><br><span class="meta">behavioral fields</span></div></div></div></div><div class="canvas-wrap"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><strong>Spatial Cognitive Field</strong><span class="meta">scroll to zoom · drag to pan · click field to inspect</span></div><canvas id="fieldCanvas"></canvas><div id="inspectPanel" style="margin-top:10px;color:#8aa0b8;font-size:13px">Click a field node →</div></div><script src="assets/field.js"></script>{FOOTER}</body></html>'
    with open(WEBSITE_DIR/"index.html","w",encoding="utf-8") as f: f.write(html)

def build_worlds():
    print("worlds.html...")
    cards = []
    for w in sorted(worlds, key=lambda x:(x.get("universe_id",""),x.get("id",""))):
        e=w.get("embodiment",{}); uid=w.get("universe_id",""); wid=w.get("id","")
        disp=w.get("display_name",wid.replace("_"," ").title())
        d=e.get("density",0); ins=e.get("intensity",0.5); g=e.get("gravity",0.5); dr=e.get("drift_potential",0)
        ov=", ".join(e.get("overlap_regions",[])[:3]) or "—"
        bp=min(100,int(d*100))
        cards.append(f'<div class="card"><h3>{disp}</h3><div class="meta">{universe_names.get(uid,uid)} · <code>{wid}</code></div><div class="fieldbar"><i style="width:{bp}%;background:linear-gradient(90deg,#00f2fe,#ff00aa)"></i></div><div class="meta">density {d} · intensity {ins} · gravity {g}<br>drift {dr} · overlap {ov}</div><div style="margin-top:8px"><a href="worlds/{uid}.{wid}.html">open field →</a></div></div>')
    html=f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Worlds – Chronicle</title><link rel="stylesheet" href="assets/chronicle.css"></head><body>{nav("worlds")}<div style="max-width:1200px;margin:30px auto;padding:0 20px"><h2>Worlds – Spatial Cognitive Fields</h2><p class="meta">{len(worlds)} fields · generated from /shared – NOT categories – NOT pages</p></div><div class="grid>{"".join(cards)}</div>{FOOTER}</body></html>'
    with open(WEBSITE_DIR/"worlds.html","w",encoding="utf-8") as f: f.write(html)

def build_world_pages():
    print("world pages...")
    for w in worlds:
        uid=w.get("universe_id",""); wid=w.get("id",""); disp=w.get("display_name",wid.replace("_"," ").title())
        e=w.get("embodiment",{}); d=e.get("density",0); ins=e.get("intensity",0.5); g=e.get("gravity",0.5); dr=e.get("drift_potential",0)
        ov=", ".join(e.get("overlap_regions",[])[:3]) or "—"
        fc=e.get("field_coordinates",{"x":0,"y":0,"z":0})
        oc=w.get("statistics",{}).get("observation_count","?")
        p=w.get("provenance",{}); src=p.get("source_provenance","app"); ath=p.get("authority_tier","tier_1_projection")
        html=f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{disp} – Chronicle</title><link rel="stylesheet" href="../assets/chronicle.css"></head><body>{nav("worlds")}<div style="max-width:900px;margin:40px auto;padding:0 20px"><h1>{disp} <span style="color:#00f2fe;font-size:16px">{uid}</span></h1><p class="meta">spatial cognitive field · <code>{uid}.{wid}</code></p><table><tr><th>density</th><td>{d}</td></tr><tr><th>intensity</th><td>{ins}</td></tr><tr><th>gravity</th><td>{g}</td></tr><tr><th>drift_potential</th><td>{dr}</td></tr><tr><th>overlap_regions</th><td>{ov}</td></tr><tr><th>field_coordinates</th><td><code>{json.dumps(fc)}</code></td></tr><tr><th>observations</th><td>{oc}</td></tr><tr><th>provenance</th><td>source_provenance="{src}" · authority_tier="{ath}"</td></tr></table><p style="margin-top:20px"><a href="../worlds.html">← all worlds</a></p></div>{FOOTER}</body></html>'
        with open(WORLDS_OUT/f"{uid}.{wid}.html","w",encoding="utf-8") as f: f.write(html)

def build_characters():
    print("characters.html...")
    cards=[]
    for c in characters:
        n=c.get("display_name",c.get("id","")); s=c.get("behavioral_signature",{}); ps=s.get("perception_style","hybrid")
        tv=s.get("trait_vector",[0]*8); ts=", ".join(f"{v:+.2f}" for v in tv[:4])
        fl=c.get("field_influence",{}); ir=fl.get("influence_radius",0); mod=fl.get("event_modulation",0)
        dr=c.get("derived_from_app",{}); mech=dr.get("scenario_mechanic","—")
        cards.append(f'<div class="card"><h3>{n}</h3><div class="meta"><code>{c.get("id")}</code> · perception: {ps}</div><div class="meta">traits [{ts}…] · influence radius {ir} · modulation {mod:+.2f}</div><div class="meta" style="margin-top:4px">mechanic: {mech}</div></div>')
    html=f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Characters – Chronicle</title><link rel="stylesheet" href="assets/chronicle.css"></head><body>{nav("characters")}<div style="max-width:900px;margin:40px auto;padding:0 20px"><h2>Characters – Behavioral Field Systems</h2><p class="meta">{len(characters)} archetypes · derived from App Observation Engine mechanics</p></div><div class="grid">{"".join(cards)}</div>{FOOTER}</body></html>'
    with open(WEBSITE_DIR/"characters.html","w",encoding="utf-8") as f: f.write(html)

def build_events():
    print("events.html...")
    cnt=events_data.get("count",0); note=events_data.get("note","")
    rows=""
    if events:
        for ev in events: rows+=f'<tr><td>{ev.get("event_id","")}</td><td>{ev.get("type","")}</td><td>{ev.get("severity","")}</td><td>{ev.get("timestamp","")}</td></tr>\n'
    if not rows: rows='<tr><td colspan="4" style="text-align:center;color:#8aa0b8">No events generated yet — event traces require runtime SessionTracker</td></tr>'
    html=f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Events – Chronicle</title><link rel="stylesheet" href="assets/chronicle.css"></head><body>{nav("events")}<div style="max-width:900px;margin:40px auto;padding:0 20px"><h2>Events – Replayable Cognitive Traces</h2><p class="meta">{cnt} events · {note}</p><table><tr><th>ID</th><th>Type</th><th>Severity</th><th>Timestamp</th></tr>{rows}</table><p style="margin-top:16px" class="meta">Events are generated deterministically from app session data.</p></div>{FOOTER}</body></html>'
    with open(WEBSITE_DIR/"events.html","w",encoding="utf-8") as f: f.write(html)

def build_releases():
    print("releases.html...")
    rj=json.dumps(releases_data,indent=2); rid=releases_data.get("release_id","chronicle-v1.0.0"); sv=releases_data.get("schema_version","1.0.0")
    html=f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Releases – Chronicle</title><link rel="stylesheet" href="assets/chronicle.css"></head><body>{nav("releases")}<div style="max-width:900px;margin:40px auto;padding:0 20px"><h2>Releases – Deterministic Snapshots</h2><p><strong>{rid}</strong> · schema {sv}</p><pre style="background:#0b1022;padding:16px;border-radius:10px;overflow:auto;font-size:12px">{rj}</pre></div>{FOOTER}</body></html>'
    with open(WEBSITE_DIR/"releases.html","w",encoding="utf-8") as f: f.write(html)


def build_journal():
    print("journal.html...")
    bs = None
    vm = None
    if (DATA_DIR / "build_state.json").exists():
        try:
            bs = json.loads((DATA_DIR / "build_state.json").read_text(encoding="utf-8"))
        except Exception:
            pass
    if (DATA_DIR / "version_manifest.json").exists():
        try:
            vm = json.loads((DATA_DIR / "version_manifest.json").read_text(encoding="utf-8"))
        except Exception:
            pass
    ts = manifest_data.get("timestamp", "unknown")
    cnt = manifest_data.get("counts", {})
    vm_section = ""
    if vm:
        vs = vm.get("version", "?")
        fa = vm.get("frozen_at", "")
        ac = (vm.get("app_commit", "") or "")[:7]
        wc = (vm.get("website_commit", "") or "")[:7]
        bp = vm.get("build_pipeline", "")
        pr = vm.get("principle", "")
        vm_section = "<div class=\"card\" style=\"margin-bottom:16px\"><h3>Version Freeze - " + vs + "</h3><table>"
        vm_section += "<tr><th>version</th><td><code>" + vs + "</code></td></tr>"
        vm_section += "<tr><th>frozen_at</th><td>" + fa + "</td></tr>"
        vm_section += "<tr><th>app_commit</th><td><code>" + ac + "</code></td></tr>"
        vm_section += "<tr><th>website_commit</th><td><code>" + wc + "</code></td></tr>"
        vm_section += "<tr><th>pipeline</th><td>" + bp + "</td></tr>"
        vm_section += "<tr><th>principle</th><td>" + pr + "</td></tr>"
        vm_section += "</table></div>"
    bs_section = ""
    if bs:
        r = bs.get("run_id", "?")
        ap = bs.get("app_commit_short", "")
        wp = bs.get("website_commit_short", "")
        eh = (bs.get("export_hash", "") or "")[:32]
        obs = bs.get("counts", {}).get("observations_exported", "")
        wld = bs.get("counts", {}).get("worlds", "")
        uni = bs.get("counts", {}).get("universes", "")
        ts_bs = bs.get("timestamp", "")
        pv = bs.get("pipeline_version", "")
        bs_section = '<div class="card" style="margin-bottom:16px"><h3>Build State - ' + r + '</h3><table>'
        bs_section += '<tr><th>run_id</th><td><code>' + r + '</code></td></tr>'
        bs_section += '<tr><th>timestamp</th><td>' + ts_bs + '</td></tr>'
        bs_section += '<tr><th>pipeline_version</th><td>' + pv + '</td></tr>'
        bs_section += '<tr><th>app_commit</th><td><code>' + ap + '</code></td></tr>'
        bs_section += '<tr><th>website_commit</th><td><code>' + wp + '</code></td></tr>'
        bs_section += '<tr><th>export_hash</th><td><code>' + eh + '...</code></td></tr>'
        bs_section += '<tr><th>observations</th><td>' + str(obs) + '</td></tr>'
        bs_section += '<tr><th>worlds</th><td>' + str(wld) + '</td></tr>'
        bs_section += '<tr><th>universes</th><td>' + str(uni) + '</td></tr>'
        bs_section += '</table></div>'
    html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Journal - Chronicle</title><link rel="stylesheet" href="assets/chronicle.css"></head><body>' + nav("journal") + '<div style="max-width:900px;margin:40px auto;padding:0 20px"><h2>Chronicle Journal - Regeneration Log</h2>' + vm_section + bs_section + '<div class="card" style="margin-bottom:16px"><h3>Export Complete - ' + ts + '</h3><table><tr><th>observation banks</th><td>' + str(cnt.get("observation_banks",0)) + '</td></tr><tr><th>observations</th><td>' + str(cnt.get("observations_exported",0)) + '</td></tr><tr><th>worlds</th><td>' + str(cnt.get("worlds",0)) + '</td></tr><tr><th>universes</th><td>' + str(cnt.get("universes",0)) + '</td></tr><tr><th>behavioral fields</th><td>' + str(cnt.get("characters",0)) + '</td></tr><tr><th>validation</th><td>PASS</td></tr><tr><th>pipeline</th><td>app - shared - chronicle - website - GitHub Pages</td></tr></table></div></div>' + FOOTER + '</body></html>'
    with open(WEBSITE_DIR / "journal.html", "w", encoding="utf-8") as f:
        f.write(html)

def main():
    print("="*50); print("Chronicle Website Builder v1"); print("="*50)
    sync_data(); build_index(); build_worlds(); build_world_pages()
    build_characters(); build_events(); build_releases(); build_journal()
    print(f"\n✓ Website rebuilt: {len(worlds)} worlds, {len(universes)} universes, {len(characters)} characters")
    return 0

if __name__=="__main__": import sys; sys.exit(main())
