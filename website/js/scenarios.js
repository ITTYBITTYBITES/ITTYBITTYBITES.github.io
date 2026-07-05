/* ============================================
   Two Second Witness — Data-Driven Scenario System
   Phase 4 Extended Database (15 Scenarios)
   ============================================ */

(function () {
  'use strict';

  window.DemoScenarios = [
    // ----------------------------------------------------
    // ANCIENT EGYPT BIOME (3 Scenarios)
    // ----------------------------------------------------
    {
      id: 'stub_egypt_01',
      name: 'Pharaoh Chamber Trial',
      world: 'Ancient Egypt',
      worldId: 'egypt',
      difficulty: 1,
      promptText: 'Observe the ceremonial altar layout carefully for 2 seconds.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0a0a1a; border-radius:8px;">
          <defs>
            <linearGradient id="egyptBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#110d1c"/><stop offset="100%" stop-color="#1c162e"/>
            </linearGradient>
            <filter id="cyanGlow"><feGaussianBlur stdDeviation="8" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
          </defs>
          <rect width="600" height="320" fill="url(#egyptBg)" />
          <rect x="50" y="20" width="40" height="300" fill="#28213e" stroke="#00e5ff33" stroke-width="1"/>
          <rect x="510" y="20" width="40" height="300" fill="#28213e" stroke="#00e5ff33" stroke-width="1"/>
          <path d="M150 250 L450 250 L480 310 L120 310 Z" fill="#231b38" stroke="#a855f766" stroke-width="2"/>
          <path d="M200 240 Q180 200 200 170 L220 170 Q240 200 220 240 Z" fill="#d97706" stroke="#fbbf24" stroke-width="2"/>
          <g id="ankhAmulet" filter="url(#cyanGlow)">
            <circle cx="300" cy="160" r="18" fill="none" stroke="#00e5ff" stroke-width="6"/>
            <rect x="296" y="178" width="8" height="55" fill="#00e5ff"/>
            <rect x="275" y="192" width="50" height="8" fill="#00e5ff"/>
          </g>
          <path d="M380 240 Q360 200 380 170 L400 170 Q420 200 400 240 Z" fill="#d97706" stroke="#fbbf24" stroke-width="2"/>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0a0a1a; border-radius:8px;">
          <rect width="600" height="320" fill="#110d1c" />
          <rect x="50" y="20" width="40" height="300" fill="#28213e" stroke="#00e5ff33" stroke-width="1"/>
          <rect x="510" y="20" width="40" height="300" fill="#28213e" stroke="#00e5ff33" stroke-width="1"/>
          <path d="M150 250 L450 250 L480 310 L120 310 Z" fill="#231b38" stroke="#a855f766" stroke-width="2"/>
          <path d="M200 240 Q180 200 200 170 L220 170 Q240 200 220 240 Z" fill="#d97706" stroke="#fbbf24" stroke-width="2"/>
          <ellipse cx="300" cy="240" rx="25" ry="5" fill="#000" opacity="0.15"/>
          <path d="M380 240 Q360 200 380 170 L400 170 Q420 200 400 240 Z" fill="#d97706" stroke="#fbbf24" stroke-width="2"/>
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
      id: 'stub_egypt_02',
      name: 'Temple Shadows',
      world: 'Ancient Egypt',
      worldId: 'egypt',
      difficulty: 2,
      promptText: 'Study the three stone obelisks and shadow alignment.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0e0a14; border-radius:8px;">
          <rect width="600" height="320" fill="#0e0a14"/>
          <!-- Obelisks -->
          <polygon points="120,40 140,80 140,280 100,280 100,80" fill="#33284a" stroke="#eab30844"/>
          <polygon points="300,40 320,80 320,280 280,280 280,80" fill="#33284a" stroke="#eab30844"/>
          <polygon id="rightObelisk" points="480,40 500,80 500,280 460,280 460,80" fill="#eab308" stroke="#ffffff" stroke-width="2"/>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0e0a14; border-radius:8px;">
          <rect width="600" height="320" fill="#0e0a14"/>
          <polygon points="120,40 140,80 140,280 100,280 100,80" fill="#33284a" stroke="#eab30844"/>
          <polygon points="300,40 320,80 320,280 280,280 280,80" fill="#33284a" stroke="#eab30844"/>
          <!-- Right obelisk turned dark stone -->
          <polygon points="480,40 500,80 500,280 460,280 460,80" fill="#33284a" stroke="#eab30844"/>
        </svg>
      `,
      options: [
        { id: 'opt_1', label: '1. The center obelisk cracked in half.' },
        { id: 'opt_2', label: '2. The far right obelisk changed from illuminated gold to dark sandstone.' },
        { id: 'opt_3', label: '3. A fourth shadow appeared on the ground.' },
        { id: 'opt_4', label: '4. The left obelisk shrank in height.' }
      ],
      correctAnswerId: 'opt_2',
      changedElementDescription: 'The far right obelisk lost its golden sunlight illumination and shifted to dark sandstone.'
    },
    {
      id: 'stub_egypt_03',
      name: 'Burial Vault',
      world: 'Ancient Egypt',
      worldId: 'egypt',
      difficulty: 3,
      promptText: 'Monitor the four canopic jars on the granite sarcophagus.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#08060c; border-radius:8px;">
          <rect width="600" height="320" fill="#08060c"/>
          <rect x="80" y="200" width="440" height="80" fill="#1f1830" stroke="#a855f7"/>
          <circle cx="150" cy="170" r="25" fill="#00e5ff"/>
          <circle cx="250" cy="170" r="25" fill="#eab308"/>
          <circle cx="350" cy="170" r="25" fill="#a855f7"/>
          <circle cx="450" cy="170" r="25" fill="#10b981"/>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#08060c; border-radius:8px;">
          <rect width="600" height="320" fill="#08060c"/>
          <rect x="80" y="200" width="440" height="80" fill="#1f1830" stroke="#a855f7"/>
          <circle cx="150" cy="170" r="25" fill="#00e5ff"/>
          <circle cx="250" cy="170" r="25" fill="#eab308"/>
          <!-- 3rd jar changed color to red -->
          <circle cx="350" cy="170" r="25" fill="#ef4444"/>
          <circle cx="450" cy="170" r="25" fill="#10b981"/>
        </svg>
      `,
      options: [
        { id: 'opt_1', label: '1. The first jar on the left fell off.' },
        { id: 'opt_2', label: '2. The third canopic jar changed color from purple to crimson red.' },
        { id: 'opt_3', label: '3. The sarcophagus base opened.' },
        { id: 'opt_4', label: '4. The fourth green jar doubled in size.' }
      ],
      correctAnswerId: 'opt_2',
      changedElementDescription: 'The third canopic jar resting on the sarcophagus altered its crest color from purple to crimson red.'
    },

    // ----------------------------------------------------
    // VIKINGS BIOME (3 Scenarios)
    // ----------------------------------------------------
    {
      id: 'stub_vikings_01',
      name: 'Longhouse Feast',
      world: 'Vikings',
      worldId: 'vikings',
      difficulty: 2,
      promptText: 'Study the three shields mounted along the mead hall timber wall.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#09121a; border-radius:8px;">
          <rect width="600" height="320" fill="#141f2c"/>
          <line x1="0" y1="260" x2="600" y2="260" stroke="#00e5ff22" stroke-width="4"/>
          <circle cx="130" cy="150" r="50" fill="#7f1d1d" stroke="#cbd5e1" stroke-width="6"/>
          <g id="centerShield" transform="translate(300, 150)">
            <circle cx="0" cy="0" r="56" fill="#1e3a8a" stroke="#facc15" stroke-width="6"/>
            <rect x="-56" y="-12" width="112" height="24" fill="#facc15"/>
            <rect x="-12" y="-56" width="24" height="112" fill="#facc15"/>
          </g>
          <circle cx="470" cy="150" r="50" fill="#14532d" stroke="#86efac" stroke-width="6"/>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#09121a; border-radius:8px;">
          <rect width="600" height="320" fill="#141f2c"/>
          <line x1="0" y1="260" x2="600" y2="260" stroke="#00e5ff22" stroke-width="4"/>
          <circle cx="130" cy="150" r="50" fill="#7f1d1d" stroke="#cbd5e1" stroke-width="6"/>
          <g transform="translate(300, 150)">
            <circle cx="0" cy="0" r="56" fill="#450a0a" stroke="#ef4444" stroke-width="6"/>
            <circle cx="0" cy="0" r="38" fill="none" stroke="#ef4444" stroke-width="6"/>
          </g>
          <circle cx="470" cy="150" r="50" fill="#14532d" stroke="#86efac" stroke-width="6"/>
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
      id: 'stub_vikings_02',
      name: 'Shipyard Storm',
      world: 'Vikings',
      worldId: 'vikings',
      difficulty: 2,
      promptText: 'Observe the three Norse warship hulls moored at the freezing fjord.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#081018; border-radius:8px;">
          <rect width="600" height="320" fill="#081018"/>
          <!-- Ship 1 -->
          <path d="M50,220 Q100,260 150,220 L130,170 L70,170 Z" fill="#334155" stroke="#94a3b8"/>
          <!-- Ship 2 -->
          <path d="M250,220 Q300,260 350,220 L330,170 L270,170 Z" fill="#334155" stroke="#94a3b8"/>
          <rect x="295" y="100" width="10" height="70" fill="#e2e8f0"/>
          <!-- Ship 3 -->
          <path d="M450,220 Q500,260 550,220 L530,170 L470,170 Z" fill="#334155" stroke="#94a3b8"/>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#081018; border-radius:8px;">
          <rect width="600" height="320" fill="#081018"/>
          <path d="M50,220 Q100,260 150,220 L130,170 L70,170 Z" fill="#334155" stroke="#94a3b8"/>
          <path d="M250,220 Q300,260 350,220 L330,170 L270,170 Z" fill="#334155" stroke="#94a3b8"/>
          <!-- Mast vanished on Ship 2 -->
          <path d="M450,220 Q500,260 550,220 L530,170 L470,170 Z" fill="#334155" stroke="#94a3b8"/>
        </svg>
      `,
      options: [
        { id: 'opt_1', label: '1. The mast on the center warship broke off and vanished.' },
        { id: 'opt_2', label: '2. The right warship sank beneath the waves.' },
        { id: 'opt_3', label: '3. Lightning struck the left hull.' },
        { id: 'opt_4', label: '4. The water froze solid.' }
      ],
      correctAnswerId: 'opt_1',
      changedElementDescription: 'The upright timber mast on the center Viking longship vanished.'
    },
    {
      id: 'stub_vikings_03',
      name: 'Rune Carving Hall',
      world: 'Vikings',
      worldId: 'vikings',
      difficulty: 3,
      promptText: 'Study the four glowing runes carved into the stone archway.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0c131d; border-radius:8px;">
          <rect width="600" height="320" fill="#0c131d"/>
          <rect x="100" y="120" width="80" height="100" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
          <rect x="210" y="120" width="80" height="100" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
          <rect x="320" y="120" width="80" height="100" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
          <rect x="430" y="120" width="80" height="100" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0c131d; border-radius:8px;">
          <rect width="600" height="320" fill="#0c131d"/>
          <rect x="100" y="120" width="80" height="100" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
          <rect x="210" y="120" width="80" height="100" fill="#1e293b" stroke="#facc15" stroke-width="4"/>
          <rect x="320" y="120" width="80" height="100" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
          <rect x="430" y="120" width="80" height="100" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        </svg>
      `,
      options: [
        { id: 'opt_1', label: '1. The first stone rune disappeared.' },
        { id: 'opt_2', label: '2. The second rune stone flared bright yellow-gold.' },
        { id: 'opt_3', label: '3. The fourth rune cracked.' },
        { id: 'opt_4', label: '4. The archway collapsed.' }
      ],
      correctAnswerId: 'opt_2',
      changedElementDescription: 'The second carved rune stone shifted from cyan illumination to bright yellow-gold.'
    },

    // ----------------------------------------------------
    // MARS COLONY BIOME (3 Scenarios)
    // ----------------------------------------------------
    {
      id: 'stub_mars_01',
      name: 'Hydroponic Airlock',
      world: 'Mars Colony',
      worldId: 'mars',
      difficulty: 3,
      promptText: 'Monitor the hydroponic airlock control console settings.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0a0d14; border-radius:8px;">
          <rect width="600" height="320" fill="#0c1018"/>
          <rect x="40" y="30" width="520" height="260" rx="12" fill="#111827" stroke="#00e5ff44" stroke-width="2"/>
          <g transform="translate(160, 160)">
            <circle cx="0" cy="0" r="45" fill="#1e293b" stroke="#334155" stroke-width="4"/>
            <line x1="-35" y1="0" x2="35" y2="0" stroke="#10b981" stroke-width="12" stroke-linecap="round"/>
          </g>
          <g transform="translate(440, 160)">
            <circle cx="0" cy="0" r="45" fill="#1e293b" stroke="#334155" stroke-width="4"/>
            <line x1="-35" y1="0" x2="35" y2="0" stroke="#10b981" stroke-width="12" stroke-linecap="round"/>
          </g>
          <circle cx="300" cy="160" r="20" fill="#00e5ff"/>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0a0d14; border-radius:8px;">
          <rect width="600" height="320" fill="#0c1018"/>
          <rect x="40" y="30" width="520" height="260" rx="12" fill="#111827" stroke="#ef444466" stroke-width="2"/>
          <g transform="translate(160, 160)">
            <circle cx="0" cy="0" r="45" fill="#1e293b" stroke="#334155" stroke-width="4"/>
            <line x1="-35" y1="0" x2="35" y2="0" stroke="#10b981" stroke-width="12" stroke-linecap="round"/>
          </g>
          <g transform="translate(440, 160)">
            <circle cx="0" cy="0" r="45" fill="#450a0a" stroke="#ef4444" stroke-width="4"/>
            <line x1="0" y1="-35" x2="0" y2="35" stroke="#ef4444" stroke-width="12" stroke-linecap="round"/>
          </g>
          <circle cx="300" cy="160" r="20" fill="#ef4444"/>
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
    },
    {
      id: 'stub_mars_02',
      name: 'Reactor Core Drift',
      world: 'Mars Colony',
      worldId: 'mars',
      difficulty: 3,
      promptText: 'Track the three fusion stabilizer rings in the reactor bay.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0d0614; border-radius:8px;">
          <rect width="600" height="320" fill="#0d0614"/>
          <circle cx="150" cy="160" r="40" fill="none" stroke="#00e5ff" stroke-width="8"/>
          <circle cx="300" cy="160" r="40" fill="none" stroke="#00e5ff" stroke-width="8"/>
          <circle cx="450" cy="160" r="40" fill="none" stroke="#00e5ff" stroke-width="8"/>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0d0614; border-radius:8px;">
          <rect width="600" height="320" fill="#0d0614"/>
          <circle cx="150" cy="160" r="40" fill="none" stroke="#00e5ff" stroke-width="8"/>
          <!-- Center ring shifted upward -->
          <circle cx="300" cy="110" r="40" fill="none" stroke="#facc15" stroke-width="8"/>
          <circle cx="450" cy="160" r="40" fill="none" stroke="#00e5ff" stroke-width="8"/>
        </svg>
      `,
      options: [
        { id: 'opt_1', label: '1. The left stabilizer ring stopped glowing.' },
        { id: 'opt_2', label: '2. The center fusion ring drifted upward and turned yellow.' },
        { id: 'opt_3', label: '3. The right ring expanded to double radius.' },
        { id: 'opt_4', label: '4. All three rings aligned.' }
      ],
      correctAnswerId: 'opt_2',
      changedElementDescription: 'The center fusion ring drifted 50px upward out of alignment and turned warning yellow.'
    },
    {
      id: 'stub_mars_03',
      name: 'Communication Array',
      world: 'Mars Colony',
      worldId: 'mars',
      difficulty: 2,
      promptText: 'Observe the orientation of the three orbital relay dishes.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#080a10; border-radius:8px;">
          <rect width="600" height="320" fill="#080a10"/>
          <line x1="150" y1="240" x2="150" y2="140" stroke="#64748b" stroke-width="6"/>
          <arc d="M110,140 Q150,110 190,140" fill="none" stroke="#00e5ff" stroke-width="6"/>
          <line x1="300" y1="240" x2="300" y2="140" stroke="#64748b" stroke-width="6"/>
          <arc d="M260,140 Q300,110 340,140" fill="none" stroke="#00e5ff" stroke-width="6"/>
          <line x1="450" y1="240" x2="450" y2="140" stroke="#64748b" stroke-width="6"/>
          <arc d="M410,140 Q450,110 490,140" fill="none" stroke="#00e5ff" stroke-width="6"/>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#080a10; border-radius:8px;">
          <rect width="600" height="320" fill="#080a10"/>
          <line x1="150" y1="240" x2="150" y2="140" stroke="#64748b" stroke-width="6"/>
          <!-- Left dish inverted -->
          <line x1="110" y1="140" x2="190" y2="180" stroke="#ef4444" stroke-width="6"/>
          <line x1="300" y1="240" x2="300" y2="140" stroke="#64748b" stroke-width="6"/>
          <line x1="450" y1="240" x2="450" y2="140" stroke="#64748b" stroke-width="6"/>
        </svg>
      `,
      options: [
        { id: 'opt_1', label: '1. The left satellite dish tilted downward into a red alert posture.' },
        { id: 'opt_2', label: '2. The center relay mast snapped.' },
        { id: 'opt_3', label: '3. The right dish disconnected.' },
        { id: 'opt_4', label: '4. The sky turned bright orange.' }
      ],
      correctAnswerId: 'opt_1',
      changedElementDescription: 'The far left communication dish tilted downward into an off-axis red warning posture.'
    },

    // ----------------------------------------------------
    // FANTASY BIOME (3 Scenarios)
    // ----------------------------------------------------
    {
      id: 'stub_fantasy_01',
      name: 'Arcane Library',
      world: 'Fantasy',
      worldId: 'fantasy',
      difficulty: 2,
      promptText: 'Examine the three floating grimoires above the reading desk.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#11081f; border-radius:8px;">
          <rect width="600" height="320" fill="#11081f"/>
          <rect x="120" y="140" width="60" height="80" fill="#581c87" stroke="#c084fc" stroke-width="3"/>
          <rect x="270" y="140" width="60" height="80" fill="#1e3a8a" stroke="#60a5fa" stroke-width="3"/>
          <rect x="420" y="140" width="60" height="80" fill="#047857" stroke="#34d399" stroke-width="3"/>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#11081f; border-radius:8px;">
          <rect width="600" height="320" fill="#11081f"/>
          <rect x="120" y="140" width="60" height="80" fill="#581c87" stroke="#c084fc" stroke-width="3"/>
          <!-- Center book vanished -->
          <rect x="420" y="140" width="60" height="80" fill="#047857" stroke="#34d399" stroke-width="3"/>
        </svg>
      `,
      options: [
        { id: 'opt_1', label: '1. The purple grimoire turned green.' },
        { id: 'opt_2', label: '2. The center blue grimoire vanished.' },
        { id: 'opt_3', label: '3. The green book fell.' },
        { id: 'opt_4', label: '4. A fourth book appeared.' }
      ],
      correctAnswerId: 'opt_2',
      changedElementDescription: 'The center blue grimoire vanished from its floating levitation field.'
    },
    {
      id: 'stub_fantasy_02',
      name: 'Floating Alchemy Bay',
      world: 'Fantasy',
      worldId: 'fantasy',
      difficulty: 3,
      promptText: 'Watch the bubbling potions in the three crystal retorts.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0d141a; border-radius:8px;">
          <rect width="600" height="320" fill="#0d141a"/>
          <circle cx="150" cy="180" r="35" fill="#10b981" opacity="0.8"/>
          <circle cx="300" cy="180" r="35" fill="#a855f7" opacity="0.8"/>
          <circle cx="450" cy="180" r="35" fill="#3b82f6" opacity="0.8"/>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0d141a; border-radius:8px;">
          <rect width="600" height="320" fill="#0d141a"/>
          <circle cx="150" cy="180" r="35" fill="#10b981" opacity="0.8"/>
          <circle cx="300" cy="180" r="35" fill="#eab308" opacity="0.9"/>
          <circle cx="450" cy="180" r="35" fill="#3b82f6" opacity="0.8"/>
        </svg>
      `,
      options: [
        { id: 'opt_1', label: '1. The left flask boiled over.' },
        { id: 'opt_2', label: '2. The center potion mutated from violet to glowing gold.' },
        { id: 'opt_3', label: '3. The right blue flask cracked.' },
        { id: 'opt_4', label: '4. All potions turned grey.' }
      ],
      correctAnswerId: 'opt_2',
      changedElementDescription: 'The center alchemy potion mutated its chemical state from violet to glowing gold.'
    },
    {
      id: 'stub_fantasy_03',
      name: 'Crystal Observatory',
      world: 'Fantasy',
      worldId: 'fantasy',
      difficulty: 3,
      promptText: 'Notice the alignment of the three stellar crystals.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0c0618; border-radius:8px;">
          <rect width="600" height="320" fill="#0c0618"/>
          <polygon points="150,100 180,180 150,260 120,180" fill="#00e5ff"/>
          <polygon points="300,100 330,180 300,260 270,180" fill="#c084fc"/>
          <polygon points="450,100 480,180 450,260 420,180" fill="#38bdf8"/>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0c0618; border-radius:8px;">
          <rect width="600" height="320" fill="#0c0618"/>
          <polygon points="150,100 180,180 150,260 120,180" fill="#00e5ff"/>
          <polygon points="300,100 330,180 300,260 270,180" fill="#c084fc"/>
          <!-- Right crystal shattered/rotated horizontal -->
          <polygon points="410,180 450,150 490,180 450,210" fill="#ef4444"/>
        </svg>
      `,
      options: [
        { id: 'opt_1', label: '1. The left cyan crystal darkened.' },
        { id: 'opt_2', label: '2. The center crystal fell.' },
        { id: 'opt_3', label: '3. The right stellar crystal rotated sideways and turned crimson.' },
        { id: 'opt_4', label: '4. The ceiling opened.' }
      ],
      correctAnswerId: 'opt_3',
      changedElementDescription: 'The far right stellar crystal rotated 90 degrees horizontally and shifted to crimson.'
    },

    // ----------------------------------------------------
    // CYBERPUNK BIOME (3 Scenarios)
    // ----------------------------------------------------
    {
      id: 'stub_cyberpunk_01',
      name: 'Neon Alleyway',
      world: 'Cyberpunk',
      worldId: 'cyberpunk',
      difficulty: 3,
      promptText: 'Study the three neon advertisement signs on the rain-slicked wall.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#060814; border-radius:8px;">
          <rect width="600" height="320" fill="#060814"/>
          <rect x="80" y="130" width="100" height="60" fill="#ec4899" stroke="#f0abfc" stroke-width="3"/>
          <rect x="250" y="130" width="100" height="60" fill="#06b6d4" stroke="#67e8f9" stroke-width="3"/>
          <rect x="420" y="130" width="100" height="60" fill="#eab308" stroke="#fef08a" stroke-width="3"/>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#060814; border-radius:8px;">
          <rect width="600" height="320" fill="#060814"/>
          <!-- Left sign flickered off -->
          <rect x="80" y="130" width="100" height="60" fill="#1f2937" stroke="#334155" stroke-width="1"/>
          <rect x="250" y="130" width="100" height="60" fill="#06b6d4" stroke="#67e8f9" stroke-width="3"/>
          <rect x="420" y="130" width="100" height="60" fill="#eab308" stroke="#fef08a" stroke-width="3"/>
        </svg>
      `,
      options: [
        { id: 'opt_1', label: '1. The pink neon sign on the left short-circuited and went dark.' },
        { id: 'opt_2', label: '2. The center cyan sign flashed green.' },
        { id: 'opt_3', label: '3. The yellow sign fell into the alley.' },
        { id: 'opt_4', label: '4. A police drone flew past.' }
      ],
      correctAnswerId: 'opt_1',
      changedElementDescription: 'The pink neon advertisement sign on the left short-circuited and turned off.'
    },
    {
      id: 'stub_cyberpunk_02',
      name: 'Cybernetic Drone Port',
      world: 'Cyberpunk',
      worldId: 'cyberpunk',
      difficulty: 3,
      promptText: 'Examine the three docking bays on the rooftop drone pad.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0a0d18; border-radius:8px;">
          <rect width="600" height="320" fill="#0a0d18"/>
          <circle cx="150" cy="160" r="30" fill="#3b82f6"/>
          <circle cx="300" cy="160" r="30" fill="#3b82f6"/>
          <circle cx="450" cy="160" r="30" fill="#3b82f6"/>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#0a0d18; border-radius:8px;">
          <rect width="600" height="320" fill="#0a0d18"/>
          <circle cx="150" cy="160" r="30" fill="#3b82f6"/>
          <circle cx="300" cy="160" r="30" fill="#3b82f6"/>
          <circle cx="450" cy="160" r="30" fill="#ef4444"/>
        </svg>
      `,
      options: [
        { id: 'opt_1', label: '1. Bay 1 drone launched.' },
        { id: 'opt_2', label: '2. Bay 2 turned off.' },
        { id: 'opt_3', label: '3. Bay 3 docking pad switched from blue nominal to red emergency alert.' },
        { id: 'opt_4', label: '4. The rooftop collapsed.' }
      ],
      correctAnswerId: 'opt_3',
      changedElementDescription: 'Docking Bay 3 on the right switched from blue nominal status to red emergency alert.'
    },
    {
      id: 'stub_cyberpunk_03',
      name: 'Holographic Market',
      world: 'Cyberpunk',
      worldId: 'cyberpunk',
      difficulty: 3,
      promptText: 'Monitor the three spinning hologram projectors.',
      sceneA: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#070a14; border-radius:8px;">
          <rect width="600" height="320" fill="#070a14"/>
          <polygon points="150,120 180,200 120,200" fill="#00e5ff" opacity="0.8"/>
          <polygon points="300,120 330,200 270,200" fill="#a855f7" opacity="0.8"/>
          <polygon points="450,120 480,200 420,200" fill="#10b981" opacity="0.8"/>
        </svg>
      `,
      sceneB: `
        <svg viewBox="0 0 600 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#070a14; border-radius:8px;">
          <rect width="600" height="320" fill="#070a14"/>
          <polygon points="150,120 180,200 120,200" fill="#00e5ff" opacity="0.8"/>
          <!-- Center hologram inverted -->
          <polygon points="300,200 330,120 270,120" fill="#facc15" opacity="0.9"/>
          <polygon points="450,120 480,200 420,200" fill="#10b981" opacity="0.8"/>
        </svg>
      `,
      options: [
        { id: 'opt_1', label: '1. The cyan hologram vanished.' },
        { id: 'opt_2', label: '2. The center purple hologram inverted upside down and turned yellow.' },
        { id: 'opt_3', label: '3. The right green hologram shrank.' },
        { id: 'opt_4', label: '4. All projectors stopped.' }
      ],
      correctAnswerId: 'opt_2',
      changedElementDescription: 'The center hologram inverted upside down and turned yellow.'
    }
  ];

})();
