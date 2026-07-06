
// Chronicle Spatial Field – reads /data/worlds.json – renders zoomable field
(async function(){
  const res = await fetch('data/worlds.json').catch(()=>null);
  if(!res||!res.ok) return;
  const data = await res.json();
  const worlds = data.worlds||[];
  const canvas = document.getElementById('fieldCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = canvas.clientWidth; canvas.height = 520; }
  resize(); window.addEventListener('resize', resize);
  let zoom=1, ox=0, oy=0, drag=false, lx=0, ly=0;
  canvas.addEventListener('wheel', e=>{ e.preventDefault(); const d = Math.sign(e.deltaY)*-0.1; zoom = Math.min(4, Math.max(0.4, zoom*(1+d))); }, {passive:false});
  canvas.addEventListener('mousedown', e=>{drag=true; lx=e.clientX; ly=e.clientY});
  window.addEventListener('mouseup', ()=>drag=false);
  window.addEventListener('mousemove', e=>{ if(!drag) return; ox += (e.clientX-lx)/zoom; oy += (e.clientY-ly)/zoom; lx=e.clientX; ly=e.clientY; });
  function toScreen(fx,fy){ const cx=canvas.width/2, cy=canvas.height/2; return [cx+(fx*220+ox)*zoom, cy+(fy*220+oy)*zoom]; }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // grid
    ctx.strokeStyle='rgba(0,242,254,0.07)'; ctx.lineWidth=1;
    for(let x=-2000;x<2000;x+=60){ const [sx1,sy1]=toScreen(x/220,-8); const [sx2,sy2]=toScreen(x/220,8); ctx.beginPath(); ctx.moveTo(sx1,0); ctx.lineTo(sx1,canvas.height); ctx.stroke();}
    for(let y=-2000;y<2000;y+=60){ const [,sy]=toScreen(0,y/220); ctx.beginPath(); ctx.moveTo(0,sy); ctx.lineTo(canvas.width,sy); ctx.stroke();}
    // fields
    worlds.forEach(w=>{
      const e=w.embodiment||{}; const fc=e.field_coordinates||{x:0,y:0,z:0};
      const [sx, sy] = toScreen(fc.x, fc.y);
      const r = Math.max(12, (e.field_radius||0.8)*34*zoom);
      const grd = ctx.createRadialGradient(sx,sy,4,sx,sy,r);
      const intensity = e.intensity||0.5;
      grd.addColorStop(0, `rgba(0,242,254,${0.15+intensity*0.35})`);
      grd.addColorStop(1, 'rgba(0,242,254,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
      // core
      ctx.fillStyle = '#00f2fe';
      ctx.beginPath(); ctx.arc(sx,sy,4,0,Math.PI*2); ctx.fill();
      // label
      ctx.fillStyle = '#cfefff';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(w.id, sx+8, sy-6);
      // drift vector hint
      const dp=e.drift_potential||0;
      if(dp>0.15){ ctx.strokeStyle='rgba(255,0,170,0.5)'; ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx+dp*40, sy-dp*20); ctx.stroke(); }
    });
    requestAnimationFrame(draw);
  }
  draw();
  // click to inspect
  canvas.addEventListener('click', e=>{
    const rect=canvas.getBoundingClientRect();
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    // naive hit test
    let hit=null, best=999;
    worlds.forEach(w=>{
      const fc=w.embodiment?.field_coordinates||{x:0,y:0};
      const [sx,sy]=toScreen(fc.x,fc.y);
      const d=Math.hypot(mx-sx,my-sy);
      if(d<best && d<40){best=d;hit=w;}
    });
    const panel=document.getElementById('inspectPanel');
    if(panel && hit){
      panel.innerHTML = `<strong>${hit.display_name||hit.id}</strong> · <code>${hit.universe_id}</code><br>
      density ${(hit.embodiment?.density||0).toFixed(2)} · intensity ${(hit.embodiment?.intensity||0).toFixed(2)} · gravity ${(hit.embodiment?.gravity||0).toFixed(2)}<br>
      drift ${(hit.embodiment?.drift_potential||0).toFixed(2)} · overlap: ${(hit.embodiment?.overlap_regions||[]).join(', ')||'—'}<br>
      <span class="meta">observations: ${hit.statistics?.observation_count||'?'}</span>`;
    }
  });
})();
