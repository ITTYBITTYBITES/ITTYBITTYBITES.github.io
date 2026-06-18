/**
 * SCRIPT TO OVERHAUL master catalog (games.json) WITH 100% UNIQUE, PREMIUM SVG THUMBNAILS // v1.0
 * Generates custom, high-fidelity special operations cybersecurity graphics for all 18 games.
 */

const fs = require('fs');
const path = require('path');

const masterCatalogPath = path.join(__dirname, 'games.json');
let games = JSON.parse(fs.readFileSync(masterCatalogPath, 'utf8'));

// Helper to encode pristine SVG Data URIs
function makeSvgUri(svgContent) {
    const clean = svgContent
        .replace(/\s+/g, ' ')
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E')
        .replace(/#/g, '%23')
        .replace(/"/g, '%22')
        .replace(/'/g, '%27');
    return `data:image/svg+xml;utf8,${clean}`;
}

// 18 Bespoke Premium SVG Masterpieces
const uniqueThumbnails = {
    "cosmic-tunnel": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <defs>
                <radialGradient id='ct-grad' cx='50%' cy='50%' r='50%'>
                    <stop offset='0%' stop-color='#0f172a'/>
                    <stop offset='100%' stop-color='#020617'/>
                </radialGradient>
            </defs>
            <rect width='600' height='375' fill='url(#ct-grad)'/>
            <!-- 3D Cylindrical Wormhole Rings -->
            <ellipse cx='300' cy='187' rx='280' ry='160' fill='none' stroke='#22d3ee' stroke-width='2' opacity='0.15'/>
            <ellipse cx='300' cy='187' rx='200' ry='110' fill='none' stroke='#22d3ee' stroke-width='3' opacity='0.3'/>
            <ellipse cx='300' cy='187' rx='130' ry='70' fill='none' stroke='#22d3ee' stroke-width='4' opacity='0.5'/>
            <ellipse cx='300' cy='187' rx='70' ry='40' fill='none' stroke='#22d3ee' stroke-width='5' opacity='0.8'/>
            <!-- Connecting Warp Lines -->
            <path d='M20 27L230 147M580 27L370 147M20 347L230 227M580 347L370 227' stroke='#38bdf8' stroke-width='1.5' stroke-dasharray='6,6' opacity='0.4'/>
            <!-- Oncoming Crimson Threat Laser Obstacles -->
            <rect x='160' y='120' width='120' height='16' fill='#f43f5e' opacity='0.85' rx='8'/>
            <rect x='340' y='220' width='160' height='22' fill='#f43f5e' opacity='0.9' rx='11'/>
            <!-- Golden Tachyon Stars -->
            <circle cx='380' cy='130' r='10' fill='#facc15'/>
            <circle cx='210' cy='250' r='14' fill='#facc15'/>
            <!-- Player Cyber Delta Vessel -->
            <path d='M300 240L335 320H265Z' fill='#22d3ee' filter='drop-shadow(0 0 12px #22d3ee)'/>
            <circle cx='300' cy='314' r='8' fill='#facc15'/>
        </svg>`,

    "grid-delver": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='375' fill='#090d16'/>
            <rect x='30' y='30' width='540' height='315' rx='20' fill='#101728' stroke='#1e293b' stroke-width='4'/>
            <!-- 5x5 Dungeon Grid -->
            <g fill='#1e293b' stroke='#334155' stroke-width='2' rx='10'>
                <!-- Row 1 -->
                <rect x='60' y='55' width='84' height='45'/><rect x='160' y='55' width='84' height='45'/><rect x='260' y='55' width='84' height='45'/><rect x='360' y='55' width='84' height='45'/><rect x='460' y='55' width='84' height='45'/>
                <!-- Row 2 -->
                <rect x='60' y='110' width='84' height='45'/><rect x='160' y='110' width='84' height='45'/><rect x='260' y='110' width='84' height='45'/><rect x='360' y='110' width='84' height='45'/><rect x='460' y='110' width='84' height='45'/>
                <!-- Row 3 -->
                <rect x='60' y='165' width='84' height='45'/><rect x='160' y='165' width='84' height='45'/><rect x='260' y='165' width='84' height='45'/><rect x='360' y='165' width='84' height='45'/><rect x='460' y='165' width='84' height='45'/>
                <!-- Row 4 -->
                <rect x='60' y='220' width='84' height='45'/><rect x='160' y='220' width='84' height='45'/><rect x='260' y='220' width='84' height='45'/><rect x='360' y='220' width='84' height='45'/><rect x='460' y='220' width='84' height='45'/>
                <!-- Row 5 -->
                <rect x='60' y='275' width='84' height='45'/><rect x='160' y='275' width='84' height='45'/><rect x='260' y='275' width='84' height='45'/><rect x='360' y='275' width='84' height='45'/><rect x='460' y='275' width='84' height='45'/>
            </g>
            <!-- Highlighted Dungeon Entities -->
            <!-- Player -->
            <rect x='160' y='165' width='84' height='45' rx='10' fill='#22d3ee' opacity='0.2'/>
            <rect x='160' y='165' width='84' height='45' rx='10' fill='none' stroke='#22d3ee' stroke-width='4'/>
            <text x='202' y='195' font-family='monospace' font-size='26' font-weight='black' fill='#22d3ee' text-anchor='middle'>◈</text>
            <!-- Gold Chest -->
            <rect x='360' y='110' width='84' height='45' rx='10' fill='#facc15' opacity='0.25'/>
            <rect x='360' y='110' width='84' height='45' rx='10' fill='none' stroke='#facc15' stroke-width='3'/>
            <text x='402' y='140' font-family='monospace' font-size='24' font-weight='bold' fill='#facc15' text-anchor='middle'>🏆</text>
            <!-- Shadow Beast Monster -->
            <rect x='260' y='220' width='84' height='45' rx='10' fill='#c084fc' opacity='0.25'/>
            <rect x='260' y='220' width='84' height='45' rx='10' fill='none' stroke='#c084fc' stroke-width='3'/>
            <text x='302' y='250' font-family='monospace' font-size='24' font-weight='bold' fill='#c084fc' text-anchor='middle'>👾</text>
            <!-- Trap Node -->
            <rect x='460' y='275' width='84' height='45' rx='10' fill='#f43f5e' opacity='0.25'/>
            <text x='502' y='305' font-family='monospace' font-size='24' font-weight='bold' fill='#f43f5e' text-anchor='middle'>💥</text>
        </svg>`,

    "quantum-sentinel": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='375' fill='#040711'/>
            <!-- Radar Coordinate Field -->
            <circle cx='300' cy='187' r='160' fill='none' stroke='#1e293b' stroke-width='2'/>
            <circle cx='300' cy='187' r='100' fill='none' stroke='#1e293b' stroke-width='1.5'/>
            <circle cx='300' cy='187' r='40' fill='none' stroke='#334155' stroke-width='1'/>
            <path d='M300 0V375M0 187H600' stroke='#0f172a' stroke-width='2'/>
            <!-- Spawning Reticle Nodes -->
            <!-- Reticle 1 (Imminent) -->
            <circle cx='200' cy='120' r='38' fill='none' stroke='#f43f5e' stroke-width='3' stroke-dasharray='8,4'/>
            <circle cx='200' cy='120' r='24' fill='#f43f5e' opacity='0.2'/>
            <circle cx='200' cy='120' r='12' fill='#f43f5e'/>
            <text x='200' y='96' font-family='monospace' font-size='12' font-weight='bold' fill='#f43f5e' text-anchor='middle'>QT_89A</text>
            <!-- Reticle 2 (Stabilized) -->
            <circle cx='420' cy='240' r='42' fill='none' stroke='#facc15' stroke-width='2'/>
            <circle cx='420' cy='240' r='16' fill='#22d3ee'/>
            <!-- Interception Flash -->
            <circle cx='350' cy='100' r='28' fill='#34d399' opacity='0.4'/>
            <circle cx='350' cy='100' r='6' fill='#white'/>
            <path d='M330 80L370 120M330 120L370 80' stroke='#34d399' stroke-width='4'/>
        </svg>`,

    "raycasted-doom": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='187' fill='#090d16'/>
            <rect y='187' width='600' height='188' fill='#020617'/>
            <!-- Pseudo-3D Raycasted Walls -->
            <path d='M0 60L120 120V254L0 314Z' fill='#1e293b' stroke='#334155' stroke-width='2'/>
            <path d='M120 120L220 150V224L120 254Z' fill='#0f172a' stroke='#1e293b' stroke-width='2'/>
            <path d='M600 40L450 110V264L600 334Z' fill='#273554' stroke='#3b82f6' stroke-width='2'/>
            <path d='M450 110L360 145V229L450 264Z' fill='#1d283a' stroke='#22d3ee' stroke-width='1'/>
            <!-- Oncoming Energy Forcefield Gate -->
            <rect x='220' y='150' width='140' height='74' fill='#22d3ee' opacity='0.3'/>
            <rect x='220' y='150' width='140' height='74' fill='none' stroke='#22d3ee' stroke-width='3' stroke-dasharray='5,5'/>
            <!-- Center Crosshair Weapon HUD -->
            <path d='M300 170V204M283 187H317' stroke='#facc15' stroke-width='3' opacity='0.8'/>
            <path d='M250 375L280 280H320L350 375Z' fill='#34d399' stroke='#040711' stroke-width='4'/>
        </svg>`,

    "orbital-sandbox": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='375' fill='#040814'/>
            <!-- Orbit Trajectory Ellipses -->
            <ellipse cx='300' cy='187' rx='220' ry='120' fill='none' stroke='#334155' stroke-width='2' stroke-dasharray='8,4'/>
            <ellipse cx='300' cy='187' rx='140' ry='80' fill='none' stroke='#1e293b' stroke-width='2'/>
            <!-- Massive Stellar Sun -->
            <circle cx='300' cy='187' r='45' fill='#facc15' filter='drop-shadow(0 0 25px #facc15)'/>
            <circle cx='300' cy='187' r='55' fill='none' stroke='#facc15' stroke-width='2' opacity='0.4'/>
            <!-- Slingshot Planetary Probes -->
            <!-- Probe 1 (Orbiting) -->
            <circle cx='520' cy='187' r='14' fill='#22d3ee'/>
            <path d='M520 187C520 120 420 67 300 67' fill='none' stroke='#22d3ee' stroke-width='3' opacity='0.7'/>
            <!-- Probe 2 (Active Drag Sling) -->
            <circle cx='180' cy='280' r='12' fill='#34d399'/>
            <path d='M180 280L275 210' stroke='#facc15' stroke-width='4' stroke-dasharray='6,6'/>
            <circle cx='180' cy='280' r='24' fill='none' stroke='#34d399' stroke-width='2' opacity='0.8'/>
        </svg>`,

    "cyber-vector": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='375' fill='#060913'/>
            <!-- Cyber Neon Grid Floor -->
            <path d='M0 375L260 180H340L600 375' fill='none' stroke='#22d3ee' stroke-width='3' opacity='0.6'/>
            <path d='M100 375L280 180M200 375L290 180M400 375L310 180M500 375L320 180' stroke='#22d3ee' stroke-width='1.5' opacity='0.4'/>
            <path d='M0 240H600M0 290H600M0 340H600' stroke='#22d3ee' stroke-width='2' opacity='0.3'/>
            <!-- Glowing Pink Horizon -->
            <rect y='178' width='600' height='4' fill='#f43f5e' filter='drop-shadow(0 0 10px #f43f5e)'/>
            <!-- Incoming 3D Block Obstacles -->
            <rect x='180' y='220' width='40' height='40' fill='#f43f5e' stroke='#fecdd3' stroke-width='2'/>
            <rect x='380' y='270' width='70' height='70' fill='#f43f5e' stroke='#fecdd3' stroke-width='3'/>
            <!-- Player Vector Hovercraft -->
            <path d='M300 320L350 365H250Z' fill='#34d399' filter='drop-shadow(0 0 15px #34d399)'/>
            <path d='M285 365L300 340L315 365' fill='#facc15'/>
        </svg>`,

    "quantum-breakout": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='375' fill='#020617'/>
            <!-- Volumetric Target Node Arrays (Bricks) -->
            <g stroke='#0f172a' stroke-width='4' rx='6'>
                <!-- Row 1 -->
                <rect x='50' y='40' width='92' height='28' fill='#22d3ee'/><rect x='150' y='40' width='92' height='28' fill='#34d399'/><rect x='250' y='40' width='92' height='28' fill='#22d3ee'/><rect x='350' y='40' width='92' height='28' fill='#34d399'/><rect x='450' y='40' width='92' height='28' fill='#22d3ee'/>
                <!-- Row 2 -->
                <rect x='50' y='76' width='92' height='28' fill='#34d399'/><rect x='150' y='76' width='92' height='28' fill='#22d3ee'/><rect x='350' y='76' width='92' height='28' fill='#22d3ee'/><rect x='450' y='76' width='92' height='28' fill='#34d399'/>
                <!-- Row 3 -->
                <rect x='50' y='112' width='92' height='28' fill='#22d3ee'/><rect x='450' y='112' width='92' height='28' fill='#22d3ee'/>
            </g>
            <!-- Explosive Impact on Shattered Brick -->
            <circle cx='296' cy='90' r='35' fill='#facc15' opacity='0.3'/>
            <path d='M296 50L310 130M256 90L336 90M270 65L320 115' stroke='#facc15' stroke-width='3'/>
            <!-- Deflection Paddle -->
            <rect x='230' y='330' width='140' height='18' rx='9' fill='#facc15' filter='drop-shadow(0 0 12px #facc15)'/>
            <!-- Intense Energy Ball -->
            <circle cx='280' cy='220' r='14' fill='#white' filter='drop-shadow(0 0 15px #white)'/>
            <path d='M280 220L250 330' stroke='#22d3ee' stroke-width='3' stroke-dasharray='6,6'/>
        </svg>`,

    "gravity-slingshot": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='375' fill='#090d16'/>
            <!-- Space Spatial Grid Warping -->
            <path d='M0 100Q300 250 600 100M0 200Q300 350 600 200M0 300Q300 450 600 300' fill='none' stroke='#1e293b' stroke-width='2'/>
            <!-- Intense Gravitational Black Hole Wells -->
            <circle cx='220' cy='220' r='40' fill='#000' stroke='#f43f5e' stroke-width='6' filter='drop-shadow(0 0 20px #f43f5e)'/>
            <circle cx='460' cy='140' r='32' fill='#000' stroke='#f43f5e' stroke-width='5' filter='drop-shadow(0 0 15px #f43f5e)'/>
            <!-- Operational Clearance Target -->
            <circle cx='530' cy='300' r='28' fill='#34d399' opacity='0.8'/>
            <circle cx='530' cy='300' r='12' fill='#white'/>
            <!-- Slingshot Exploration Capsule -->
            <circle cx='80' cy='80' r='14' fill='#22d3ee'/>
            <!-- Beautiful Wavy Sling Trajectory -->
            <path d='M80 80Q220 50 300 160T530 300' fill='none' stroke='#facc15' stroke-width='4' stroke-dasharray='8,6'/>
        </svg>`,

    "neon-polygon": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='375' fill='#030712'/>
            <!-- 360 Degree Radar Defense Lanes -->
            <line x1='0' y1='0' x2='600' y2='375' stroke='#1e293b' stroke-width='1.5'/>
            <line x1='600' y1='0' x2='0' y2='375' stroke='#1e293b' stroke-width='1.5'/>
            <line x1='300' y1='0' x2='300' y2='375' stroke='#1e293b' stroke-width='1.5'/>
            <line x1='0' y1='187' x2='600' y2='187' stroke='#1e293b' stroke-width='1.5'/>
            <!-- Central Operative Core -->
            <circle cx='300' cy='187' r='40' fill='#34d399' filter='drop-shadow(0 0 20px #34d399)'/>
            <circle cx='300' cy='187' r='15' fill='#020617'/>
            <!-- Approach Lines & Oncoming Threat Polygons -->
            <!-- Enemy 1 (Top Left) -->
            <polygon points='140,70 170,90 150,120 120,100' fill='#f43f5e' stroke='#fecdd3' stroke-width='2'/>
            <line x1='300' y1='187' x2='150' y2='95' stroke='#22d3ee' stroke-width='4' stroke-dasharray='10,5'/>
            <!-- Enemy 2 (Bottom Right) -->
            <polygon points='460,280 500,290 480,330 440,310' fill='#f43f5e' stroke='#fecdd3' stroke-width='3'/>
        </svg>`,

    "tachyon-racer": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='375' fill='#050b14'/>
            <!-- High-Speed Vertical Cyber Corridor -->
            <path d='M200 0L100 375M400 0L500 375' stroke='#334155' stroke-width='4'/>
            <path d='M260 0L220 375M340 0L380 375' stroke='#1e293b' stroke-width='2' stroke-dasharray='20,20'/>
            <!-- Highly Volatile Shifting Laser Gates -->
            <rect x='130' y='90' width='220' height='28' fill='#f43f5e' opacity='0.9' rx='6' stroke='#fecdd3' stroke-width='2'/>
            <rect x='280' y='240' width='200' height='34' fill='#f43f5e' opacity='0.95' rx='8' stroke='#fecdd3' stroke-width='3'/>
            <!-- Supersonic Interceptor Craft -->
            <path d='M210 270L240 350H180Z' fill='#22d3ee' filter='drop-shadow(0 0 15px #22d3ee)'/>
            <!-- Kinetic Motion Blur Trails -->
            <line x1='210' y1='350' x2='210' y2='375' stroke='#facc15' stroke-width='6'/>
            <line x1='185' y1='340' x2='185' y2='370' stroke='#22d3ee' stroke-width='3'/>
            <line x1='235' y1='340' x2='235' y2='370' stroke='#22d3ee' stroke-width='3'/>
        </svg>`,

    "retro-breakout": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='375' fill='#090d16'/>
            <!-- Multi-Color Atari Brick Nodes -->
            <g stroke='#020617' stroke-width='3' rx='4'>
                <rect x='40' y='40' width='100' height='24' fill='#f43f5e'/><rect x='146' y='40' width='100' height='24' fill='#facc15'/><rect x='252' y='40' width='100' height='24' fill='#22d3ee'/><rect x='358' y='40' width='100' height='24' fill='#34d399'/><rect x='464' y='40' width='100' height='24' fill='#f43f5e'/>
                <rect x='40' y='70' width='100' height='24' fill='#22d3ee'/><rect x='146' y='70' width='100' height='24' fill='#34d399'/><rect x='252' y='70' width='100' height='24' fill='#f43f5e'/><rect x='358' y='70' width='100' height='24' fill='#facc15'/><rect x='464' y='70' width='100' height='24' fill='#22d3ee'/>
                <rect x='40' y='100' width='100' height='24' fill='#facc15'/><rect x='358' y='100' width='100' height='24' fill='#f43f5e'/><rect x='464' y='100' width='100' height='24' fill='#34d399'/>
            </g>
            <!-- Primary Primary Paddle -->
            <rect x='220' y='330' width='160' height='16' rx='8' fill='#34d399' filter='drop-shadow(0 0 15px #34d399)'/>
            <!-- Multiple High-Speed Dynamic Balls -->
            <circle cx='280' cy='200' r='10' fill='#white'/>
            <path d='M280 200L250 330' stroke='#34d399' stroke-width='2' stroke-dasharray='4,4'/>
            <circle cx='400' cy='160' r='10' fill='#facc15'/>
            <path d='M400 160L420 100' stroke='#facc15' stroke-width='2' stroke-dasharray='4,4'/>
        </svg>`,

    "cyber-snake": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='375' fill='#020617'/>
            <!-- Grid Lines -->
            <g stroke='#0f172a' stroke-width='1'>
                <path d='M0 75H600M0 150H600M0 225H600M0 300H600'/>
                <path d='M100 0V375M200 0V375M300 0V375M400 0V375M500 0V375'/>
            </g>
            <!-- Angular Snake Body Array -->
            <path d='M100 300H300V150H450' fill='none' stroke='#22d3ee' stroke-width='36' stroke-linecap='round' stroke-linejoin='round' opacity='0.85'/>
            <path d='M100 300H300V150H450' fill='none' stroke='#67e8f9' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/>
            <!-- Glowing Golden Head -->
            <circle cx='450' cy='150' r='24' fill='#facc15' filter='drop-shadow(0 0 15px #facc15)'/>
            <circle cx='454' cy='144' r='6' fill='#000'/>
            <!-- Ingested Energy Node -->
            <polygon points='500,70 515,100 485,100' fill='#facc15' stroke='#white' stroke-width='2' filter='drop-shadow(0 0 10px #facc15)'/>
            <!-- Crimson Cyber Threat Barrier -->
            <rect x='250' y='200' width='100' height='25' fill='#f43f5e' rx='6'/>
        </svg>`,

    "neon-pong": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='375' fill='#040711'/>
            <!-- Center Table Dividing Net Line -->
            <line x1='300' y1='0' x2='300' y2='375' stroke='#334155' stroke-width='6' stroke-dasharray='16,16'/>
            <!-- Peripheral Scores -->
            <text x='220' y='70' font-family='monospace' font-size='48' font-weight='black' fill='#22d3ee'>07</text>
            <text x='380' y='70' font-family='monospace' font-size='48' font-weight='black' fill='#f43f5e'>04</text>
            <!-- Primary Player Paddle (Left) -->
            <rect x='40' y='120' width='20' height='140' rx='10' fill='#22d3ee' filter='drop-shadow(0 0 15px #22d3ee)'/>
            <!-- Strategic Dual-Process AI Paddle (Right) -->
            <rect x='540' y='80' width='20' height='140' rx='10' fill='#f43f5e' filter='drop-shadow(0 0 15px #f43f5e)'/>
            <!-- High-Speed Deflecting Energy Sphere -->
            <circle cx='160' cy='170' r='16' fill='#facc15' filter='drop-shadow(0 0 20px #facc15)'/>
            <path d='M160 170L60 150' stroke='#facc15' stroke-width='4' stroke-dasharray='6,6'/>
            <!-- Deflection Spark Sparks -->
            <circle cx='60' cy='150' r='6' fill='#white'/>
            <path d='M50 140L40 130M50 160L40 170M70 140L80 130' stroke='#white' stroke-width='3'/>
        </svg>`,

    "space-asteroids": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='375' fill='#020617'/>
            <!-- Cosmic Threat Buffers (Vector Asteroids) -->
            <!-- Rock 1 (Large) -->
            <polygon points='100,50 160,60 180,110 130,150 70,120' fill='none' stroke='#facc15' stroke-width='5' filter='drop-shadow(0 0 12px #facc15)'/>
            <!-- Rock 2 (Splitting) -->
            <polygon points='480,240 540,250 530,300 470,290' fill='none' stroke='#f43f5e' stroke-width='4'/>
            <polygon points='400,280 440,270 450,310 410,320' fill='none' stroke='#f43f5e' stroke-width='3'/>
            <!-- Special Ops Command Delta Ship -->
            <g transform='translate(300,187) rotate(-25)'>
                <polygon points='30,0 -20,25 -10,0 -20,-25' fill='#22d3ee' filter='drop-shadow(0 0 12px #22d3ee)'/>
                <polygon points='-15,0 -35,10 -35,-10' fill='#facc15'/>
            </g>
            <!-- Firing Plasma Blaster Beams -->
            <line x1='325' y1='175' x2='430' y2='125' stroke='#34d399' stroke-width='6' stroke-linecap='round' filter='drop-shadow(0 0 10px #34d399)'/>
            <line x1='350' y1='160' x2='455' y2='110' stroke='#34d399' stroke-width='6' stroke-linecap='round'/>
        </svg>`,

    "hover-drone": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='375' fill='#090d16'/>
            <!-- Cyber Obstacle Barrier Gates -->
            <!-- Gate 1 -->
            <rect x='150' y='0' width='80' height='120' fill='#f43f5e' stroke='#fecdd3' stroke-width='3'/>
            <rect x='150' y='240' width='80' height='135' fill='#f43f5e' stroke='#fecdd3' stroke-width='3'/>
            <!-- Gate 2 (Oncoming) -->
            <rect x='450' y='0' width='80' height='180' fill='#f43f5e' stroke='#fecdd3' stroke-width='3'/>
            <rect x='450' y='290' width='80' height='85' fill='#f43f5e' stroke='#fecdd3' stroke-width='3'/>
            <!-- Navigation Flappy Drone -->
            <circle cx='280' cy='180' r='22' fill='#34d399' filter='drop-shadow(0 0 15px #34d399)'/>
            <circle cx='280' cy='180' r='8' fill='#020617'/>
            <!-- Flap Motion Waves -->
            <path d='M250 180Q230 160 210 180' fill='none' stroke='#white' stroke-width='4'/>
        </svg>`,

    "cyber-mines": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='375' fill='#090d16'/>
            <g transform='translate(130,47)'>
                <rect width='340' height='280' rx='16' fill='#101728' stroke='#1e293b' stroke-width='4'/>
                <!-- Mine Grid Cards -->
                <g fill='#020617' stroke='#334155' stroke-width='2' rx='8'>
                    <rect x='20' y='20' width='65' height='65'/><rect x='95' y='20' width='65' height='65'/><rect x='170' y='20' width='65' height='65'/><rect x='245' y='20' width='65' height='65'/>
                    <rect x='20' y='95' width='65' height='65'/><rect x='95' y='95' width='65' height='65'/><rect x='170' y='95' width='65' height='65'/><rect x='245' y='95' width='65' height='65'/>
                    <rect x='20' y='170' width='65' height='65'/><rect x='95' y='170' width='65' height='65'/><rect x='170' y='170' width='65' height='65'/><rect x='245' y='170' width='65' height='65'/>
                </g>
                <!-- Exposed Tactical Operational Elements -->
                <!-- Flagged Safe Node -->
                <rect x='20' y='20' width='65' height='65' rx='8' fill='#34d399' opacity='0.2'/>
                <text x='52' y='63' font-family='monospace' font-size='38' font-weight='black' fill='#34d399' text-anchor='middle'>◈</text>
                <!-- Warning Clue Digits -->
                <text x='127' y='63' font-family='monospace' font-size='36' font-weight='black' fill='#22d3ee' text-anchor='middle'>2</text>
                <text x='202' y='63' font-family='monospace' font-size='36' font-weight='black' fill='#facc15' text-anchor='middle'>3</text>
                <text x='127' y='138' font-family='monospace' font-size='36' font-weight='black' fill='#c084fc' text-anchor='middle'>4</text>
                <!-- Detonated Mine Threat -->
                <rect x='245' y='170' width='65' height='65' rx='8' fill='#f43f5e'/>
                <text x='277' y='213' font-family='monospace' font-size='36' font-weight='bold' fill='#000' text-anchor='middle'>💥</text>
            </g>
        </svg>`,

    "attentional-blink": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='375' fill='#020617'/>
            <!-- Highly Volatile High-Speed Ticker Track -->
            <rect x='40' y='140' width='520' height='95' fill='#0f172a' rx='16' stroke='#334155' stroke-width='3'/>
            <!-- Structural Alphanumeric Noise Stream -->
            <text x='90' y='202' font-family='monospace' font-size='48' font-weight='bold' fill='#475569' text-anchor='middle'>K</text>
            <text x='160' y='202' font-family='monospace' font-size='48' font-weight='bold' fill='#475569' text-anchor='middle'>X</text>
            <text x='230' y='202' font-family='monospace' font-size='48' font-weight='bold' fill='#475569' text-anchor='middle'>M</text>
            <text x='370' y='202' font-family='monospace' font-size='48' font-weight='bold' fill='#475569' text-anchor='middle'>A</text>
            <text x='440' y='202' font-family='monospace' font-size='48' font-weight='bold' fill='#475569' text-anchor='middle'>R</text>
            <text x='510' y='202' font-family='monospace' font-size='48' font-weight='bold' fill='#475569' text-anchor='middle'>Y</text>
            <!-- Highlighted Target Digit Popping Out -->
            <circle cx='300' cy='187' r='42' fill='#facc15' opacity='0.2'/>
            <rect x='265' y='148' width='70' height='80' rx='12' fill='none' stroke='#facc15' stroke-width='4'/>
            <text x='300' y='204' font-family='monospace' font-size='56' font-weight='black' fill='#facc15' text-anchor='middle' filter='drop-shadow(0 0 10px #facc15)'>7</text>
        </svg>`,

    "stroop-calibrator": `
        <svg xmlns='http://www.w3.org/2000/svg' width='600' height='375' viewBox='0 0 600 375'>
            <rect width='600' height='375' fill='#090d16'/>
            <!-- Diminishing Ticking Timeline Window -->
            <rect x='60' y='40' width='480' height='8' fill='#1e293b' rx='4'/>
            <rect x='60' y='40' width='180' height='8' fill='#f43f5e' rx='4' filter='drop-shadow(0 0 8px #f43f5e)'/>
            <!-- Text vs Color Cognitive Conflict Prompt -->
            <!-- Printed text says "RED" but rendered in CYAN BLUE ink -->
            <rect x='150' y='80' width='300' height='120' fill='#101728' rx='20' stroke='#273554' stroke-width='4'/>
            <text x='300' y='160' font-family='monospace' font-size='72' font-weight='black' fill='#22d3ee' text-anchor='middle' tracking='4px'>RED</text>
            <!-- Tactical Response Selection Triggers -->
            <g font-family='monospace' font-size='18' font-weight='black'>
                <rect x='60' y='240' width='105' height='50' rx='12' fill='#f43f5e'/><text x='112' y='271' fill='#000' text-anchor='middle'>RED</text>
                <rect x='185' y='240' width='105' height='50' rx='12' fill='#22d3ee' filter='drop-shadow(0 0 12px #22d3ee)'/><text x='237' y='271' fill='#000' text-anchor='middle'>BLUE</text>
                <rect x='310' y='240' width='105' height='50' rx='12' fill='#34d399'/><text x='362' y='271' fill='#000' text-anchor='middle'>GREEN</text>
                <rect x='435' y='240' width='105' height='50' rx='12' fill='#facc15'/><text x='487' y='271' fill='#000' text-anchor='middle'>YELLOW</text>
            </g>
        </svg>`
};

let modifiedCount = 0;

games = games.map(g => {
    if (uniqueThumbnails[g.id]) {
        const pristineUri = makeSvgUri(uniqueThumbnails[g.id]);
        modifiedCount++;
        return {
            ...g,
            thumbnail_url: pristineUri,
            thumbnail_svg: pristineUri
        };
    }
    return g;
});

fs.writeFileSync(masterCatalogPath, JSON.stringify(games, null, 2), 'utf8');

console.log(`◈ Overhauled exactly ${modifiedCount} asset entries in games.json with 100% unique custom inline SVG thumbnails.`);
