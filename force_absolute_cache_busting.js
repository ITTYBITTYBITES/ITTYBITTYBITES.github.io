const fs = require('fs');
const path = require('path');

const stamp = `v=202606182304`;

const guardSnippet = `    <!-- Absolute Browser Cache Invalidation Guard -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <script>
        (function() {
            const v = localStorage.getItem('master_deployment_version');
            const target = '${stamp}';
            if (v !== target) {
                localStorage.setItem('master_deployment_version', target);
                if (window.caches) { caches.keys().then(n => n.forEach(c => caches.delete(c))); }
                window.location.reload(true);
            }
        })();
    </script>`;

function upgradeFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    const orig = content;

    // Upgrade resource links
    content = content.replace(/portal\.js.*?["']/g, `portal.js?v=202606182304"`);
    content = content.replace(/style\.css.*?["']/g, `style.css?v=202606182304"`);

    // Add Guard to HTML head
    if (filePath.endsWith('.html') && !content.includes('master_deployment_version')) {
        content = content.replace('</head>', `${guardSnippet}\n</head>`);
    }

    if (content !== orig) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Upgraded cache-busting on: ${filePath}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                processDirectory(full);
            }
        } else if (file.endsWith('.html') || file.endsWith('.js')) {
            upgradeFile(full);
        }
    });
}

console.log("🚀 Overhauling entire repository with absolute cache busting markers...");
processDirectory(__dirname);
