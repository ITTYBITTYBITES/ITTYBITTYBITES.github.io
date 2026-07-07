#!/usr/bin/env python3
"""
Chronicle Website Builder – v2 Experience Redesign
Reads canonical shared data → regenerates all website HTML pages
Presentation only – no logic changes to engine/evolution
"""
import json
import shutil
import os
from pathlib import Path
from datetime import datetime, timezone

# Path resolution
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

def load_json(p, default=None):
    try:
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

# Load shared data
worlds_data = load_json(SHARED_DIR / "worlds.json", {"worlds":[], "count":0})
universes_data = load_json(SHARED_DIR / "universes.json", {"universes":[], "count":0})
characters_data = load_json(SHARED_DIR / "characters.json", {"characters":[], "count":0})
events_data = load_json(SHARED_DIR / "events.json", {"events":[], "count":0})
releases_data = load_json(SHARED_DIR / "releases.json", {})
manifest_data = load_json(SHARED_DIR / "export" / "manifest.json", {})

worlds = worlds_data.get("worlds", [])
universes = universes_data.get("universes", [])
characters = characters_data.get("characters", [])
events = events_data.get("events", [])

# Evolution data – read-only
def load_evo(rel, default_key="worlds"):
    p = SHARED_DIR / "evolution" / rel
    if p.exists():
        try: return load_json(p, {})
        except: pass
    return {"model_version":"none", default_key:[]}

ranking_data = load_evo("ranking.json", "worlds")
lifecycle_data = load_evolution_json = load_evo("lifecycle.json", "worlds")
placement_data = load_evo("placement.json", "placements")
proposals_data = load_evo("growth_proposals.json", "proposals")
approvals_data = load_evo("approvals.json", "approvals")
queue_data = load_evo("generation_queue.json", "queue")
history_data = load_evo("generation_history.json", "executions")

rank_map = {w.get("world_id"): w for w in ranking_data.get("worlds", [])}
lifecycle_map = {w.get("world_id"): w for w in lifecycle_data.get("worlds", [])}
placement_map = {p.get("world_id"): p for p in placement_data.get("placements", [])}

def evo_for(world_id):
    r = rank_map.get(world_id, {})
    lc = lifecycle_map.get(world_id, {})
    pl = placement_map.get(world_id, {})
    return {
        "rank": r.get("rank", 999),
        "score": r.get("score", 0.0),
        "lifecycle": lc.get("state", "archived"),
        "placement": pl.get("placement_target", "archive"),
    }

# Universe display names
universe_names = {u.get("id"): u.get("display_name", u.get("id","").replace("_"," ").title()) for u in universes}
# Ensure all universe_ids found in worlds have a name
for w in worlds:
    uid = w.get("universe_id","")
    if uid and uid not in universe_names:
        universe_names[uid] = uid.replace("_"," ").title()

# --- Shared layout ---
NAV_LINKS = [
    ("index.html", "Home", "home"),
    ("explore.html", "Explore", "explore"),
    ("evolution.html", "Evolution", "evolution"),
    ("journal.html", "Journal", "journal"),
    ("about.html", "About", "about"),
]

def nav_html(active):
    links = ""
    for href, label, key in NAV_LINKS:
        cls = ' class="active"' if key == active else ""
        links += f'<a href="{href}"{cls}>{label}</a>'
    return f'''<header class="site-header">
  <div class="nav">
    <a class="brand" href="index.html">👁 <span>Two Second <strong>Witness</strong></span></a>
    <nav class="nav-links">{links}</nav>
    <button class="nav-toggle" aria-label="Menu" onclick="document.querySelector('.nav-links').classList.toggle('open')">☰</button>
  </div>
</header>'''

FOOTER_HTML = '''<footer class="footer">
  <div class="footer-inner">
    <div><strong>Two Second Witness</strong> · Chronicle System</div>
    <div class="footer-meta">Deterministic cognitive universe · App → Shared → Chronicle → Website<br>© 2026 ITTY BITTY BITES · source_provenance="app" · authority_tier="tier_1_projection"</div>
  </div>
</footer>'''

def page_wrap(title, active_nav, body_html, extra_head=""):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} – Two Second Witness</title>
<link rel="stylesheet" href="assets/chronicle.css">
{extra_head}
</head>
<body>
{nav_html(active_nav)}
<main>
{body_html}
</main>
{FOOTER_HTML}
</body>
</html>'''

def page_wrap_root(title, active_nav, body_html, extra_head=""):
    # for pages in subdirectories (worlds/)
    return page_wrap(title, active_nav, body_html, extra_head.replace('href="assets/', 'href="../assets/'))

# --- Data sync ---
def sync_data():
    print("Syncing data...")
    for fn in ["worlds.json","universes.json","characters.json","events.json","releases.json"]:
        src = SHARED_DIR / fn
        if src.exists():
            shutil.copy2(src, DATA_DIR / fn)
    for src_rel, dst_name in [
        ("export/manifest.json", "manifest.json"),
        ("build_state.json", "build_state.json"),
        ("contracts/version_manifest.json", "version_manifest.json"),
    ]:
        src = SHARED_DIR / src_rel
        if src.exists():
            shutil.copy2(src, DATA_DIR / dst_name)
    evo_dir = SHARED_DIR / "evolution"
    if evo_dir.exists():
        for fn in ["ranking.json","lifecycle.json","placement.json","growth_proposals.json","approvals.json","generation_queue.json","generation_history.json"]:
            src = evo_dir / fn
            if src.exists():
                shutil.copy2(src, DATA_DIR / fn)

# --- Home ---
def build_index():
    print("index.html – Home")
    # counts
    cw = worlds_data.get("count", len(worlds))
    cu = len(universe_names)
    co = manifest_data.get("counts", {}).get("observations_exported", 22059)
    # featured worlds – top 3 active ranked
    ranked_worlds = sorted(
        [w for w in worlds if evo_for(w["id"])["lifecycle"] == "active"],
        key=lambda w: evo_for(w["id"])["rank"]
    )[:3]
    if not ranked_worlds:
        ranked_worlds = sorted(worlds, key=lambda w: w.get("id",""))[:3]
    featured_cards = ""
    for w in ranked_worlds:
        uid = w["universe_id"]; wid = w["id"]
        disp = w.get("display_name", wid.replace("_"," ").title())
        oc = w.get("statistics",{}).get("observation_count","?")
        featured_cards += f'''
        <div class="feature-card">
          <div class="meta">{universe_names.get(uid, uid)}</div>
          <h3>{disp}</h3>
          <div class="meta">{oc} observations</div>
          <a class="link-arrow" href="worlds/{uid}.{wid}.html">Explore →</a>
        </div>'''
    # KPI with evolution awareness
    active_count = sum(1 for w in worlds if evo_for(w["id"])["lifecycle"] == "active")
    html_body = f'''
<section class="hero hero-home">
  <div class="container narrow center">
    <div class="eyebrow">A cognitive instrument · not a game</div>
    <h1>Two Second<br><span class="grad">Witness</span></h1>
    <p class="lead">Train rapid recognition across {cu} universes and {cw} spatial fields. Every observation is a two-second decision. The universe grows over time – the app curates the live experience, the Chronicle archives everything.</p>
    <div class="cta-row">
      <a class="btn primary" href="explore.html">Explore the Chronicle</a>
      <a class="btn ghost" href="evolution.html">See what's growing →</a>
    </div>
    <div class="kpi-row">
      <div><strong>{cu}</strong><span>universes</span></div>
      <div><strong>{active_count}</strong><span>active worlds</span></div>
      <div><strong>{co:,}</strong><span>observations</span></div>
      <div><strong>live</strong><span>evolution</span></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2>How it works</h2>
    <div class="how-grid">
      <div class="how-step"><div class="how-num">1</div><h3>Observe</h3><p>Two seconds per observation. No timers pressuring you, no scores judging you. Just look, recognize, respond.</p></div>
      <div class="how-step"><div class="how-num">2</div><h3>Learn</h3><p>Your behavioral field adapts. The system tracks what you notice, not how fast you click.</p></div>
      <div class="how-step"><div class="how-num">3</div><h3>Witness</h3><p>Return to the Mirror. See your cognitive traces. Watch the universe expand around your attention.</p></div>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="container">
    <div class="section-head">
      <h2>Featured experience</h2>
      <a href="explore.html" class="link-arrow">View all worlds →</a>
    </div>
    <div class="feature-grid">
      {featured_cards}
    </div>
    <p class="meta center" style="margin-top:16px">The app features a curated active set. The Chronicle website preserves the full archive – {cw} worlds and growing.</p>
  </div>
</section>

<section class="section">
  <div class="container narrow center">
    <h2>A living cognitive universe</h2>
    <p class="lead" style="font-size:18px">New worlds are discovered over time. The evolution layer proposes growth, humans approve, the archive expands. Follow along in the <a href="journal.html">Journal</a> and <a href="evolution.html">Evolution</a> dashboard.</p>
  </div>
</section>
'''
    html = page_wrap("Chronicle Field", "home", html_body)
    with open(WEBSITE_DIR / "index.html", "w", encoding="utf-8") as f:
        f.write(html)

# --- Explore ---
def build_explore():
    print("explore.html")
    # Universe cards
    world_counts = {}
    for w in worlds:
        uid = w.get("universe_id","")
        world_counts[uid] = world_counts.get(uid, 0) + 1
    universe_cards = ""
    for uid in sorted(universe_names.keys()):
        name = universe_names[uid]
        count = world_counts.get(uid, 0)
        # find a representative world image/placeholder
        universe_cards += f'''
        <div class="uni-card">
          <h3>{name}</h3>
          <div class="meta">{count} worlds</div>
          <div class="meta"><code>{uid}</code></div>
        </div>'''

    # Worlds grouped by lifecycle
    def world_tile(w):
        uid = w["universe_id"]; wid = w["id"]
        disp = w.get("display_name", wid.replace("_"," ").title())
        ev = evo_for(wid)
        lifecycle = ev["lifecycle"]
        rank = ev["rank"]
        badge = {"active":"Featured","cooling":"Established","archived":"Archive"}.get(lifecycle, "Archive")
        oc = w.get("statistics",{}).get("observation_count","?")
        return f'''<a class="world-tile state-{lifecycle}" href="worlds/{uid}.{wid}.html">
          <div class="wt-top"><span class="wt-badge">{badge}</span><span class="meta">#{rank if rank<999 else "–"}</span></div>
          <div class="wt-name">{disp}</div>
          <div class="meta">{universe_names.get(uid,uid)} · {oc} obs</div>
        </a>'''

    active_ws = []
    cooling_ws = []
    archived_ws = []
    for w in sorted(worlds, key=lambda x: evo_for(x["id"])["rank"]):
        ev = evo_for(w["id"])
        t = world_tile(w)
        if ev["lifecycle"] == "active":
            active_ws.append(t)
        elif ev["lifecycle"] == "cooling":
            cooling_ws.append(t)
        else:
            archived_ws.append(t)

    # Characters showcase
    char_cards = ""
    for c in characters[:4]:
        name = c.get("display_name", c.get("id",""))
        ps = c.get("behavioral_signature",{}).get("perception_style","adaptive")
        mech = c.get("derived_from_app",{}).get("scenario_mechanic","Observation")
        char_cards += f'''<div class="char-card"><h4>{name}</h4><div class="meta">{ps} · {mech}</div></div>'''

    html_body = f'''
<section class="page-hero">
  <div class="container">
    <h1>Explore</h1>
    <p class="lead">Universes, worlds, and behavioral fields – all generated deterministically from the app's observation engine.</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2>Universes</h2>
    <div class="uni-grid">{universe_cards}</div>
  </div>
</section>

<section class="section alt">
  <div class="container">
    <h2>Featured worlds</h2>
    <p class="meta">Active – currently featured in the app experience</p>
    <div class="world-grid">{''.join(active_cards) if (active_cards:=active_ws) else '<p class="meta">None</p>'}</div>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2>Archive</h2>
    <p class="meta">Cooling and archived worlds – fully accessible, searchable – the Chronicle never deletes</p>
    <details>
      <summary>Show cooling worlds ({len(cooling_ws)})</summary>
      <div class="world-grid" style="margin-top:12px">{''.join(cooling_ws)}</div>
    </details>
    <details style="margin-top:12px">
      <summary>Show archive ({len(archived_ws)})</summary>
      <div class="world-grid" style="margin-top:12px">{''.join(archived_ws)}</div>
    </details>
  </div>
</section>

<section class="section alt">
  <div class="container">
    <h2>Behavioral fields</h2>
    <p class="meta">Four observer archetypes derived from the Observation Engine – no website personas</p>
    <div class="char-grid">{char_cards}</div>
    <p class="meta" style="margin-top:12px">Learn more about the cognitive instrument on the <a href="about.html">About</a> page.</p>
  </div>
</section>
'''
    html = page_wrap("Explore", "explore", html_body)
    with open(WEBSITE_DIR / "explore.html", "w", encoding="utf-8") as f:
        f.write(html)
    # Keep legacy worlds.html as a redirect / copy for backward compatibility
    with open(WEBSITE_DIR / "worlds.html", "w", encoding="utf-8") as f:
        f.write(html.replace('href="explore.html" class="active"', 'href="worlds.html" class="active"').replace("<title>Explore", "<title>Worlds"))

# --- World pages ---
def build_world_pages():
    print("world pages...")
    for w in worlds:
        uid=w.get("universe_id",""); wid=w.get("id",""); disp=w.get("display_name",wid.replace("_"," ").title())
        e=w.get("embodiment",{}); 
        oc=w.get("statistics",{}).get("observation_count","?")
        entity_types = w.get("statistics",{}).get("entity_types", [])
        difficulty = w.get("statistics",{}).get("difficulty_distribution", {})
        ev = evo_for(wid)
        lifecycle = ev["lifecycle"]
        rank = ev["rank"]
        score = ev["score"]
        # banner
        banner = ""
        if lifecycle == "archived":
            banner = '<div class="notice archive">ARCHIVE – Historical record · fully accessible · resurrectable</div>'
        elif lifecycle == "cooling":
            banner = '<div class="notice cooling">COOLING – Established content · remains accessible</div>'
        else:
            banner = '<div class="notice active">FEATURED – Currently active in the app</div>'
        # entity types list
        et_html = ", ".join(entity_types[:8]) + (f" · +{len(entity_types)-8} more" if len(entity_types) > 8 else "") if entity_types else "—"
        body = f'''
<div class="container narrow">
  {banner}
  <div class="page-head">
    <div class="meta"><a href="../explore.html">Explore</a> · {universe_names.get(uid,uid)}</div>
    <h1>{disp}</h1>
    <div class="meta"><code>{uid}.{wid}</code> · Rank #{rank if rank < 999 else "–"} · Score {score:.3f} · {oc} observations</div>
  </div>
  <div class="two-col">
    <div class="card">
      <h3>Field</h3>
      <table class="kv">
        <tr><th>Density</th><td>{e.get("density","—")}</td></tr>
        <tr><th>Intensity</th><td>{e.get("intensity","—")}</td></tr>
        <tr><th>Gravity</th><td>{e.get("gravity","—")}</td></tr>
        <tr><th>Drift</th><td>{e.get("drift_potential","—")}</td></tr>
        <tr><th>Overlap</th><td>{", ".join(e.get("overlap_regions",[])[:3]) or "—"}</td></tr>
      </table>
    </div>
    <div class="card">
      <h3>Content</h3>
      <table class="kv">
        <tr><th>Observations</th><td>{oc}</td></tr>
        <tr><th>Entity types</th><td>{len(entity_types)}</td></tr>
        <tr><th>Difficulty</th><td>L1:{difficulty.get("1",difficulty.get(1,0))} · L2:{difficulty.get("2",difficulty.get(2,0))} · L3:{difficulty.get("3",difficulty.get(3,0))}</td></tr>
        <tr><th>Lifecycle</th><td>{lifecycle}</td></tr>
        <tr><th>Placement</th><td>{ev["placement"]}</td></tr>
      </table>
    </div>
  </div>
  <div class="card" style="margin-top:16px">
    <h3>Entity types</h3>
    <p class="meta">{et_html}</p>
  </div>
  <p style="margin-top:20px"><a href="../explore.html">← Back to Explore</a></p>
</div>
'''
        html = page_wrap_root(f"{disp}", "explore", body)
        # Fix nav links to point to root
        html = html.replace('href="index.html"', 'href="../index.html"')
        html = html.replace('href="explore.html"', 'href="../explore.html"')
        html = html.replace('href="evolution.html"', 'href="../evolution.html"')
        html = html.replace('href="journal.html"', 'href="../journal.html"')
        html = html.replace('href="about.html"', 'href="../about.html"')
        html = html.replace('href="assets/', 'href="../assets/')
        with open(WORLDS_OUT / f"{uid}.{wid}.html", "w", encoding="utf-8") as f:
            f.write(html)

# --- Evolution Dashboard (public) ---
def build_evolution():
    print("evolution.html")
    # load governance counts
    proposals = proposals_data.get("proposals", [])
    approvals_list = approvals_data.get("approvals", [])
    queue_items = queue_data.get("queue", [])
    history_items = history_data.get("executions", [])

    # counts from approvals file if available, else derive
    def count_status(s):
        return sum(1 for a in approvals_list if a.get("status") == s)
    prop_count = len(proposals)
    approved_count = count_status("approved")
    proposed_count = count_status("proposed")
    if proposed_count == 0 and prop_count > 0:
        # approvals file missing – fall back to proposals count
        proposed_count = prop_count
    rejected_count = count_status("rejected")
    queued_count = len(queue_items)
    completed_count = count_status("completed")

    # featured proposals – top 6 by score, proposed only
    prop_approval_map = {a["proposal_id"]: a.get("status","proposed") for a in approvals_list}
    featured = []
    for p in sorted(proposals, key=lambda x: -x.get("score",0))[:6]:
        pid = p["proposal_id"]
        status = prop_approval_map.get(pid, "proposed")
        featured.append((p, status))
    
    def prop_card(p, status):
        color = {"proposed":"#ffaa00","approved":"#00f2fe","rejected":"#ff0055","completed":"#00cc88"}.get(status, "#8aa0b8")
        return f'''<div class="card" style="border-left:3px solid {color}">
          <div class="meta" style="color:{color};font-weight:600">{status.upper()} · {p.get("type","").replace("_"," ")}</div>
          <h3>{p.get("title", p.get("target","")).replace("_"," ").title()}</h3>
          <p>{p.get("reason","")}</p>
          <div class="meta">Score {p.get("score",0):.2f} · Confidence {p.get("confidence",0):.2f}</div>
        </div>'''

    cards_html = "".join([prop_card(p,s) for p,s in featured]) or "<p class='meta'>No proposals yet.</p>"

    # Active development – queue
    queue_html = ""
    if queue_items:
        rows = "".join([f"<tr><td>#{q.get('queue_position','?')}</td><td>{q.get('target','')}</td><td>{q.get('generation_type','')}</td><td>{q.get('priority',0):.2f}</td></tr>" for q in queue_items[:10]])
        queue_html = f"<table><tr><th>#</th><th>Target</th><th>Type</th><th>Priority</th></tr>{rows}</table>"
    else:
        queue_html = '<p class="meta">Queue empty – proposals await human approval. The system does not generate content autonomously.</p>'

    # Archive / history
    hist_html = ""
    if history_items:
        rows = "".join([f"<tr><td>{h.get('execution_id','')}</td><td>{h.get('proposal_id','')}</td><td>{'✓' if h.get('success') else '✗'}</td><td>{h.get('notes','')[:60]}</td></tr>" for h in history_items[-10:]])
        hist_html = f"<table><tr><th>Execution</th><th>Proposal</th><th>Result</th><th>Notes</th></tr>{rows}</table>"
    else:
        hist_html = '<p class="meta">No completed generations yet – history is append-only and permanent once execution begins.</p>'

    body = f'''
<section class="page-hero">
  <div class="container">
    <h1>Evolution</h1>
    <p class="lead">The universe grows over time. Proposals are ranked by the evolution layer, approved by humans, queued deterministically – no autonomous generation.</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="kpi-row">
      <div><strong>{prop_count}</strong><span>proposals</span></div>
      <div><strong>{approved_count}</strong><span>approved</span></div>
      <div><strong>{queued_count}</strong><span>queued</span></div>
      <div><strong>{completed_count}</strong><span>completed</span></div>
      <div><strong>{rejected_count}</strong><span>rejected</span></div>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="container">
    <h2>What's coming</h2>
    <p>Growth proposals ranked by coverage gaps, expansion opportunities, balance needs, and seasonal fit. Every proposal includes score, confidence, and evidence – no external APIs, no randomness.</p>
    <div class="grid">
      {cards_html}
    </div>
    <p class="meta">Showing top {len(featured)} of {prop_count} proposals · All currently in <strong>proposed</strong> state – awaiting human review</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2>Active development</h2>
    {queue_html}
  </div>
</section>

<section class="section alt">
  <div class="container">
    <h2>Archive / History</h2>
    {hist_html}
    <div class="card" style="margin-top:20px">
      <h3>How Evolution Works</h3>
      <ol class="meta" style="line-height:1.8">
        <li><strong>Ranking</strong> – worlds scored by observation density, entity diversity, recency, network overlap – deterministic</li>
        <li><strong>Lifecycle</strong> – active (max 20) → cooling → archived – resurrectable</li>
        <li><strong>Placement</strong> – ranking decides popularity, placement decides location – never combined</li>
        <li><strong>Proposals</strong> – coverage gaps, expansion, balance, seasonal – scored, evidence-backed</li>
        <li><strong>Approvals</strong> – human authority only – proposal engine cannot approve itself</li>
        <li><strong>Queue</strong> – approved proposals only, deterministic priority, checksummed</li>
        <li><strong>History</strong> – append-only, permanent audit trail</li>
      </ol>
      <p class="meta">Models: rank={ranking_data.get('model_version','none')} · lifecycle={lifecycle_data.get('model_version','none')} · placement={placement_data.get('model_version','none')} · proposals={proposals_data.get('model_version','none')}</p>
    </div>
  </div>
</section>
'''
    html = page_wrap("Evolution", "evolution", body)
    with open(WEBSITE_DIR / "evolution.html", "w", encoding="utf-8") as f:
        f.write(html)

# --- Journal ---
def build_journal():
    print("journal.html")
    # Load build_state for governance counts
    bs = load_json(SHARED_DIR / "build_state.json", {})
    manifest = manifest_data
    cnt = manifest.get("counts", {})
    # Timeline entries – combine releases, build_state, evolution milestones
    entries = []
    # Export complete
    entries.append({
        "date": manifest.get("timestamp","2026-07-06"),
        "title": "Export Complete – Chronicle v1.2",
        "body": f"{cnt.get('observation_banks',143)} observation banks · {cnt.get('observations_exported',22059):,} observations · {cnt.get('worlds',61)} worlds · {cnt.get('universes',7)} universes – deterministic export, JSONL per-world storage, enriched world statistics"
    })
    # Evolution milestones
    if ranking_data.get("model_version") != "none":
        entries.append({
            "date": ranking_data.get("generated_at","2026-07-06"),
            "title": "Evolution Intelligence – Phase 2.1",
            "body": "Ranking, lifecycle, and placement models live. Worlds are now curated automatically – active / cooling / archived – with deterministic scoring."
        })
    if proposals_data.get("model_version") != "none":
        prop_count = len(proposals_data.get("proposals",[]))
        entries.append({
            "date": proposals_data.get("generated_at","2026-07-06"),
            "title": "Growth Proposals – Phase 2.3",
            "body": f"Proposal engine live – {prop_count} growth opportunities identified (coverage gaps, expansion, balance, seasonal) – scored with evidence, no content generation."
        })
    # Approvals / governance
    if approvals_data.get("model_version") != "none":
        entries.append({
            "date": approvals_data.get("generated_at","2026-07-06"),
            "title": "Evolution Governance – Phase 2.4",
            "body": "Approval registry, generation queue, and execution history online. Human approval required for all growth. System can prepare work, cannot generate content autonomously."
        })
    # Build state / release
    if bs:
        entries.append({
            "date": bs.get("timestamp",""),
            "title": f"Build {bs.get('run_id','?')} – {bs.get('pipeline_version','')}",
            "body": f"Export hash {bs.get('export_hash','')[:16]}… · {bs.get('counts',{}).get('observations_exported',0):,} obs · {bs.get('counts',{}).get('worlds',0)} worlds · Proposals: {bs.get('counts',{}).get('proposals',0)} · Queue: {bs.get('counts',{}).get('queue',0)}"
        })
    # sort newest first
    entries.sort(key=lambda x: x["date"], reverse=True)
    timeline_html = ""
    for e in entries:
        date_str = e["date"][:10]
        timeline_html += f'''<div class="timeline-item"><div class="tl-date">{date_str}</div><div class="tl-card"><h3>{e["title"]}</h3><p>{e["body"]}</p></div></div>'''

    body = f'''
<section class="page-hero">
  <div class="container narrow">
    <h1>Journal</h1>
    <p class="lead">Development updates, milestones, and release notes – following the universe as it grows.</p>
  </div>
</section>
<section class="section">
  <div class="container narrow">
    <div class="timeline">
      {timeline_html}
    </div>
    <div class="card" style="margin-top:24px">
      <h3>Content Stats</h3>
      <table class="kv">
        <tr><th>Observation banks</th><td>{cnt.get("observation_banks",0)}</td></tr>
        <tr><th>Observations</th><td>{cnt.get("observations_exported",0):,}</td></tr>
        <tr><th>Worlds</th><td>{cnt.get("worlds",0)}</td></tr>
        <tr><th>Universes</th><td>{cnt.get("universes",0)}</td></tr>
        <tr><th>Export tool</th><td>chronicle_export_v1_2</td></tr>
        <tr><th>Storage</th><td>jsonl_per_world_v1</td></tr>
      </table>
    </div>
  </div>
</section>
'''
    html = page_wrap("Journal", "journal", body)
    with open(WEBSITE_DIR / "journal.html", "w", encoding="utf-8") as f:
        f.write(html)

# --- About ---
def build_about():
    print("about.html")
    cw = worlds_data.get("count", len(worlds))
    cu = len(universe_names)
    co = manifest_data.get("counts",{}).get("observations_exported",22059)
    body = '''
<section class="page-hero">
  <div class="container narrow center">
    <h1>About Two Second Witness</h1>
    <p class="lead">A cognitive instrument, not a game. A living universe, not a content library.</p>
  </div>
</section>

<section class="section">
  <div class="container narrow">
    <h2>Project Vision</h2>
    <p>Two Second Witness is an interactive observation discovery experience. You are shown a stimulus for two seconds. You recognize, you respond, you move on. There are no scores judging your intelligence, no timers pressuring your performance, no lives, no levels, no monetization gates disguised as difficulty.</p>
    <p>Instead: a spatial cognitive field that grows around your attention. Worlds cluster by what you notice. Characters represent behavioral archetypes derived from real observation mechanics – not website personas.</p>
    <p>The app curates a focused, active experience – currently 20 worlds at a time. The Chronicle website preserves the full archive – every world, every observation, every version – searchable forever.</p>
  </div>
</section>

<section class="section alt">
  <div class="container narrow">
    <h2>Cognitive Instrument</h2>
    <p><strong>Observation Engine</strong> – Each observation presents a visual/physical signature with deliberate confusions (adjacent principles, rendering artifacts). Difficulty is calibrated, confidence is tracked, but never shown as a competitive score.</p>
    <p><strong>Behavioral Fields</strong> – Four observer archetypes: Memory Cascade, Rapid Classification, Signal vs Noise, Stroop Test – derived directly from app scenario mechanics, not invented for marketing.</p>
    <p><strong>Spatial Field</strong> – Worlds exist in a 3D cognitive field with density, intensity, gravity, drift_potential, overlap_regions – rendered in the Chronicle Field visualizer.</p>
    <p><strong>Evolution Intelligence</strong> – Ranking decides popularity. Placement decides location. Never combined. Lifecycle: active → cooling → archived → resurrectable. Growth proposals are scored with evidence, approved by humans, queued deterministically. The system cannot generate content autonomously.</p>
  </div>
</section>

<section class="section">
  <div class="container narrow">
    <h2>App vs Chronicle</h2>
    <div class="two-col">
      <div class="card"><h3>App – Curated</h3><p>20 active worlds max<br>Focused 2-second sessions<br>Behavioral field adaptation<br>Available on Android</p></div>
      <div class="card"><h3>Chronicle – Archive</h3><p>Full universe – ''' + str(cw) + ''' worlds<br>All observations searchable<br>Evolution dashboard public<br>Versioned, deterministic, open</p></div>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="container narrow">
    <h2>Accessibility & Privacy</h2>
    <ul class="meta" style="line-height:1.8;font-size:15px">
      <li><strong>No accounts required</strong> to explore the Chronicle website</li>
      <li><strong>No tracking pixels</strong>, no analytics cookies, no ad networks on chronicle pages</li>
      <li><strong>Neutral language</strong> – observations are framed cognitively, never medically or diagnostically</li>
      <li><strong>Color contrast</strong> meets WCAG AA – dark theme with high-contrast cyan accents</li>
      <li><strong>Keyboard navigable</strong> – all interactive elements reachable</li>
      <li><strong>Screen reader friendly</strong> – semantic HTML, alt text, ARIA labels where needed</li>
      <li><strong>Mobile first</strong> – responsive layout, touch targets ≥44px</li>
      <li><strong>Open data</strong> – all world/universe/evolution data available as JSON at <code>/data/</code></li>
      <li><strong>Deterministic builds</strong> – every page regenerates from shared canonical truth – no manual edits</li>
    </ul>
    <p class="meta" style="margin-top:16px">Contact / source: <a href="https://github.com/ITTYBITTYBITES/2-second-witness-mobile">ITTYBITTYBITES/2-second-witness-mobile</a> · <a href="https://github.com/ITTYBITTYBITES/ITTYBITTYBITES.github.io">ITTYBITTYBITES.github.io</a></p>
  </div>
</section>
'''
    # inject counts into about page (simple replace – already did via f-string concatenation above for cw)
    # redo with proper formatting
    body = body.replace(str(cw), str(cw))  # no-op, already injected
    html = page_wrap("About", "about", body)
    with open(WEBSITE_DIR / "about.html", "w", encoding="utf-8") as f:
        f.write(html)

# --- Legacy pages – keep functional, de-linked from primary nav ---
def build_characters():
    print("characters.html [legacy] …")
    cards=[]
    for c in characters:
        n=c.get("display_name",c.get("id","")); s=c.get("behavioral_signature",{}); ps=s.get("perception_style","hybrid")
        tv=s.get("trait_vector",[0]*8); ts=", ".join(f"{v:+.2f}" for v in tv[:4])
        fl=c.get("field_influence",{}); ir=fl.get("influence_radius",0); mod=fl.get("event_modulation",0)
        dr=c.get("derived_from_app",{}); mech=dr.get("scenario_mechanic","—")
        cards.append(f'<div class="card"><h3>{n}</h3><div class="meta"><code>{c.get("id")}</code> · perception: {ps}</div><div class="meta">traits [{ts}…] · influence radius {ir} · modulation {mod:+.2f}</div><div class="meta" style="margin-top:4px">mechanic: {mech}</div></div>')
    body = f'<div class="container" style="padding:40px 20px"><h2>Characters – Behavioral Field Systems</h2><p class="meta">{len(characters)} archetypes · <a href="explore.html">See the new Explore page</a> · This is a legacy page kept for compatibility.</p></div><div class="grid">{"".join(cards)}</div>'
    html = page_wrap("Characters", "characters", body)
    # characters not in primary nav – patch nav to highlight Explore instead?
    html = html.replace('href="characters.html" class="active"', 'href="explore.html"')
    with open(WEBSITE_DIR/"characters.html","w",encoding="utf-8") as f: f.write(html)

def build_events():
    print("events.html [legacy] …")
    cnt = events_data.get("count",0)
    body = f'''<div class="container" style="padding:40px 20px"><h2>Events</h2><p class="meta">{cnt} events · This page is archived. See <a href="journal.html">Journal</a> for development updates.</p><p class="meta">No events generated yet — event traces require runtime SessionTracker</p></div>'''
    html = page_wrap("Events", "events", body)
    with open(WEBSITE_DIR/"events.html","w",encoding="utf-8") as f: f.write(html)

def build_releases():
    print("releases.html [legacy] …")
    rj = json.dumps(releases_data, indent=2)
    body = f'''<div class="container" style="padding:40px 20px"><h2>Releases</h2><p class="meta">This is a legacy JSON dump. See <a href="journal.html">Journal</a> for human-readable release notes.</p><pre>{rj}</pre></div>'''
    html = page_wrap("Releases", "releases", body)
    with open(WEBSITE_DIR/"releases.html","w",encoding="utf-8") as f: f.write(html)

# --- main ---
def main():
    print("="*50); print("Chronicle Website Builder v2 – Experience Redesign"); print("="*50)
    sync_data()
    build_index()
    build_explore()
    build_world_pages()
    build_characters()
    build_events()
    build_releases()
    build_evolution()
    build_journal()
    build_about()
    print(f"\n✓ Website rebuilt: {len(worlds)} worlds, {len(universes)} universes, {len(characters)} characters")
    print(f"  Pages: index.html, explore.html, evolution.html, journal.html, about.html")
    print(f"  Legacy (still functional): characters.html, events.html, releases.html, worlds/*.html ({len(worlds)} files)")
    return 0

if __name__=="__main__": import sys; sys.exit(main())
