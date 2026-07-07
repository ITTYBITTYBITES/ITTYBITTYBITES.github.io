import { events } from '../platform/events';
import type { ExperienceContext, ExperienceMeta, ExperienceModule } from '../platform/types';
import { h } from '../platform/utils';

export const meta: ExperienceMeta = {
  id: 'canvas-demo',
  title: 'Canvas Sketch',
  description: 'A lightweight canvas experiment showing how media experiences can be mounted by the platform.',
  category: 'experiment',
  tags: ['sample', 'canvas', 'media'],
};

export const mount = (container: HTMLElement, context: ExperienceContext): (() => void) => {
  let started = false;
  let frame = 0;

  const canvas = h('canvas', { width: '640', height: '360', 'aria-label': 'Canvas drawing area' }) as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  const resize = (): void => {
    const rect = container.getBoundingClientRect();
    const width = Math.min(640, Math.max(320, Math.floor(rect.width - 32)));
    canvas.width = width;
    canvas.height = Math.floor(width * 0.5625);
    draw();
  };

  const draw = (): void => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'canvas';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'canvastext';
    ctx.lineWidth = 2;

    const time = Date.now() / 1000;
    const count = Math.floor(canvas.width / 40);
    for (let i = 0; i < count; i += 1) {
      const x = (i / count) * canvas.width;
      const y = canvas.height / 2 + Math.sin(time + i * 0.2) * canvas.height * 0.25;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    frame = requestAnimationFrame(draw);
  };

  canvas.addEventListener('pointerdown', () => {
    if (!started) {
      started = true;
      events.emit('experience_started', { experience_id: context.meta.id });
    }
  });

  container.appendChild(
    h('div', { class: 'experience-canvas' }, [
      h('p', {}, ['Tap or click the canvas to start the animation.']),
      canvas,
    ])
  );

  resize();
  window.addEventListener('resize', resize);

  return () => {
    window.removeEventListener('resize', resize);
    cancelAnimationFrame(frame);
    container.innerHTML = '';
  };
};

const module: ExperienceModule = { meta, mount };
export default module;
