import type { ExperienceModule, ExperienceContext } from '../platform/types';
import { events } from '../platform/events';
import { h } from '../platform/utils';

function clamp(n: number): number { return Math.max(0, Math.min(10, n)); }

interface Axis {
  id: string; name: string; min: number; max: number; value: number;
  fmt: (v: number) => string;
}
interface Outcome {
  name: string; target: number;
  score: (x: number, y: number) => number;
}
interface Scenario {
  id: string; name: string; setup: string; takeaway: string;
  x: Axis; y: Axis; outcomes: Outcome[]; pass: number;
}

const scenarios: Scenario[] = [
  {
    id: 'bridge', name: 'The Bridge',
    setup: 'You are designing a footbridge. Two choices dominate: how thick the steel is (cost vs. strength) and how far it spans (ambition vs. practicality). Drag the white dot across the landscape \u2014 green ridge = designs that work.',
    takeaway: 'The best design does not maximize any single number. It sits on a ridge where every gain in one direction costs you in another. That ridge is the Pareto frontier \u2014 engineering always happens on it.',
    x: { id:'thickness', name:'Steel Thickness', min:1, max:20, value:10, fmt:v=>Math.round(v)+' cm' },
    y: { id:'span', name:'Span Length', min:10, max:120, value:60, fmt:v=>Math.round(v)+' m' },
    outcomes: [
      { name:'Strength', target:8, score:(t,s)=>clamp(10*t/(s/4)) },
      { name:'Affordability', target:7, score:(t,s)=>clamp(12 - t*0.35 - s*0.04) },
      { name:'Usefulness', target:7, score:(_t,s)=>clamp(s/12) },
    ],
    pass: 7,
  },
  {
    id: 'rocket', name: 'The Rocket',
    setup: 'Fuel makes you go farther \u2014 but every kilogram is mass you must lift. Find a design that reaches orbit without carrying so much fuel you never leave the pad.',
    takeaway: 'More fuel helps, then hurts. The optimum is a narrow ridge \u2014 missing it by a little fails completely.',
    x: { id:'fuel', name:'Fuel Load', min:10, max:200, value:100, fmt:v=>Math.round(v)+' t' },
    y: { id:'thrust', name:'Thrust', min:20, max:200, value:100, fmt:v=>Math.round(v)+' kN' },
    outcomes: [
      { name:'Reach', target:8, score:(f,th)=>clamp((th/Math.max(30,f*0.7))*Math.log(1+f/30)*2.5) },
      { name:'Safety', target:7, score:(f,th)=>clamp((th/Math.max(40,f*0.7))*(f>160 ? (200-f)/40 : 1)*4) },
      { name:'Cost', target:6, score:(f,th)=>clamp(12 - f*0.04 - th*0.03) },
    ],
    pass: 7,
  },
  {
    id: 'team', name: 'The Team',
    setup: 'You are shipping a product. Spend budget on more people or more time. Both improve quality \u2014 but too many people create coordination drag, and too much time misses the market.',
    takeaway: "Adding people to a late project makes it later (Brooks's Law). Rushing ships a broken product. The optimum sits where marginal gains equal marginal cost.",
    x: { id:'people', name:'Team Size', min:2, max:30, value:10, fmt:v=>''+Math.round(v) },
    y: { id:'time', name:'Schedule', min:2, max:24, value:12, fmt:v=>Math.round(v)+' mo' },
    outcomes: [
      { name:'Quality', target:8, score:(p,t)=>{ const pen=p>12?(p-12)*0.3:0; return clamp(Math.min(10,t*0.7)*0.6+(Math.min(10,p*0.6)-pen)*0.4); }},
      { name:'Speed', target:7, score:(_p,t)=>clamp(12 - t*0.45) },
      { name:'Budget', target:7, score:(p,t)=>clamp(14 - (p*0.25 + t*0.3)) },
    ],
    pass: 7,
  },
];

const KEY = 'optimization-progress';
interface Prog { done: string[]; best: Record<string, number>; }
function loadProg(): Prog { try{const r=localStorage.getItem(KEY);return r?JSON.parse(r) as Prog:{done:[],best:{}};}catch{return {done:[],best:{}};} }
function saveProg(p: Prog): void { try{localStorage.setItem(KEY,JSON.stringify(p));}catch{} }

function totalScore(s: Scenario): number {
  let sum = 0;
  for (const o of s.outcomes) sum += o.score(s.x.value, s.y.value);
  return sum / s.outcomes.length;
}

const optimization: ExperienceModule = {
  mount(container: HTMLElement, context: ExperienceContext) {
    container.innerHTML = '';
    const wrap = h('div', { class:'optimization', style:'padding:1rem;max-width:720px;margin:0 auto' });

    let progress = loadProg();
    let idx = scenarios.findIndex(s => !progress.done.includes(s.id));
    if (idx < 0) idx = 0;

    const title = h('h2', {}, ['Optimization']);
    const lead = h('p', { class:'lead' }, ['Two dials. Multiple targets. The best answer is rarely the one that maximizes anything.']);
    const statsEl = h('div', { style:'font-size:.85rem;color:GrayText;margin-bottom:.5rem' }, []);
    const card = h('div', { style:'padding:1rem;border:1px solid ButtonBorder;border-radius:.5rem;background:ButtonFace;margin:.75rem 0' }, []);
    const canvasWrap = h('div', { style:'margin:1rem 0;display:flex;justify-content:center;overflow-x:auto' }, []);
    const canvas = document.createElement('canvas');
    canvas.width = 480; canvas.height = 320;
    canvas.style.cssText = 'width:100%;max-width:480px;height:auto;border:1px solid ButtonBorder;border-radius:.375rem;background:canvas;touch-action:none;cursor:crosshair;display:block';
    canvas.setAttribute('role','img');
    canvas.setAttribute('aria-label','Optimization landscape. Green regions are better designs. Drag the white dot onto the green ridge.');
    const ctx = canvas.getContext('2d')!;
    canvasWrap.appendChild(canvas);

    const controls = h('div', { style:'display:grid;gap:.75rem;margin:.75rem 0' }, []);
    const metricsEl = h('div', { style:'display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.5rem;margin:.75rem 0' }, []);
    const scoreBox = h('div', { style:'padding:.75rem;border:2px solid ButtonBorder;border-radius:.5rem;text-align:center;margin:.75rem 0' }, []);
    const feedbackEl = h('div', {}, []);
    const actions = h('div', { style:'display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.5rem' }, []);

    wrap.append(title, lead, statsEl, card, canvasWrap, controls, metricsEl, scoreBox, feedbackEl, actions);
    container.appendChild(wrap);

    const cur = (): Scenario => scenarios[idx];

    function paint() {
      const s = cur();
      const W = canvas.width, H = canvas.height;
      const step = 6;
      for (let py = 0; py < H; py += step) {
        for (let px = 0; px < W; px += step) {
          const xv = s.x.min + (px/W)*(s.x.max - s.x.min);
          const yv = s.y.min + ((H-py)/H)*(s.y.max - s.y.min);
          let sum = 0;
          for (const o of s.outcomes) sum += o.score(xv, yv);
          const sc = sum / s.outcomes.length;
          const t = Math.max(0, Math.min(1, sc/10));
          const r = Math.round(220*(1-t)+34*t);
          const g = Math.round(60*(1-t)+197*t);
          const b = Math.round(60*(1-t)+94*t);
          ctx.fillStyle = 'rgb('+r+','+g+','+b+')';
          ctx.globalAlpha = 0.6;
          ctx.fillRect(px, py, step, step);
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = getComputedStyle(document.body).color || '#000';
      ctx.font = '11px system-ui,sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(s.y.name + ' \u2191 ' + s.y.fmt(s.y.max), 6, 14);
      ctx.textAlign = 'right';
      ctx.fillText(s.y.fmt(s.y.min), W-6, H-6);
      ctx.textAlign = 'left';
      ctx.fillText(s.x.name + ' \u2192 ' + s.x.fmt(s.x.max), W-210, H-6);

      const cpx = ((s.x.value - s.x.min)/(s.x.max - s.x.min))*W;
      const cpy = H - ((s.y.value - s.y.min)/(s.y.max - s.y.min))*H;
      ctx.beginPath(); ctx.arc(cpx,cpy,9,0,Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fill();
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(cpx,cpy,3,0,Math.PI*2);
      ctx.fillStyle = '#111'; ctx.fill();
    }

    let dragging = false;
    function setFromClient(cx: number, cy: number) {
      const s = cur();
      const rect = canvas.getBoundingClientRect();
      const rx = Math.max(0, Math.min(1, (cx-rect.left)/rect.width));
      const ry = Math.max(0, Math.min(1, (cy-rect.top)/rect.height));
      s.x.value = Math.round((s.x.min + rx*(s.x.max - s.x.min))*10)/10;
      s.y.value = Math.round((s.y.min + (1-ry)*(s.y.max - s.y.min))*10)/10;
      s.x.value = Math.max(s.x.min, Math.min(s.x.max, s.x.value));
      s.y.value = Math.max(s.y.min, Math.min(s.y.max, s.y.value));
      paint(); renderControls(); renderMetrics(); renderScore();
    }
    canvas.addEventListener('pointerdown', e => { dragging = true; canvas.setPointerCapture(e.pointerId); setFromClient(e.clientX, e.clientY); });
    canvas.addEventListener('pointermove', e => { if(dragging) setFromClient(e.clientX, e.clientY); });
    canvas.addEventListener('pointerup', () => { dragging = false; });
    canvas.addEventListener('pointercancel', () => { dragging = false; });

    function renderCard() {
      const s = cur();
      card.innerHTML = '';
      card.append(h('h3',{style:'margin-top:0'},[s.name]),
                  h('p',{style:'margin-bottom:0;line-height:1.55'},[s.setup]));
    }

    function renderControls() {
      const s = cur();
      controls.innerHTML = '';
      for (const axis of [s.x, s.y]) {
        const wrap = h('div',{},[]);
        const label = h('label',{style:'display:flex;justify-content:space-between;font-weight:600;margin-bottom:.3rem;font-size:.9rem'},[]);
        const nameSpan = document.createElement('span'); nameSpan.textContent = axis.name;
        const vSpan = document.createElement('span');
        vSpan.textContent = axis.fmt(axis.value);
        label.append(nameSpan, vSpan);
        const slider = document.createElement('input');
        slider.type = 'range'; slider.min = String(axis.min); slider.max = String(axis.max);
        slider.step = axis.max > 50 ? '2' : '1';
        slider.value = String(axis.value);
        slider.style.cssText = 'width:100%';
        slider.setAttribute('aria-label', axis.name);
        slider.addEventListener('input', () => {
          axis.value = parseFloat(slider.value);
          vSpan.textContent = axis.fmt(axis.value);
          paint(); renderMetrics(); renderScore();
        });
        wrap.append(label, slider);
        controls.appendChild(wrap);
      }
    }

    function renderMetrics() {
      const s = cur();
      metricsEl.innerHTML = '';
      for (const o of s.outcomes) {
        const v = o.score(s.x.value, s.y.value);
        const ok = v >= o.target - 1;
        const c = document.createElement('div');
        c.style.cssText = 'padding:.6rem;border:1px solid '+ (ok?'#22c55e':'ButtonBorder') +';border-radius:.375rem;text-align:center';
        c.innerHTML = '<div style="font-size:.75rem;color:GrayText;margin-bottom:.2rem">'+o.name+'</div>'+
          '<div style="font-size:1.25rem;font-weight:600;color:'+(ok?'#16a34a':'inherit')+'">'+v.toFixed(1)+'</div>'+
          '<div style="font-size:.7rem;color:GrayText">target '+o.target+'</div>';
        metricsEl.appendChild(c);
      }
    }

    function renderScore() {
      const s = cur();
      const sc = totalScore(s);
      const best = progress.best[s.id] || 0;
      if (sc > best) progress.best[s.id] = sc;
      saveProg(progress);
      statsEl.textContent = progress.done.length+'/'+scenarios.length+' scenarios solved';
      scoreBox.innerHTML = '<div style="font-size:.85rem;color:GrayText">Overall Score</div>'+
        '<div style="font-size:2rem;font-weight:700">'+sc.toFixed(1)+'</div>'+
        '<div style="font-size:.75rem;color:GrayText">/ 10'+(best>0?' \u00b7 best '+best.toFixed(1):'')+'</div>';
    }

    function addActions() {
      actions.innerHTML = '';
      const submitBtn = h('button', { class:'btn primary' }, ['Submit Design']);
      submitBtn.addEventListener('click', submit);
      const resetBtn = h('button', { class:'btn subtle' }, ['Reset']);
      resetBtn.addEventListener('click', () => {
        const s = cur();
        s.x.value = (s.x.min+s.x.max)/2;
        s.y.value = (s.y.min+s.y.max)/2;
        feedbackEl.innerHTML='';
        fullRender();
      });
      actions.append(submitBtn, resetBtn);
    }

    function submit() {
      const s = cur();
      const sc = totalScore(s);
      feedbackEl.innerHTML = '';
      if (sc >= s.pass) {
        if (!progress.done.includes(s.id)) progress.done.push(s.id);
        saveProg(progress);
        events.emit('experience_interaction',{experience_id:context.meta.id,action:'scenario_optimized',scenario:s.id,score:sc});
        const nextExists = idx < scenarios.length - 1;
        const nextBtn = nextExists
          ? h('button', { class:'btn primary' }, ['Next Scenario \u2192'])
          : h('a', { class:'btn primary', href:'/collections' }, ['Return to Collections']);
        if (nextExists) {
          (nextBtn as HTMLButtonElement).addEventListener('click', () => {
            idx = (idx + 1) % scenarios.length;
            feedbackEl.innerHTML = '';
            actions.innerHTML = '';
            fullRender();
          });
        }
        const retryBtn = h('button', { class:'btn subtle' }, ['Try Again']);
        retryBtn.addEventListener('click', () => { feedbackEl.innerHTML=''; actions.innerHTML=''; addActions(); fullRender(); });
        actions.append(nextBtn, retryBtn);
        const box = h('div',{style:'padding:1rem;border:2px solid #22c55e;border-radius:.5rem;background:#22c55e11'},[
          h('h4',{style:'margin-top:0;color:#16a34a'},['\u2713 Design works']),
          h('p',{style:'margin-bottom:.5rem'},['Score: '+sc.toFixed(1)+'/10. You found a workable point on the frontier.']),
          h('p',{style:'margin-bottom:0;font-style:italic;line-height:1.5'},[s.takeaway]),
        ]);
        feedbackEl.appendChild(box);
        events.emit('experience_interaction', { experience_id: context.meta.id, action: 'completed' });
      } else {
        const box = h('div',{style:'padding:1rem;border:2px solid #eab308;border-radius:.5rem;background:#eab30811'},[
          h('h4',{style:'margin-top:0;color:#ca8a04'},['Not yet optimal']),
          h('p',{style:'margin-bottom:0'},['Score: '+sc.toFixed(1)+'/10. Need at least '+s.pass+'. Move the white dot toward greener ground \u2014 watch which metrics rise and fall together.']),
        ]);
        feedbackEl.appendChild(box);
      }
    }

    function fullRender() {
      renderCard();
      renderControls();
      paint();
      renderMetrics();
      renderScore();
      addActions();
    }

    fullRender();
    return () => {};
  }
};

export default optimization;
