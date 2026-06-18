const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const virtualConsole = new VirtualConsole();
virtualConsole.on('log', (msg) => console.log('LOG:', msg));
virtualConsole.on('warn', (msg) => console.log('WARN:', msg));
virtualConsole.on('error', (msg) => console.error('ERR:', msg));
virtualConsole.on('jsdomError', (err) => console.error('JSDOM ERR:', err.message));

let rawHtml = fs.readFileSync(path.join(__dirname, 'arcade.html'), 'utf8');
const rawJs = fs.readFileSync(path.join(__dirname, 'portal.js'), 'utf8');

rawHtml = rawHtml.replace(/<script src="portal\.js.*?"><\/script>/, `<script>${rawJs}</script>`);

const dom = new JSDOM(rawHtml, {
    url: "https://ittybittybites.github.io/arcade.html",
    referrer: "https://ittybittybites.github.io/arcade.html",
    contentType: "text/html",
    runScripts: "dangerously",
    virtualConsole,
    resources: "usable"
});

setTimeout(() => {
    const window = dom.window;
    const portal = window.ArcadePortal;
    if (!portal) {
        console.error("❌ ArcadePortal instance not found!");
    } else {
        console.log("✅ ArcadePortal instance found!");
        console.log("Registry length:", portal.gamesRegistry?.length);
        const complexGrid = window.document.getElementById('complex-games-grid');
        const retroGrid = window.document.getElementById('retro-classics-grid');
        console.log("Complex Grid cards:", complexGrid?.children.length);
        console.log("Retro Grid cards:", retroGrid?.children.length);
    }
    process.exit(0);
}, 2000);