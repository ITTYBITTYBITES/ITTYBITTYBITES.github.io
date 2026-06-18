const fs = require('fs');
const path = require('path');

const BUILD_ENGINE_PATH = path.join(__dirname, 'build-engine.js');
const PERSONAS_PATH = path.join(__dirname, 'pipeline-data', 'personas.json');
const INTEL_DIR = path.join(__dirname, 'intel');

// 1. Lock build-engine.js
let be = fs.readFileSync(BUILD_ENGINE_PATH, 'utf8');
const mineHook = `function personaMiningEngine(currentPersonas) {`;
const lockedMineHook = `function personaMiningEngine(currentPersonas) {\n  if (CONFIG.maxNewPersonasPerRun <= 0) return currentPersonas;`;
if (!be.includes('if (CONFIG.maxNewPersonasPerRun <= 0)')) {
    be = be.replace(mineHook, lockedMineHook);
    fs.writeFileSync(BUILD_ENGINE_PATH, be, 'utf8');
    console.log("✓ Fully locked personaMiningEngine in build-engine.js");
}

// 2. Lock personas.json to exactly 16
const pData = JSON.parse(fs.readFileSync(PERSONAS_PATH, 'utf8'));
if (pData.personas.length > 16) {
    pData.personas = pData.personas.slice(0, 16);
    fs.writeFileSync(PERSONAS_PATH, JSON.stringify(pData, null, 2), 'utf8');
    console.log("✓ Fully locked personas.json back to exactly 16 entries");
}

// 3. Delete any HTML files for field-software-engineers
if (fs.existsSync(INTEL_DIR)) {
    const files = fs.readdirSync(INTEL_DIR);
    files.forEach(f => {
        if (f.includes('field-software-engineers')) {
            fs.unlinkSync(path.join(INTEL_DIR, f));
            console.log(`✓ Flushed: intel/${f}`);
        }
    });
}
