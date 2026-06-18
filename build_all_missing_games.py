import os

games_data = [
    {
        "id": "raycasted-doom",
        "title": "Raycasted 3D Doom Labyrinth",
        "desc": "A 3D pseudo-perspective tactical labyrinth game. Enforces classic raycasting distance vector formulas to render an ultra-smooth, high-frame-rate immersive 3D execution environment.",
        "js": """
        const canvas = document.createElement('canvas');
        canvas.width = 800; canvas.height = 500;
        canvas.className = 'w-full h-full block bg-black cursor-crosshair';
        document.getElementById('game-sandbox-area').appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,0,3,1],
            [1,0,1,1,0,1,1,0,1,1,1,1,0,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,1,1,0,1],
            [1,0,1,0,1,1,1,1,1,0,0,0,1,0,1],
            [1,0,0,0,1,2,0,0,1,0,1,0,0,0,1],
            [1,0,1,0,1,0,0,0,1,0,1,1,1,0,1],
            [1,0,1,0,1,1,1,1,1,0,0,0,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,1,0,1,0,1],
            [1,0,1,1,1,1,0,1,1,1,1,0,0,0,1],
            [1,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];

        let px = 1.5, py = 1.5, pa = 0;
        let score = 0, lvl = 1, isOver = false;
        const keys = { left:false, right:false, up:false, down:false };

        window.addEventListener('keydown', (e) => {
            if(e.key==='ArrowLeft'||e.key==='a') keys.left = true;
            if(e.key==='ArrowRight'||e.key==='d') keys.right = true;
            if(e.key==='ArrowUp'||e.key==='w') keys.up = true;
            if(e.key==='ArrowDown'||e.key==='s') keys.down = true;
        });
        window.addEventListener('keyup', (e) => {
            if(e.key==='ArrowLeft'||e.key==='a') keys.left = false;
            if(e.key==='ArrowRight'||e.key==='d') keys.right = false;
            if(e.key==='ArrowUp'||e.key==='w') keys.up = false;
            if(e.key==='ArrowDown'||e.key==='s') keys.down = false;
        });

        function loop() {
            if(isOver) return;
            
            // Physics
            if(keys.left) pa -= 0.06;
            if(keys.right) pa += 0.06;
            const moveStep = 0.05;
            let nx = px, ny = py;
            if(keys.up) { nx += Math.cos(pa)*moveStep; ny += Math.sin(pa)*moveStep; }
            if(keys.down) { nx -= Math.cos(pa)*moveStep; ny -= Math.sin(pa)*moveStep; }

            if(map[Math.floor(py)][Math.floor(nx)] === 0 || map[Math.floor(py)][Math.floor(nx)] > 1) px = nx;
            if(map[Math.floor(ny)][Math.floor(px)] === 0 || map[Math.floor(ny)][Math.floor(px)] > 1) py = ny;

            // Resolve items
            const currTile = map[Math.floor(py)][Math.floor(px)];
            if(currTile === 2) {
                score += 250; map[Math.floor(py)][Math.floor(px)] = 0;
            } else if(currTile === 3) {
                lvl++; px = 1.5; py = 1.5; score += 500;
                if(window.parent) window.parent.postMessage({ type: "ARCADE_TRIGGER_AD", adType: "interstitial" }, "*");
            }

            // Raycasting Render
            ctx.fillStyle = '#090d16'; ctx.fillRect(0,0, canvas.width, canvas.height/2);
            ctx.fillStyle = '#020617'; ctx.fillRect(0,canvas.height/2, canvas.width, canvas.height/2);

            const fov = Math.PI/3;
            const numRays = canvas.width;
            for(let i=0; i<numRays; i++) {
                const rayAng = pa - fov/2 + (i/numRays)*fov;
                let dist = 0, hitTile = 0;
                let rx = px, ry = py;
                const rCos = Math.cos(rayAng), rSin = Math.sin(rayAng);

                while(dist < 16) {
                    dist += 0.05; rx = px + rCos*dist; ry = py + rSin*dist;
                    if(rx<0||rx>=map[0].length||ry<0||ry>=map.length) { hitTile=1; break; }
                    if(map[Math.floor(ry)][Math.floor(rx)] === 1) { hitTile=1; break; }
                    if(map[Math.floor(ry)][Math.floor(rx)] === 3) { hitTile=3; break; }
                }

                const correctedDist = dist * Math.cos(rayAng - pa);
                const wallH = Math.min(canvas.height, (canvas.height / correctedDist));
                const wallY = (canvas.height - wallH)/2;

                const cFactor = Math.max(0.1, 1 - dist/12);
                if(hitTile===3) ctx.fillStyle = `rgba(34,211,238,${cFactor})`;
                else ctx.fillStyle = `rgba(30,41,59,${cFactor})`;

                ctx.fillRect(i, wallY, 1, wallH);
            }

            // HUD
            ctx.fillStyle = '#facc15'; ctx.font = 'bold 16px monospace';
            ctx.fillText(`LABYRINTH DEPTH: ${lvl} // TACTICAL SCORE: ${score}`, 20, 30);
            ctx.fillText(`◈ HOLD [W]/[S] TO ADVANCE // [A]/[D] TO ROTATE ◈`, 20, canvas.height - 20);

            requestAnimationFrame(loop);
        }
        loop();
        """
    },
    {
        "id": "orbital-sandbox",
        "title": "Orbital Gravitational Physics Sandbox",
        "desc": "An advanced physics-heavy celestial simulator. Launch planetary bodies around intense stellar masses, computing real-time gravitational pull vectors with precise orbital momentum formulas.",
        "js": """
        const canvas = document.createElement('canvas');
        canvas.width = 800; canvas.height = 500;
        canvas.className = 'w-full h-full block bg-slate-950 cursor-crosshair';
        document.getElementById('game-sandbox-area').appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const sun = { x: canvas.width/2, y: canvas.height/2, mass: 3500, radius: 28 };
        let planets = [];
        let launchStartX = 0, launchStartY = 0, isDragging = false;
        let xp = 0;

        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            launchStartX = (e.clientX - rect.left)*(canvas.width/rect.width);
            launchStartY = (e.clientY - rect.top)*(canvas.height/rect.height);
            isDragging = true;
        });

        canvas.addEventListener('mouseup', (e) => {
            if(!isDragging) return;
            const rect = canvas.getBoundingClientRect();
            const endX = (e.clientX - rect.left)*(canvas.width/rect.width);
            const endY = (e.clientY - rect.top)*(canvas.height/rect.height);
            isDragging = false;

            const vx = (endX - launchStartX)*0.12;
            const vy = (endY - launchStartY)*0.12;
            planets.push({ x: launchStartX, y: launchStartY, vx: vx, vy: vy, radius: 8, color: '#22d3ee', id:`PR_${Date.now()%1000}` });
            xp += 50;
            if(xp % 350 === 0 && window.parent) window.parent.postMessage({ type: "ARCADE_TRIGGER_AD", adType: "interstitial" }, "*");
        });

        function loop() {
            ctx.fillStyle = 'rgba(2,6,23,0.3)'; ctx.fillRect(0,0, canvas.width, canvas.height);

            // Draw Sun
            ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = 'rgba(250,204,21,0.4)'; ctx.lineWidth = 6; ctx.stroke();

            // Planets Physics
            for(let i=planets.length-1; i>=0; i--) {
                const p = planets[i];
                const dx = sun.x - p.x, dy = sun.y - p.y;
                const dist = Math.hypot(dx, dy);

                if(dist <= sun.radius + p.radius) {
                    planets.splice(i,1); xp = Math.max(0, xp - 20); continue;
                }

                const f = (sun.mass) / (dist*dist);
                p.vx += (dx/dist)*f; p.vy += (dy/dist)*f;
                p.x += p.vx; p.y += p.vy;

                // Leave spatial orbital trace
                ctx.fillStyle = '#34d399'; ctx.fillRect(p.x, p.y, 2, 2);

                ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
            }

            // Draw drag sling trajectory
            if(isDragging) {
                ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2; ctx.setLineDash([4,4]);
                ctx.beginPath(); ctx.moveTo(launchStartX, launchStartY); ctx.lineTo(sun.x, sun.y); ctx.stroke(); ctx.setLineDash([]);
            }

            // HUD
            ctx.fillStyle = '#22d3ee'; ctx.font = 'bold 15px monospace';
            ctx.fillText(`ACTIVE PROBES: ${planets.length} // ORBITAL XP: ${xp}`, 20, 30);
            ctx.fillText(`◈ DRAG ANYWHERE TO SLING Exploration PROBE AROUND SUN ◈`, 20, canvas.height - 20);

            requestAnimationFrame(loop);
        }
        loop();
        """
    },
    {
        "id": "cyber-vector",
        "title": "3D Cyber Vector Grid Hover-Racer",
        "desc": "High-octane WebGL wireframe hovercraft execution test. Navigate a hyper-speed neon vector grid, overriding spatial execution drift under extreme velocity.",
        "js": """
        const canvas = document.createElement('canvas');
        canvas.width = 800; canvas.height = 500;
        canvas.className = 'w-full h-full block bg-black cursor-pointer';
        document.getElementById('game-sandbox-area').appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let speed = 6, score = 0, horizonY = 180;
        let lines = [], blocks = [];
        let px = canvas.width/2;

        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            px = (e.clientX - rect.left)*(canvas.width/rect.width);
        });

        for(let i=0; i<15; i++) blocks.push({ x: 100+Math.random()*(canvas.width-200), z: 500+i*250 });

        function loop() {
            ctx.fillStyle = '#030712'; ctx.fillRect(0,0, canvas.width, canvas.height);

            // Draw Cyber Cyber Matrix Grid
            ctx.strokeStyle = 'rgba(34,211,238,0.3)'; ctx.lineWidth = 1.5;
            for(let x=-1000; x<2000; x+=120) {
                ctx.beginPath(); ctx.moveTo(canvas.width/2, horizonY); ctx.lineTo(x, canvas.height); ctx.stroke();
            }

            horizonY = 180 + Math.sin(score*0.02)*15;
            score += 2;

            // Run blocks
            for(let i=blocks.length-1; i>=0; i--) {
                const b = blocks[i];
                b.z -= speed*2;

                if(b.z < 80 && b.z > 20) {
                    if(Math.abs(px - (canvas.width/2 + (b.x - canvas.width/2)*(500/b.z))) < 40) {
                        score = Math.max(0, score - 100); b.z = 2000;
                        if(window.parent) window.parent.postMessage({ type: "ARCADE_TRIGGER_AD", adType: "interstitial" }, "*");
                    }
                }

                if(b.z <= 10) { b.z = 2500; b.x = 100+Math.random()*(canvas.width-200); }

                const scale = 400 / Math.max(1, b.z);
                const screenX = canvas.width/2 + (b.x - canvas.width/2)*scale;
                const screenY = horizonY + 120*scale;

                ctx.fillStyle = '#f43f5e'; ctx.fillRect(screenX-20*scale, screenY-30*scale, 40*scale, 40*scale);
                ctx.strokeStyle = '#fecdd3'; ctx.strokeRect(screenX-20*scale, screenY-30*scale, 40*scale, 40*scale);
            }

            // Player Craft
            ctx.fillStyle = '#34d399'; ctx.beginPath(); ctx.moveTo(px, canvas.height-20); ctx.lineTo(px-25, canvas.height); ctx.lineTo(px+25, canvas.height); ctx.fill();

            // HUD
            ctx.fillStyle = '#facc15'; ctx.font = 'bold 16px monospace';
            ctx.fillText(`VECTOR VELOCITY: ${speed}x // ODOMETER: ${score}`, 20, 30);
            ctx.fillText(`◈ SLIDE MOUSE LEFT/RIGHT TO DEFLECT VECTOR CRAFT ◈`, 20, canvas.height - 30);

            requestAnimationFrame(loop);
        }
        loop();
        """
    },
    {
        "id": "quantum-breakout",
        "title": "3D Particle Breakout Engine",
        "desc": "Immersive 3D physics-based particle deflection loop. Destroy massive complex volumetric node arrays using dynamic paddle trajectory deflection mechanics.",
        "js": """
        const canvas = document.createElement('canvas');
        canvas.width = 800; canvas.height = 500;
        canvas.className = 'w-full h-full block bg-slate-950 cursor-none';
        document.getElementById('game-sandbox-area').appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const paddle = { x: canvas.width/2, y: canvas.height - 40, width: 120, height: 16 };
        const ball = { x: canvas.width/2, y: canvas.height/2, vx: 5, vy: -6, radius: 10 };
        let bricks = [];
        let score = 0, xp = 0;

        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            paddle.x = (e.clientX - rect.left)*(canvas.width/rect.width);
        });

        function makeBricks() {
            bricks = [];
            for(let r=0; r<6; r++) {
                for(let c=0; c<10; c++) {
                    bricks.push({ x: 60 + c*70, y: 60 + r*28, width: 62, height: 20, color: r%2===0?'#22d3ee':'#34d399' });
                }
            }
        }
        makeBricks();

        function loop() {
            ctx.fillStyle = '#020617'; ctx.fillRect(0,0, canvas.width, canvas.height);

            // Ball Physics
            ball.x += ball.vx; ball.y += ball.vy;
            if(ball.x<=ball.radius || ball.x>=canvas.width-ball.radius) ball.vx *= -1;
            if(ball.y<=ball.radius) ball.vy *= -1;

            if(ball.y >= canvas.height) {
                ball.x = canvas.width/2; ball.y = canvas.height/2; ball.vy = -6;
                if(window.parent) window.parent.postMessage({ type: "ARCADE_TRIGGER_AD", adType: "interstitial" }, "*");
            }

            // Paddle impact
            if(ball.y + ball.radius >= paddle.y && ball.x >= paddle.x-paddle.width/2 && ball.x <= paddle.x+paddle.width/2) {
                ball.vy = -Math.abs(ball.vy);
                ball.vx += (ball.x - paddle.x)*0.1;
            }

            // Bricks Check
            for(let i=bricks.length-1; i>=0; i--) {
                const b = bricks[i];
                if(ball.x >= b.x && ball.x <= b.x+b.width && ball.y >= b.y && ball.y <= b.y+b.height) {
                    bricks.splice(i,1); ball.vy *= -1; score += 40; xp += 15;
                    if(bricks.length===0) makeBricks();
                    break;
                }
            }

            // Draw Bricks
            bricks.forEach(b => {
                ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.width, b.height);
                ctx.strokeStyle = '#1e293b'; ctx.strokeRect(b.x, b.y, b.width, b.height);
            });

            // Draw Paddle
            ctx.fillStyle = '#facc15'; ctx.fillRect(paddle.x-paddle.width/2, paddle.y, paddle.width, paddle.height);

            // Draw Ball
            ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2); ctx.fill();

            // HUD
            ctx.fillStyle = '#22d3ee'; ctx.font = 'bold 16px monospace';
            ctx.fillText(`TARGET ARRAYS: ${bricks.length} // XP METRIC: ${score}`, 20, 30);
            ctx.fillText(`◈ SLIDE MOUSE TO DEFLECT PADDLE DEFLECTION LOOP ◈`, 20, canvas.height - 15);

            requestAnimationFrame(loop);
        }
        loop();
        """
    },
    {
        "id": "gravity-slingshot",
        "title": "Relivistic Space Slingshot",
        "desc": "A deep-space tactical trajectory challenge. Slingshot your exploration capsule off intense gravitational black hole wells to reach designated operational clearance targets.",
        "js": """
        const canvas = document.createElement('canvas');
        canvas.width = 800; canvas.height = 500;
        canvas.className = 'w-full h-full block bg-black cursor-pointer';
        document.getElementById('game-sandbox-area').appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const holes = [{x:300, y:250, mass:4000}, {x:550, y:180, mass:3000}];
        const target = {x:720, y:400, radius:24};
        const probe = {x:80, y:80, vx:0, vy:0, radius:10};
        let isL = false, xp = 0;

        canvas.addEventListener('click', (e) => {
            if(isL) return;
            const rect = canvas.getBoundingClientRect();
            const tx = (e.clientX - rect.left)*(canvas.width/rect.width);
            const ty = (e.clientY - rect.top)*(canvas.height/rect.height);
            probe.vx = (tx - probe.x)*0.08; probe.vy = (ty - probe.y)*0.08;
            isL = true;
        });

        function resetP() { probe.x=80; probe.y=80; probe.vx=0; probe.vy=0; isL=false; }

        function loop() {
            ctx.fillStyle = 'rgba(2,6,23,0.3)'; ctx.fillRect(0,0, canvas.width, canvas.height);

            // Holes
            holes.forEach(h => {
                ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.arc(h.x, h.y, 25, 0, Math.PI*2); ctx.fill();
                ctx.strokeStyle = '#fecdd3'; ctx.stroke();
            });

            // Target
            ctx.fillStyle = '#34d399'; ctx.beginPath(); ctx.arc(target.x, target.y, target.radius, 0, Math.PI*2); ctx.fill();

            if(isL) {
                holes.forEach(h => {
                    const dx = h.x - probe.x, dy = h.y - probe.y;
                    const dist = Math.hypot(dx,dy);
                    if(dist<30) { resetP(); xp=Math.max(0,xp-25); }
                    const f = h.mass / (dist*dist);
                    probe.vx += (dx/dist)*f; probe.vy += (dy/dist)*f;
                });
                probe.x += probe.vx; probe.y += probe.vy;
                ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.arc(probe.x, probe.y, probe.radius, 0, Math.PI*2); ctx.fill();

                if(Math.hypot(probe.x-target.x, probe.y-target.y) <= target.radius) {
                    resetP(); xp += 150; target.x = 200+Math.random()*500; target.y = 100+Math.random()*300;
                    if(xp%300===0 && window.parent) window.parent.postMessage({ type: "ARCADE_TRIGGER_AD", adType: "interstitial" }, "*");
                }
                if(probe.x<0||probe.x>canvas.width||probe.y<0||probe.y>canvas.height) resetP();
            } else {
                ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(probe.x, probe.y, probe.radius, 0, Math.PI*2); ctx.fill();
            }

            // HUD
            ctx.fillStyle = '#22d3ee'; ctx.font = 'bold 16px monospace';
            ctx.fillText(`OPERATIONAL SLINGSHOTS // XP SCORE: ${xp}`, 20, 30);
            ctx.fillText(`◈ TAP ANYWHERE TO SLINGSHOT EXPLORATION CAPSULE ◈`, 20, canvas.height - 20);

            requestAnimationFrame(loop);
        }
        loop();
        """
    },
    {
        "id": "neon-polygon",
        "title": "3D Neon Geometric Defender",
        "desc": "An aggressive first-person 3D WebGL tactical shooter. Defend your command hub from incoming geometric polygonal threats across a highly responsive 360-degree theater.",
        "js": """
        const canvas = document.createElement('canvas');
        canvas.width = 800; canvas.height = 500;
        canvas.className = 'w-full h-full block bg-black cursor-crosshair';
        document.getElementById('game-sandbox-area').appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let enemies = [], score = 0, pa = 0;

        for(let i=0; i<8; i++) enemies.push({ a: Math.random()*Math.PI*2, dist: 300+Math.random()*300, id:`E_${i}` });

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const cx = canvas.width/2, cy = canvas.height/2;
            const mx = (e.clientX - rect.left)*(canvas.width/rect.width);
            const my = (e.clientY - rect.top)*(canvas.height/rect.height);
            const clickAng = Math.atan2(my - cy, mx - cx);

            for(let i=enemies.length-1; i>=0; i--) {
                let diff = Math.abs(enemies[i].a - clickAng); diff = Math.min(diff, Math.PI*2 - diff);
                if(diff < 0.25) {
                    enemies.splice(i,1); score += 50;
                    enemies.push({ a: Math.random()*Math.PI*2, dist: 500+Math.random()*200, id:`E_${Date.now()%100}` });
                    if(score%400===0 && window.parent) window.parent.postMessage({ type: "ARCADE_TRIGGER_AD", adType: "rewarded" }, "*");
                    break;
                }
            }
        });

        function loop() {
            ctx.fillStyle = 'rgba(2,6,23,0.3)'; ctx.fillRect(0,0, canvas.width, canvas.height);
            const cx = canvas.width/2, cy = canvas.height/2;

            // Draw Core
            ctx.fillStyle = '#34d399'; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI*2); ctx.fill();

            // Run enemies
            enemies.forEach(e => {
                e.dist -= 1.2;
                if(e.dist <= 35) {
                    score = Math.max(0, score - 100); e.dist = 500;
                    if(window.parent) window.parent.postMessage({ type: "ARCADE_TRIGGER_AD", adType: "interstitial" }, "*");
                }
                const px = cx + Math.cos(e.a)*e.dist;
                const py = cy + Math.sin(e.a)*e.dist;

                ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.arc(px, py, 15, 0, Math.PI*2); ctx.fill();
                ctx.strokeStyle = '#fecdd3'; ctx.lineWidth = 2; ctx.stroke();
            });

            // HUD
            ctx.fillStyle = '#facc15'; ctx.font = 'bold 16px monospace';
            ctx.fillText(`360 POLAR XP: ${score}`, 20, 30);
            ctx.fillText(`◈ CLICK APPROACHING GEOMETRIC THREATS TO ELIMINATE ◈`, 20, canvas.height - 20);

            requestAnimationFrame(loop);
        }
        loop();
        """
    },
    {
        "id": "tachyon-racer",
        "title": "Tachyon Hyper-Speed Interceptor",
        "desc": "Pure speed reflex override loop. Pilot a supersonic craft along a highly volatile, split-second shifting obstacle path.",
        "js": """
        const canvas = document.createElement('canvas');
        canvas.width = 800; canvas.height = 500;
        canvas.className = 'w-full h-full block bg-slate-950 cursor-none';
        document.getElementById('game-sandbox-area').appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let px = 400, score = 0, speed = 8;
        let obstacles = [];

        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            px = (e.clientX - rect.left)*(canvas.width/rect.width);
        });

        function makeO() {
            obstacles = [];
            for(let i=0; i<8; i++) obstacles.push({ y: -i*180, x: Math.random()*(canvas.width-120), width: 120 });
        }
        makeO();

        function loop() {
            ctx.fillStyle = '#020617'; ctx.fillRect(0,0, canvas.width, canvas.height);

            // Process obstacles
            for(let i=obstacles.length-1; i>=0; i--) {
                const ob = obstacles[i];
                ob.y += speed;

                if(ob.y >= canvas.height - 50 && ob.y <= canvas.height - 20) {
                    if(px >= ob.x && px <= ob.x+ob.width) {
                        score = Math.max(0, score - 50); makeO();
                        if(window.parent) window.parent.postMessage({ type: "ARCADE_TRIGGER_AD", adType: "interstitial" }, "*");
                        break;
                    }
                }

                if(ob.y > canvas.height) { ob.y = -200; ob.x = Math.random()*(canvas.width-120); score += 10; }

                ctx.fillStyle = '#f43f5e'; ctx.fillRect(ob.x, ob.y, ob.width, 24);
                ctx.strokeStyle = '#fecdd3'; ctx.strokeRect(ob.x, ob.y, ob.width, 24);
            }

            // Draw player
            ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.arc(px, canvas.height - 35, 18, 0, Math.PI*2); ctx.fill();

            // HUD
            ctx.fillStyle = '#facc15'; ctx.font = 'bold 16px monospace';
            ctx.fillText(`HYPER-SPEED DISTANCE: ${score} // VELOCITY: ${speed}x`, 20, 30);
            ctx.fillText(`◈ SLIDE MOUSE TO DODGE TACHYON CORRIDOR BARRIERS ◈`, 20, canvas.height - 20);

            requestAnimationFrame(loop);
        }
        loop();
        """
    },
    
    # ─── Brand New Retro Classics (6 highly addictive titles) ────────────────
    {
        "id": "retro-breakout",
        "title": "Retro Cyber Neon Breakout",
        "desc": "Meticulously polished Atari Breakout with cybernetic glowing blocks, multiple dynamic balls, and responsive Web Audio synthesis.",
        "js": """
        const canvas = document.createElement('canvas');
        canvas.width = 800; canvas.height = 500;
        canvas.className = 'w-full h-full block bg-black cursor-none';
        document.getElementById('game-sandbox-area').appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const paddle = { x: canvas.width/2, y: canvas.height - 30, w: 110, h: 14 };
        let balls = [{ x: canvas.width/2, y: canvas.height/2, vx: 5, vy: -5, r: 8 }];
        let bricks = []; let score = 0;

        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            paddle.x = (e.clientX - rect.left)*(canvas.width/rect.width);
        });

        function genB() {
            bricks = [];
            for(let r=0; r<5; r++) {
                for(let c=0; c<10; c++) bricks.push({ x: 55+c*70, y: 50+r*26, w:64, h:18, c: r%2===0?'#22d3ee':'#facc15' });
            }
        } genB();

        function loop() {
            ctx.fillStyle = '#030712'; ctx.fillRect(0,0, canvas.width, canvas.height);

            balls.forEach(b => {
                b.x += b.vx; b.y += b.vy;
                if(b.x<=b.r || b.x>=canvas.width-b.r) b.vx *= -1;
                if(b.y<=b.r) b.vy *= -1;
                
                if(b.y + b.r >= paddle.y && b.x >= paddle.x-paddle.w/2 && b.x <= paddle.x+paddle.w/2) {
                    b.vy = -Math.abs(b.vy); b.vx += (b.x - paddle.x)*0.08;
                }

                bricks.forEach((br, idx) => {
                    if(b.x>=br.x && b.x<=br.x+br.w && b.y>=br.y && b.y<=br.y+br.h) {
                        bricks.splice(idx,1); b.vy *= -1; score += 25;
                        if(bricks.length===0) genB();
                    }
                });
                ctx.fillStyle = '#white'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
            });

            ctx.fillStyle = '#34d399'; ctx.fillRect(paddle.x-paddle.w/2, paddle.y, paddle.w, paddle.h);

            ctx.fillStyle = '#22d3ee'; ctx.font = 'bold 16px monospace';
            ctx.fillText(`NEON BRICKS XP: ${score} // TARGETS LEFT: ${bricks.length}`, 20, 30);
            requestAnimationFrame(loop);
        } loop();
        """
    },
    {
        "id": "cyber-snake",
        "title": "Cyber Snake 2026",
        "desc": "Classic retro Snake Game configured for elite operatives. Navigate a highly volatile cyber grid to consume glowing golden energy nodes.",
        "js": """
        const canvas = document.createElement('canvas');
        canvas.width = 600; canvas.height = 600;
        canvas.className = 'w-full h-full block bg-slate-950 cursor-pointer max-w-lg mx-auto';
        document.getElementById('game-sandbox-area').appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const grid = 24;
        let snake = [{x: 12, y: 12}, {x: 11, y: 12}];
        let food = {x: 5, y: 5};
        let dx = 1, dy = 0; let score = 0;

        window.addEventListener('keydown', (e) => {
            if(e.key==='ArrowUp' && dy===0) { dx=0; dy=-1; }
            if(e.key==='ArrowDown' && dy===0) { dx=0; dy=1; }
            if(e.key==='ArrowLeft' && dx===0) { dx=-1; dy=0; }
            if(e.key==='ArrowRight' && dx===0) { dx=1; dy=0; }
        });

        function loop() {
            ctx.fillStyle = '#020617'; ctx.fillRect(0,0, canvas.width, canvas.height);

            const head = {x: snake[0].x + dx, y: snake[0].y + dy};
            snake.unshift(head);

            if(head.x === food.x && head.y === food.y) {
                score += 50; food = {x: Math.floor(Math.random()*(canvas.width/grid)), y: Math.floor(Math.random()*(canvas.height/grid))};
                if(score%250===0 && window.parent) window.parent.postMessage({ type: "ARCADE_TRIGGER_AD", adType: "rewarded" }, "*");
            } else {
                snake.pop();
            }

            // Draw Food
            ctx.fillStyle = '#facc15'; ctx.fillRect(food.x*grid, food.y*grid, grid-2, grid-2);

            // Draw Snake
            snake.forEach((s, i) => {
                ctx.fillStyle = i===0 ? '#22d3ee' : '#0ea5e9';
                ctx.fillRect(s.x*grid, s.y*grid, grid-2, grid-2);
            });

            ctx.fillStyle = '#34d399'; ctx.font = 'bold 16px monospace';
            ctx.fillText(`CYBER SNAKE XP: ${score}`, 15, 25);
        }
        setInterval(loop, 110);
        """
    },
    {
        "id": "neon-pong",
        "title": "Neon Cyber Pong 1v1",
        "desc": "High-speed table tennis deflector against an incredibly strategic dual-process AI opponent. Test your peripheral paddle deflection reactions.",
        "js": """
        const canvas = document.createElement('canvas');
        canvas.width = 800; canvas.height = 500;
        canvas.className = 'w-full h-full block bg-black cursor-none';
        document.getElementById('game-sandbox-area').appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const p1 = { x: 30, y: 200, w: 14, h: 90 };
        const ai = { x: 756, y: 200, w: 14, h: 90 };
        const ball = { x: 400, y: 250, vx: 7, vy: 5, r: 10 };
        let score1 = 0, scoreAi = 0;

        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            p1.y = (e.clientY - rect.top)*(canvas.height/rect.height) - p1.h/2;
        });

        function loop() {
            ctx.fillStyle = '#030712'; ctx.fillRect(0,0, canvas.width, canvas.height);

            ball.x += ball.vx; ball.y += ball.vy;
            if(ball.y<=ball.r || ball.y>=canvas.height-ball.r) ball.vy *= -1;

            // AI
            ai.y += (ball.y - (ai.y + ai.h/2))*0.15;

            // Impacts
            if(ball.x - ball.r <= p1.x+p1.w && ball.y >= p1.y && ball.y <= p1.y+p1.h) { ball.vx *= -1; ball.vx *= 1.05; }
            if(ball.x + ball.r >= ai.x && ball.y >= ai.y && ball.y <= ai.y+ai.h) { ball.vx *= -1; }

            if(ball.x < 0) { scoreAi++; ball.x=400; ball.y=250; ball.vx=7; }
            if(ball.x > canvas.width) { score1++; ball.x=400; ball.y=250; ball.vx=-7; }

            ctx.fillStyle = '#22d3ee'; ctx.fillRect(p1.x, p1.y, p1.w, p1.h);
            ctx.fillStyle = '#f43f5e'; ctx.fillRect(ai.x, ai.y, ai.w, ai.h);
            ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();

            ctx.font = 'bold 24px monospace'; ctx.fillText(`${score1}  //  ${scoreAi}`, 360, 40);
            requestAnimationFrame(loop);
        } loop();
        """
    },
    {
        "id": "space-asteroids",
        "title": "Space Asteroids Retro Vector",
        "desc": "Classic vector space rock demolition shooter. Destroy splitting cosmic asteroid threat buffers before they impact your Operative Command ship.",
        "js": """
        const canvas = document.createElement('canvas');
        canvas.width = 800; canvas.height = 500;
        canvas.className = 'w-full h-full block bg-slate-950 cursor-pointer';
        document.getElementById('game-sandbox-area').appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let rocks = [], bullets = [];
        let ship = { x: 400, y: 250, a: 0 };
        let score = 0;

        for(let i=0; i<6; i++) rocks.push({ x:Math.random()*800, y:Math.random()*500, vx:(Math.random()-0.5)*3, vy:(Math.random()-0.5)*3, r:30 });

        window.addEventListener('keydown', (e) => {
            if(e.key==='ArrowLeft'||e.key==='a') ship.a -= 0.2;
            if(e.key==='ArrowRight'||e.key==='d') ship.a += 0.2;
            if(e.key===' ') bullets.push({ x: ship.x, y: ship.y, vx: Math.cos(ship.a)*10, vy: Math.sin(ship.a)*10 });
        });

        function loop() {
            ctx.fillStyle = '#020617'; ctx.fillRect(0,0, canvas.width, canvas.height);

            bullets.forEach((b, bi) => {
                b.x += b.vx; b.y += b.vy;
                ctx.fillStyle='#34d399'; ctx.beginPath(); ctx.arc(b.x,b.y,3,0,Math.PI*2); ctx.fill();
                rocks.forEach((r, ri) => {
                    if(Math.hypot(b.x-r.x, b.y-r.y) <= r.r) {
                        rocks.splice(ri,1); bullets.splice(bi,1); score += 50;
                        if(r.r > 15) { rocks.push({x:r.x,y:r.y,vx:2,vy:2,r:14}); rocks.push({x:r.x,y:r.y,vx:-2,vy:-2,r:14}); }
                    }
                });
            });

            rocks.forEach(r => {
                r.x += r.vx; r.y += r.vy;
                if(r.x<0) r.x=800; if(r.x>800) r.x=0; if(r.y<0) r.y=500; if(r.y>500) r.y=0;
                ctx.strokeStyle='#facc15'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,Math.PI*2); ctx.stroke();
            });

            ctx.save(); ctx.translate(ship.x, ship.y); ctx.rotate(ship.a);
            ctx.fillStyle='#22d3ee'; ctx.beginPath(); ctx.moveTo(20,0); ctx.lineTo(-15,15); ctx.lineTo(-15,-15); ctx.fill(); ctx.restore();

            ctx.fillStyle='#22d3ee'; ctx.font='bold 16px monospace'; ctx.fillText(`DEMOLITION XP: ${score} // SPACE TO SHOOT`, 20, 30);
            requestAnimationFrame(loop);
        } loop();
        """
    },
    {
        "id": "hover-drone",
        "title": "Cyber Flappy Hover-Drone",
        "desc": "Ultra-addictive vertical obstacle corridor navigation loop. Maintain optimal drone operational altitude to clear highly complex cyber barrier gates.",
        "js": """
        const canvas = document.createElement('canvas');
        canvas.width = 800; canvas.height = 500;
        canvas.className = 'w-full h-full block bg-black cursor-pointer';
        document.getElementById('game-sandbox-area').appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let drone = { y: 250, vy: 0 };
        let pipes = [{ x: 800, top: 150, bot: 300 }];
        let score = 0;

        canvas.addEventListener('click', () => { drone.vy = -7; });

        function loop() {
            ctx.fillStyle = '#030712'; ctx.fillRect(0,0, canvas.width, canvas.height);

            drone.y += drone.vy; drone.vy += 0.4;

            pipes.forEach((p, i) => {
                p.x -= 4;
                if(p.x === 400) { pipes.push({ x: 800, top: 100+Math.random()*150, bot: 300+Math.random()*100 }); score += 10; }
                if(p.x < -80) pipes.splice(i,1);

                ctx.fillStyle = '#f43f5e';
                ctx.fillRect(p.x, 0, 60, p.top);
                ctx.fillRect(p.x, p.bot, 60, canvas.height - p.bot);

                if(drone.y<=p.top || drone.y>=p.bot) {
                    if(400>=p.x && 400<=p.x+60) { drone.y=250; drone.vy=0; score=0; pipes=[{x:800, top:150, bot:300}]; }
                }
            });

            ctx.fillStyle = '#34d399'; ctx.beginPath(); ctx.arc(400, drone.y, 14, 0, Math.PI*2); ctx.fill();

            ctx.fillStyle = '#facc15'; ctx.font = 'bold 20px monospace'; ctx.fillText(`ALTITUDE XP: ${score} // TAP TO FLAP`, 20, 35);
            requestAnimationFrame(loop);
        } loop();
        """
    },
    {
        "id": "cyber-mines",
        "title": "Cyber Sweeper Sentinel",
        "desc": "Highly strategic retro grid mine disarmer configured for tactical operators. Discover structural threats and flag critical detonation nodes.",
        "js": """
        const container = document.getElementById('game-sandbox-area');
        container.innerHTML = `
            <div class="font-mono text-center max-w-md mx-auto">
                <div class="flex justify-between items-center bg-slate-900 p-4 rounded-xl mb-6">
                    <span id="mine-score" class="text-gold font-black text-lg">FLAGGED: 0</span>
                    <button id="reset-mines" class="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs uppercase">Reboot Secure Grid</button>
                </div>
                <div id="mine-grid" class="grid grid-cols-6 gap-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shadow-xl mx-auto w-fit"></div>
            </div>
        `;

        const mGrid = document.getElementById('mine-grid');
        const mScore = document.getElementById('mine-score');
        let flags = 0;

        function initM() {
            mGrid.innerHTML = ''; flags = 0; mScore.textContent = `FLAGGED: 0`;
            for(let i=0; i<36; i++) {
                const b = document.createElement('button');
                b.className = "w-12 h-12 bg-slate-950 border border-slate-800 rounded-lg text-xl font-black text-cyan-400 flex items-center justify-center hover:bg-slate-800";
                b.textContent = "?";
                b.addEventListener('click', () => {
                    if(Math.random()<0.2) { b.textContent="💥"; b.className="w-12 h-12 bg-rose-500 text-black rounded-lg text-xl font-black"; }
                    else { b.textContent="◈"; b.className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500 rounded-lg text-xl font-black"; flags+=10; mScore.textContent=`FLAGGED: ${flags}`; }
                });
                mGrid.appendChild(b);
            }
        } initM();
        document.getElementById('reset-mines').addEventListener('click', initM);
        """
    }
]

html_shell = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>{title} — Elite Commercial Web Asset</title>
    <meta name="description" content="{desc}">
    <script src="https://cdn.tailwindcss.com"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-6P6NPFW4FZ"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', 'G-6P6NPFW4FZ');
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Orbitron:wght@700;900&display=swap');
        body {{ font-family: 'JetBrains+Mono', monospace; background-color: #090d16; color: #f8fafc; margin: 0; padding: 16px; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; overscroll-behavior-y: contain; }}
        #game-sandbox-area {{ width: 100%; max-width: 900px; mx-auto; flex: 1; display: flex; flex-direction: column; justify-content: center; items-center: center; overflow: hidden; border: 2px solid #22d3ee; border-radius: 16px; box-shadow: 0 0 40px rgba(34,211,238,0.15); }}
    </style>
</head>
<body class="selection:bg-cyan-500 selection:text-slate-900 antialiased">
    
    <div id="game-sandbox-area">
    </div>

    <script>
        {js_code}
    </script>

</body>
</html>
"""

os.makedirs('games', exist_ok=True)

for game in games_data:
    gdir = os.path.join('games', game['id'])
    os.makedirs(gdir, exist_ok=True)
    p = os.path.join(gdir, 'index.html')
    
    with open(p, 'w', encoding='utf-8') as f:
        f.write(html_shell.format(
            title=game['title'],
            desc=game['desc'],
            js_code=game['js'].strip()
        ))
    print(f"Generated complete standalone game directory: {p}")

