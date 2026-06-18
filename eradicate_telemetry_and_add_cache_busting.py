#!/usr/bin/env python3
"""
MASTER SCRIPT TO ERADICATE ALL AI TELEMETRY REFERENCES & IMPLEMENT AUTOMATED CACHE-BUSTING // v2.0
Executes universal Code Normalization across all repository assets, SSG templates, and game engines.
"""

import os
import re
import time

TIMESTAMP_VERSION = f"v={int(time.time())}"

def scrub_and_upgrade_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False

    orig_content = content

    # 1. Scrub Footer Telemetry Notice across all pages & templates
    content = re.sub(
        r'All interactive sandbox mechanics across our portal ingest 100% anonymized behavioral coordinate mapping exactly compliant with GDPR and EU AI Act open-source research parameters\.',
        'All interactive sandbox execution mechanics across our portal operate entirely locally within your secure client sandbox. Zero background telemetry or path tracking data is collected.',
        content
    )

    content = re.sub(
        r'All interactive gameplay telemetry collected via this portal is 100% anonymized behavioral coordinate mapping.*?open-source research compliance standards\.',
        'All interactive gameplay operates entirely locally within your device browser. Zero personally identifiable identifiers (PII), behavioral tracking datasets, or background AI telemetry are collected.',
        content
    )

    content = re.sub(
        r'AI Telemetry & Data Use Notice',
        'Local Sandbox Privacy Notice',
        content
    )

    content = re.sub(
        r'AI Telemetry &amp; Data Use Notice',
        'Local Sandbox Privacy Notice',
        content
    )

    # 2. Scrub explicit Terms of Service / Privacy Policy telecommunications details
    content = re.sub(
        r'automated background AI path datasets',
        'background tracking systems',
        content
    )

    # 3. Add explicit HTML Cache-Control Meta Tags & Self-Healing Auto-Refresh Snippet
    cache_meta_snippet = f"""    <!-- Universal Automated Cache-Busting & Auto-Refresh Guard -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <script>
        (function() {{
            const clientVer = localStorage.getItem('arcade_client_deployment_ver');
            const liveVer = '{TIMESTAMP_VERSION}';
            if (clientVer !== liveVer) {{
                localStorage.setItem('arcade_client_deployment_ver', liveVer);
                if (window.caches) {{ caches.keys().then(n => n.forEach(c => caches.delete(c))); }}
                if (clientVer) {{ window.location.reload(true); }}
            }}
        }})();
    </script>"""

    # Inject into HTML head if not already present
    if '<meta http-equiv="Cache-Control"' not in content and '</head>' in content and filepath.endswith('.html'):
        content = content.replace('</head>', f"{cache_meta_snippet}\n</head>")

    # 4. Remove JS Telemetry functions from portal.js
    if filepath.endswith('portal.js'):
        # Scrub telemetry ingestion stream
        content = re.sub(
            r'    // ─── Secure Consenting AI Telemetry Dispatcher [\s\S]*?(?=\n\n|\Z)',
            '',
            content
        )
        content = re.sub(
            r'this\.ingestTelemetryStream\(.*?\);',
            '',
            content
        )

    # 5. Remove JS Telemetry from Grid Delver and Quantum Sentinel
    if filepath.endswith('game.js'):
        content = re.sub(
            r'    // Phase 5:? Granular [\s\S]*?logTurnTelemetryPacket[\s\S]*?}\n\n',
            '',
            content
        )
        content = re.sub(
            r'    // Phase 5 Granular AI Telemetry Batch Hub[\s\S]*?logTurnTelemetryPacket[\s\S]*?}\n\n',
            '',
            content
        )
        content = re.sub(
            r'this\.logTurnTelemetryPacket\(.*?\);',
            '',
            content
        )
        content = re.sub(
            r'this\.interceptionHistoryBatch.*?;\n',
            '',
            content
        )

    # 6. Update SSG compilers (build-engine.js and upgrade_html_architecture.js) to embed cache-busting
    if filepath.endswith('build-engine.js') or filepath.endswith('upgrade_html_architecture.js'):
        content = content.replace('<script src="portal.js"></script>', f'<script src="portal.js?{TIMESTAMP_VERSION}"></script>')
        content = content.replace('<link rel="stylesheet" href="style.css">', f'<link rel="stylesheet" href="style.css?{TIMESTAMP_VERSION}">')

    if content != orig_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def execute_global_scrub():
    print("🚀 Initiating master scrub of AI Telemetry references & automated cache-busting upgrade...")
    scrubbed_count = 0
    
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in root or '.git' in root:
            continue
        for file in files:
            if file.endswith('.html') or file.endswith('.js'):
                path = os.path.join(root, file)
                if scrub_and_upgrade_file(path):
                    scrubbed_count += 1

    print(f"◈ Fully normalized exactly {scrubbed_count} root assets, briefings, and engine modules.")

if __name__ == '__main__':
    execute_global_scrub()
