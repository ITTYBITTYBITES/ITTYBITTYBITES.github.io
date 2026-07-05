/* ============================================
   Two Second Witness — Data-Driven Scenario System
   Phase 3 Demo Integration Foundation
   ============================================ */

(function () {
  'use strict';

  window.DemoScenarios = [
    {
      id: 'stub_egypt_01',
      name: 'Pharaoh Chamber Trial',
      world: 'Ancient Egypt',
      worldId: 'egypt',
      difficulty: 1,
      promptText: 'Observe the ceremonial altar layout carefully for 2 seconds.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0a0a1a; border-radius:8px;">
          <!-- Chamber Background Gradients -->
          <defs>
            <linearGradient id="egyptBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#110d1c"/>
              <stop offset="100%" stop-color="#1c162e"/>
            </linearGradient>
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>
          <rect width="600" height="320" fill="url(#egyptBg)" />
          
          <!-- Chamber Columns -->
          <rect x="50" y="20" width="40" height="300" fill="#28213e" stroke="#00e5ff33" stroke-width="1"/>
          <rect x="510" y="20" width="40" height="300" fill="#28213e" stroke="#00e5ff33" stroke-width="1"/>
          <path d="M40 20 L100 20 L85 50 L55 50 Z" fill="#3a305a"/>
          <path d="M500 20 L560 20 L545 50 L515 50 Z" fill="#3a305a"/>

          <!-- Altar Pedestal -->
          <path d="M150 250 L450 250 L480 310 L120 310 Z" fill="#231b38" stroke="#a855f766" stroke-width="2"/>
          <rect x="180" y="240" width="240" height="10" fill="#eab308" opacity="0.8"/>

          <!-- Left Golden Urn -->
          <path d="M200 240 Q180 200 200 170 L220 170 Q240 200 220 240 Z" fill="#d97706" stroke="#fbbf24" stroke-width="2"/>
          <ellipse cx="210" cy="170" rx="10" ry="4" fill="#fbbf24"/>

          <!-- Center Turquoise Ankh Amulet (PRESENT IN SCENE A) -->
          <g id="ankhAmulet" filter="url(#cyanGlow)">
            <circle cx="300" cy="160" r="18" fill="none" stroke="#00e5ff" stroke-width="6"/>
            <rect x="296" y="178" width="8" height="55" fill="#00e5ff"/>
            <rect x="275" y="192" width="50" height="8" fill="#00e5ff"/>
            <circle cx="300" cy="160" r="8" fill="#050510"/>
          </g>

          <!-- Right Golden Urn -->
          <path d="M380 240 Q360 200 380 170 L400 170 Q420 200 400 240 Z" fill="#d97706" stroke="#fbbf24" stroke-width="2"/>
          <ellipse cx="390" cy="170" rx="10" ry="4" fill="#fbbf24"/>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0a0a1a; border-radius:8px;">
          <defs>
            <linearGradient id="egyptBgB" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#110d1c"/>
              <stop offset="100%" stop-color="#1c162e"/>
            </linearGradient>
          </defs>
          <rect width="600" height="320" fill="url(#egyptBgB)" />
          
          <!-- Chamber Columns -->
          <rect x="50" y="20" width="40" height="300" fill="#28213e" stroke="#00e5ff33" stroke-width="1"/>
          <rect x="510" y="20" width="40" height="300" fill="#28213e" stroke="#00e5ff33" stroke-width="1"/>
          <path d="M40 20 L100 20 L85 50 L55 50 Z" fill="#3a305a"/>
          <path d="M500 20 L560 20 L545 50 L515 50 Z" fill="#3a305a"/>

          <!-- Altar Pedestal -->
          <path d="M150 250 L450 250 L480 310 L120 310 Z" fill="#231b38" stroke="#a855f766" stroke-width="2"/>
          <rect x="180" y="240" width="240" height="10" fill="#eab308" opacity="0.8"/>

          <!-- Left Golden Urn -->
          <path d="M200 240 Q180 200 200 170 L220 170 Q240 200 220 240 Z" fill="#d97706" stroke="#fbbf24" stroke-width="2"/>
          <ellipse cx="210" cy="170" rx="10" ry="4" fill="#fbbf24"/>

          <!-- Center Turquoise Ankh Amulet HAS VANISHED IN SCENE B -->
          <g opacity="0.15">
            <ellipse cx="300" cy="240" rx="25" ry="5" fill="#000"/>
          </g>

          <!-- Right Golden Urn -->
          <path d="M380 240 Q360 200 380 170 L400 170 Q420 200 400 240 Z" fill="#d97706" stroke="#fbbf24" stroke-width="2"/>
          <ellipse cx="390" cy="170" rx="10" ry="4" fill="#fbbf24"/>
        </svg>
      `,
      options: [
        { id: 'opt_1', label: '1. The glowing turquoise Ankh amulet vanished from the altar pedestal.' },
        { id: 'opt_2', label: '2. The left golden burial urn tipped over onto the floor.' },
        { id: 'opt_3', label: '3. The stone pillar on the right shifted position.' },
        { id: 'opt_4', label: '4. Nothing changed between the two scenes.' }
      ],
      correctAnswerId: 'opt_1',
      changedElementDescription: 'The glowing turquoise Ankh amulet resting in the center of the altar vanished during the 2-second blackout interval.'
    },
    {
      id: 'stub_vikings_01',
      name: 'Longhall Shield Defense',
      world: 'Vikings',
      worldId: 'vikings',
      difficulty: 2,
      promptText: 'Study the three shields mounted along the mead hall timber wall.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#09121a; border-radius:8px;">
          <!-- Timber Wall -->
          <defs>
            <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#141f2c"/>
              <stop offset="50%" stop-color="#1c2c3e"/>
              <stop offset="100%" stop-color="#141f2c"/>
            </linearGradient>
            <filter id="shieldGlow">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>
          <rect width="600" height="320" fill="url(#woodGrad)"/>
          <line x1="0" y1="260" x2="600" y2="260" stroke="#00e5ff22" stroke-width="4"/>

          <!-- Left Shield (Red/White Chevron) -->
          <g transform="translate(130, 150)">
            <circle cx="0" cy="0" r="50" fill="#7f1d1d" stroke="#cbd5e1" stroke-width="6"/>
            <path d="M-50 0 L0 -50 L50 0 L0 50 Z" fill="#f8fafc" opacity="0.8"/>
            <circle cx="0" cy="0" r="14" fill="#475569" stroke="#94a3b8" stroke-width="3"/>
          </g>

          <!-- Center Shield (Blue & Gold Cross - SCENE A) -->
          <g id="centerShield" transform="translate(300, 150)" filter="url(#shieldGlow)">
            <circle cx="0" cy="0" r="56" fill="#1e3a8a" stroke="#facc15" stroke-width="6"/>
            <rect x="-56" y="-12" width="112" height="24" fill="#facc15"/>
            <rect x="-12" y="-56" width="24" height="112" fill="#facc15"/>
            <circle cx="0" cy="0" r="16" fill="#facc15" stroke="#ffffff" stroke-width="3"/>
          </g>

          <!-- Right Shield (Green Spiral) -->
          <g transform="translate(470, 150)">
            <circle cx="0" cy="0" r="50" fill="#14532d" stroke="#86efac" stroke-width="6"/>
            <circle cx="0" cy="0" r="32" fill="none" stroke="#86efac" stroke-width="8" stroke-dasharray="30 15"/>
            <circle cx="0" cy="0" r="14" fill="#334155" stroke="#94a3b8" stroke-width="3"/>
          </g>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#09121a; border-radius:8px;">
          <defs>
            <linearGradient id="woodGradB" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#141f2c"/>
              <stop offset="50%" stop-color="#1c2c3e"/>
              <stop offset="100%" stop-color="#141f2c"/>
            </linearGradient>
            <filter id="crimsonGlow">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>
          <rect width="600" height="320" fill="url(#woodGradB)"/>
          <line x1="0" y1="260" x2="600" y2="260" stroke="#00e5ff22" stroke-width="4"/>

          <!-- Left Shield -->
          <g transform="translate(130, 150)">
            <circle cx="0" cy="0" r="50" fill="#7f1d1d" stroke="#cbd5e1" stroke-width="6"/>
            <path d="M-50 0 L0 -50 L50 0 L0 50 Z" fill="#f8fafc" opacity="0.8"/>
            <circle cx="0" cy="0" r="14" fill="#475569" stroke="#94a3b8" stroke-width="3"/>
          </g>

          <!-- Center Shield CHANGED TO CRIMSON / IRON RADIAL in Scene B -->
          <g transform="translate(300, 150)" filter="url(#crimsonGlow)">
            <circle cx="0" cy="0" r="56" fill="#450a0a" stroke="#ef4444" stroke-width="6"/>
            <circle cx="0" cy="0" r="38" fill="none" stroke="#ef4444" stroke-width="6"/>
            <circle cx="0" cy="0" r="16" fill="#ef4444" stroke="#ffffff" stroke-width="3"/>
          </g>

          <!-- Right Shield -->
          <g transform="translate(470, 150)">
            <circle cx="0" cy="0" r="50" fill="#14532d" stroke="#86efac" stroke-width="6"/>
            <circle cx="0" cy="0" r="32" fill="none" stroke="#86efac" stroke-width="8" stroke-dasharray="30 15"/>
            <circle cx="0" cy="0" r="14" fill="#334155" stroke="#94a3b8" stroke-width="3"/>
          </g>
        </svg>
      `,
      options: [
        { id: 'opt_1', label: '1. The left Red/White chevron shield fell off the timber wall.' },
        { id: 'opt_2', label: '2. The center shield changed from a Blue & Gold cross to a Crimson & Iron ring pattern.' },
        { id: 'opt_3', label: '3. A fourth wooden shield appeared on the far right.' },
        { id: 'opt_4', label: '4. The green spiral pattern on the right shield rotated upside down.' }
      ],
      correctAnswerId: 'opt_2',
      changedElementDescription: 'The center mounted shield altered its entire heraldic pattern and color scheme from a Blue & Gold cross to a glowing Crimson ring.'
    },
    {
      id: 'stub_mars_01',
      name: 'Airlock Pressure Valve',
      world: 'Mars Colony',
      worldId: 'mars',
      difficulty: 3,
      promptText: 'Monitor the hydroponic airlock control console settings.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0a0d14; border-radius:8px;">
          <!-- Console Grid -->
          <defs>
            <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#00e5ff15" stroke-width="1"/>
            </pattern>
            <filter id="neonGreen">
              <feGaussianBlur stdDeviation="5" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>
          <rect width="600" height="320" fill="url(#gridPattern)"/>

          <!-- Panel Frame -->
          <rect x="40" y="30" width="520" height="260" rx="12" fill="#111827" stroke="#00e5ff44" stroke-width="2"/>
          <text x="70" y="65" fill="#94a3b8" font-family="monospace" font-size="14" font-weight="bold">BAY 04 // HYDRO-MANIFOLD CONTROL</text>

          <!-- Valve A (Left - OPEN / GREEN) -->
          <g transform="translate(160, 160)">
            <circle cx="0" cy="0" r="45" fill="#1e293b" stroke="#334155" stroke-width="4"/>
            <line x1="-35" y1="0" x2="35" y2="0" stroke="#10b981" stroke-width="12" stroke-linecap="round" filter="url(#neonGreen)"/>
            <text x="-25" y="65" fill="#10b981" font-family="monospace" font-size="13" font-weight="bold">VALVE A: OPEN</text>
          </g>

          <!-- Valve B (Right - OPEN / GREEN in Scene A) -->
          <g id="valveB" transform="translate(440, 160)">
            <circle cx="0" cy="0" r="45" fill="#1e293b" stroke="#334155" stroke-width="4"/>
            <line x1="-35" y1="0" x2="35" y2="0" stroke="#10b981" stroke-width="12" stroke-linecap="round" filter="url(#neonGreen)"/>
            <text x="-25" y="65" fill="#10b981" font-family="monospace" font-size="13" font-weight="bold">VALVE B: OPEN</text>
          </g>

          <!-- Center Status Beacon -->
          <circle cx="300" cy="160" r="20" fill="#00e5ff" opacity="0.8"/>
          <text x="268" y="210" fill="#00e5ff" font-family="monospace" font-size="12">STATUS: NOMINAL</text>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0a0d14; border-radius:8px;">
          <defs>
            <filter id="neonRed">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>
          <rect width="600" height="320" fill="#0c1018"/>
          <rect x="40" y="30" width="520" height="260" rx="12" fill="#111827" stroke="#ef444466" stroke-width="2"/>
          <text x="70" y="65" fill="#94a3b8" font-family="monospace" font-size="14" font-weight="bold">BAY 04 // HYDRO-MANIFOLD CONTROL</text>

          <!-- Valve A (Left - STILL OPEN / GREEN) -->
          <g transform="translate(160, 160)">
            <circle cx="0" cy="0" r="45" fill="#1e293b" stroke="#334155" stroke-width="4"/>
            <line x1="-35" y1="0" x2="35" y2="0" stroke="#10b981" stroke-width="12" stroke-linecap="round"/>
            <text x="-25" y="65" fill="#10b981" font-family="monospace" font-size="13" font-weight="bold">VALVE A: OPEN</text>
          </g>

          <!-- Valve B HAS ROTATED TO CLOSED (RED) IN SCENE B -->
          <g transform="translate(440, 160)" filter="url(#neonRed)">
            <circle cx="0" cy="0" r="45" fill="#450a0a" stroke="#ef4444" stroke-width="4"/>
            <line x1="0" y1="-35" x2="0" y2="35" stroke="#ef4444" stroke-width="12" stroke-linecap="round"/>
            <text x="-30" y="65" fill="#ef4444" font-family="monospace" font-size="13" font-weight="bold">VALVE B: CLOSED</text>
          </g>

          <!-- Center Status Beacon ALERT -->
          <circle cx="300" cy="160" r="20" fill="#ef4444"/>
          <text x="268" y="210" fill="#ef4444" font-family="monospace" font-size="12" font-weight="bold">ALERT: DEPRESS</text>
        </svg>
      `,
      options: [
        { id: 'opt_1', label: '1. Hydroponic Valve A rotated to closed.' },
        { id: 'opt_2', label: '2. The center beacon turned off completely.' },
        { id: 'opt_3', label: '3. Hydroponic Valve B rotated 90 degrees vertical to CLOSED (RED).' },
        { id: 'opt_4', label: '4. A secondary emergency oxygen gauge appeared on the left.' }
      ],
      correctAnswerId: 'opt_3',
      changedElementDescription: 'Hydroponic Pressure Valve B on the right rotated 90 degrees from OPEN (Green horizontal) to CLOSED (Red vertical).'
    }
  ];

})();
