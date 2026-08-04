/**
 * YearGlass — Terrarium Scene (5-layer depth stack)
 *
 * The terrarium is rendered into a WebGL2 framebuffer in five ordered
 * layers, front to back:
 *   Layer 5: Glass Highlight & Distortion Filter (refraction/specular/rim)
 *   Layer 4: Foreground Soil Edge & Overhanging Flora
 *   Layer 3: Active Stage (Pip FSM + primary growth nodes)
 *   Layer 2: Background Moss & Secondary Flora
 *   Layer 1: Inner Bioluminescence & Ambient Backlight
 *
 * The glass layers (Layer 5) are produced by the custom GlassProgram shaders
 * from `shaders.ts`. If WebGL2 is unavailable the scene falls back to a plain
 * canvas-2D composition so the sanctuary never white-screens.
 *
 * Context split: a single <canvas> element can only ever hold ONE rendering
 * context. The five depth layers are therefore composed into a separate,
 * offscreen 2D `sceneCanvas`, uploaded as a texture, and the glass shader's
 * output is drawn to the visible canvas which exclusively owns the WebGL2
 * context.
 */

import { GlassProgram, DEFAULT_GLASS_UNIFORMS, GlassUniforms } from './shaders';

export interface SceneSize {
  width: number;
  height: number;
  dpr: number;
}

/** How deeply the dome curvature bends the refracted scene. */
export const DOME_CURVE = 0.28;

interface LayerSpec {
  key: string;
  depth: number; // 1..5
  tint: string;
  alpha: number;
}

const LAYERS: LayerSpec[] = [
  { key: 'bioluminescence', depth: 1, tint: '#1e3a34', alpha: 1 },
  { key: 'backgroundMoss', depth: 2, tint: '#223c30', alpha: 1 },
  { key: 'activeStage', depth: 3, tint: '#2c4a38', alpha: 1 },
  { key: 'foregroundSoil', depth: 4, tint: '#3a2f24', alpha: 1 },
  { key: 'glass', depth: 5, tint: '#bcd8ee', alpha: 1 },
];

export class TerrariumScene {
  private readonly container: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  /** Offscreen 2D canvas used to compose the five depth layers. */
  private readonly sceneCanvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly gl: WebGL2RenderingContext | null;
  private readonly program: GlassProgram | null;
  private readonly sceneTexture: WebGLTexture | null;
  private readonly quad: WebGLBuffer | null;

  private readonly uniforms: GlassUniforms;
  private size: SceneSize = { width: 320, height: 240, dpr: 1 };
  private disposed = false;
  private readonly onResize: () => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'yearglass-canvas';
    this.canvas.setAttribute('aria-label', 'The glass dome terrarium — a small living world.');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';

    // Layer the 5 depth planes as translucent DOM strata above the canvas so
    // the depth stack remains visible and stylable even without WebGL.
    for (const layer of LAYERS) {
      const div = document.createElement('div');
      div.className = `yearglass-layer yearglass-layer-${layer.key}`;
      div.dataset.depth = String(layer.depth);
      div.style.cssText =
        'position:absolute;inset:0;pointer-events:none;' +
        `background:${layer.tint};opacity:${layer.alpha};mix-blend-mode:soft-light;`;
      container.appendChild(div);
    }

    container.appendChild(this.canvas);

    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
    window.addEventListener('orientationchange', this.onResize);

    // A single canvas cannot hand out both a '2d' and a 'webgl2' context —
    // asking for the second silently returns null. The scene layers are
    // composed on a detached 2D canvas instead; the visible canvas is
    // reserved exclusively for the WebGL2 output.
    this.sceneCanvas = document.createElement('canvas');
    this.ctx = this.sceneCanvas.getContext('2d');

    this.gl = this.canvas.getContext('webgl2') as WebGL2RenderingContext | null;
    this.uniforms = { ...DEFAULT_GLASS_UNIFORMS };

    this.program = this.gl ? GlassProgram.create(this.gl) : null;
    if (this.gl && this.program) {
      const [sceneTexture, quad] = this.setupGL();
      this.sceneTexture = sceneTexture;
      this.quad = quad;
    } else {
      this.sceneTexture = null;
      this.quad = null;
    }

    this.resize();
  }

  private setupGL(): [WebGLTexture, WebGLBuffer] {
    const gl = this.gl as WebGL2RenderingContext;
    const texture = gl.createTexture() as WebGLTexture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // Fullscreen quad (triangle strip).
    const quad = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.checkGLError('setupGL');
    return [texture, quad];
  }

  resize(): void {
    const width = Math.max(1, this.container.clientWidth || 1);
    const height = Math.max(1, this.container.clientHeight || 1);
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    this.size = { width, height, dpr };
    const pw = Math.round(width * dpr);
    const ph = Math.round(height * dpr);
    if (this.canvas.width !== pw || this.canvas.height !== ph) {
      this.canvas.width = pw;
      this.canvas.height = ph;
    }
    if (this.sceneCanvas.width !== pw || this.sceneCanvas.height !== ph) {
      this.sceneCanvas.width = pw;
      this.sceneCanvas.height = ph;
    }
    this.uniforms.uResolution = [width, height];
  }

  /** Advance the simulation-driven lighting uniforms. */
  update(dt: number, lightIntensity: number): void {
    this.uniforms.uTime += dt;
    this.uniforms.uLightIntensity = lightIntensity;
    this.render();
  }

  render(): void {
    if (this.disposed) return;
    const { width, height } = this.size;

    if (this.gl && this.program && this.sceneTexture && this.quad) {
      this.renderWebGL(width, height);
      return;
    }

    this.renderFallback(width, height);
  }

  private renderWebGL(width: number, height: number): void {
    const gl = this.gl as WebGL2RenderingContext;
    const program = this.program as GlassProgram;

    // Compose the five depth layers on the offscreen 2D canvas, then upload
    // it as the scene texture the shader samples from. FLIP_Y keeps the
    // canvas top edge aligned with UV v=1 (otherwise the dome renders
    // upside-down).
    this.paintScene2D(width, height);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.sceneCanvas);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    // Draw to the DEFAULT framebuffer — binding an offscreen FBO here would
    // keep the result off-screen forever.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.03, 0.05, 0.04, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    program.use();
    program.setUniform('uResolution', [width, height]);
    program.setUniform('uTime', this.uniforms.uTime);
    program.setUniform('uLightDir', this.uniforms.uLightDir);
    program.setUniform('uLightIntensity', this.uniforms.uLightIntensity);
    program.setUniform('uSpecular', this.uniforms.uSpecular);
    program.setUniform('uRimColor', this.uniforms.uRimColor);
    program.setUniform('uRimIntensity', this.uniforms.uRimIntensity);
    program.setUniform('uRefraction', this.uniforms.uRefraction);
    program.setUniform('uBrightness', this.uniforms.uBrightness);
    program.setUniform('uCurve', DOME_CURVE);
    program.setSceneTexture(0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    const loc = program.attribLocations.aPos;
    if (loc !== -1) {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    this.checkGLError('renderWebGL');
  }

  /** Surface silent WebGL failures in development builds. */
  private checkGLError(op: string): void {
    if (!this.gl) return;
    const err = this.gl.getError();
    if (err !== this.gl.NO_ERROR && import.meta.env?.DEV) {
      console.error(`[YearGlass] WebGL error during ${op}: 0x${err.toString(16)}`);
    }
  }

  private renderFallback(width: number, height: number): void {
    if (!this.ctx) return;
    this.paintScene2D(width, height);
    // Without WebGL the visible canvas shows nothing on its own — copy the
    // composed scene over so the 2D fallback actually reaches the screen.
    // (Safe to ask for '2d' here: the fallback only runs when the visible
    // canvas never acquired a webgl2 context.)
    const out = this.canvas.getContext('2d');
    if (out) {
      out.clearRect(0, 0, this.canvas.width, this.canvas.height);
      out.drawImage(this.sceneCanvas, 0, 0);
    }
  }

  /** 2D composition of the five depth layers (used as scene + fallback). */
  private paintScene2D(width: number, height: number): void {
    const ctx = this.ctx as CanvasRenderingContext2D;
    ctx.setTransform(this.size.dpr, 0, 0, this.size.dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) * 0.42;

    // Layer 1: bioluminescent backlight
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.3);
    bg.addColorStop(0, '#12211a');
    bg.addColorStop(1, '#050806');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Layer 2: background moss
    ctx.fillStyle = '#1c3226';
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * r * 0.7;
      const x = cx + Math.cos(a) * d;
      const y = cy + Math.sin(a) * d;
      ctx.beginPath();
      ctx.arc(x, y, 2 + Math.random() * 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Layer 3: active stage glow
    ctx.fillStyle = '#3a5c46';
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.55);
    glow.addColorStop(0, 'rgba(90,140,110,0.35)');
    glow.addColorStop(1, 'rgba(90,140,110,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // Layer 4: foreground soil edge
    ctx.strokeStyle = '#241c13';
    ctx.lineWidth = Math.max(2, r * 0.08);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Layer 5: glass rim
    ctx.strokeStyle = 'rgba(188,216,238,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    const spec = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx - r * 0.35, cy - r * 0.35, r * 0.5);
    spec.addColorStop(0, 'rgba(255,255,255,0.28)');
    spec.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = spec;
    ctx.fillRect(0, 0, width, height);
  }

  get domElement(): HTMLCanvasElement {
    return this.canvas;
  }

  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('orientationchange', this.onResize);
    if (this.gl && this.program) {
      this.program.destroy();
      if (this.sceneTexture) this.gl.deleteTexture(this.sceneTexture);
      if (this.quad) this.gl.deleteBuffer(this.quad);
    }
    this.canvas.remove();
    this.container.querySelectorAll('.yearglass-layer').forEach((el) => el.remove());
  }
}
