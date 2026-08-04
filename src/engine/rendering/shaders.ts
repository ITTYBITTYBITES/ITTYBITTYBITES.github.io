/**
 * YearGlass — Glass Shader System
 *
 * Custom GLSL ES 3.00 shaders for the sanctuary's glass dome:
 *   - curved glass refraction (thick-dome distortion of the background)
 *   - specular highlight band
 *   - dynamic lighting (parallax lamp + dimmable light)
 *   - rim lighting on the dome silhouette
 *
 * No external assets are required; uniforms are wired directly to the
 * active WebGL2 renderer.
 */

export interface GlassUniforms {
  uResolution: [number, number];
  uTime: number;
  uLightDir: [number, number];
  uLightIntensity: number;
  uSpecular: number;
  uRimColor: [number, number, number];
  uRimIntensity: number;
  uRefraction: number; // thickness / index bending strength
  uBrightness: number;
}

export const DEFAULT_GLASS_UNIFORMS: GlassUniforms = {
  uResolution: [1, 1],
  uTime: 0,
  uLightDir: [-0.45, 0.65],
  uLightIntensity: 0.9,
  uSpecular: 0.85,
  uRimColor: [0.62, 0.78, 0.92],
  uRimIntensity: 0.55,
  uRefraction: 0.14,
  uBrightness: 1.0,
};

/**
 * Vertex shader: fullscreen quad with the curvature baked into the UV.
 * The dome sits at screen center; `uCurve` bends the sampling coordinates
 * to emulate a thick convex lens.
 */
export const GLASS_VERTEX = /* glsl */ `#version 300 es
  precision highp float;
  layout(location = 0) in vec2 aPos;
  uniform vec2 uResolution;
  uniform float uCurve;
  out vec2 vUv;
  out vec2 vLensUv;

  void main() {
    vec2 clip = aPos * 2.0 - 1.0;
    gl_Position = vec4(clip, 0.0, 1.0);
    vUv = aPos;

    // Radial lens bend toward the rim -> thick-glass refraction.
    vec2 centered = aPos - 0.5;
    float r = length(centered);
    vec2 bent = centered * (1.0 + uCurve * r * r);
    vLensUv = bent + 0.5;
  }
`;

/**
 * Fragment shader: composite refraction, specular, dynamic light and rim.
 * The scene texture `uScene` is sampled with the lens-distorted UV, then
 * layered with a moving specular glint and an emissive rim.
 */
export const GLASS_FRAGMENT = /* glsl */ `#version 300 es
  precision highp float;
  uniform sampler2D uScene;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec2 uLightDir;
  uniform float uLightIntensity;
  uniform float uSpecular;
  uniform vec3 uRimColor;
  uniform float uRimIntensity;
  uniform float uRefraction;
  uniform float uBrightness;
  in vec2 vUv;
  in vec2 vLensUv;
  out vec4 outColor;

  void main() {
    vec2 uv = vUv;
    vec2 lensUv = clamp(vLensUv, 0.001, 0.999);

    // 1) Refracted scene (thick dome bending)
    vec3 refracted = texture(uScene, lensUv).rgb;

    // subtle chromatic aberration on the rim
    vec2 dir = normalize(lensUv - 0.5);
    float ca = 0.008 * uRefraction;
    vec3 chroma = vec3(
      texture(uScene, lensUv + dir * ca).r,
      texture(uScene, lensUv).g,
      texture(uScene, lensUv - dir * ca).b
    );
    refracted = mix(refracted, chroma, 0.4);

    // 2) Dynamic lighting — parallax by fragment position
    vec2 frag = uv - 0.5;
    float light = dot(normalize(frag + uLightDir), normalize(uLightDir));
    light = max(0.0, light) * uLightIntensity;
    refracted *= mix(0.7, 1.0, min(1.0, 0.35 + light));

    // 3) Moving specular highlight band
    float t = uTime * 0.12;
    vec2 sp = vec2(0.5 + 0.35 * cos(t), 0.5 + 0.22 * sin(t * 1.3));
    float sd = distance(uv, sp);
    float spec = exp(-sd * sd * 60.0) * uSpecular;
    refracted += vec3(spec);

    // 4) Rim lighting on the dome silhouette
    float rimDist = distance(uv, 0.5);
    float rim = smoothstep(0.42, 0.5, rimDist) * uRimIntensity;
    refracted = mix(refracted, uRimColor, rim * 0.6);

    outColor = vec4(refracted * uBrightness, 1.0);
  }
`;

/**
 * Lightweight WebGL2 program wrapper. Compiles + links the given shaders
 * and caches uniform locations. `compileGlassProgram` returns null when
 * WebGL2 is unavailable or shaders fail, so the caller can fall back to a
 * canvas-2D renderer without crashing.
 */
export class GlassProgram {
  readonly gl: WebGL2RenderingContext;
  readonly program: WebGLProgram;
  private readonly uniforms = new Map<string, WebGLUniformLocation | null>();
  readonly attribLocations: Record<string, number> = {};

  private constructor(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    uniforms: string[]
  ) {
    this.gl = gl;
    this.program = program;
    for (const name of uniforms) {
      this.uniforms.set(name, gl.getUniformLocation(program, name));
    }
    this.attribLocations.aPos = gl.getAttribLocation(program, 'aPos');
  }

  static create(gl: WebGL2RenderingContext): GlassProgram | null {
    const vs = GlassProgram.compile(gl, gl.VERTEX_SHADER, GLASS_VERTEX);
    const fs = GlassProgram.compile(gl, gl.FRAGMENT_SHADER, GLASS_FRAGMENT);
    if (!vs || !fs) return null;

    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      if (import.meta.env?.DEV) console.error('[YearGlass] Program link failed:', log);
      return null;
    }

    return new GlassProgram(gl, program, [
      'uScene', 'uResolution', 'uTime', 'uLightDir', 'uLightIntensity',
      'uSpecular', 'uRimColor', 'uRimIntensity', 'uRefraction', 'uBrightness',
      'uCurve'
    ]);
  }

  private static compile(
    gl: WebGL2RenderingContext,
    type: number,
    source: string
  ): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      if (import.meta.env?.DEV) console.error('[YearGlass] Shader compile failed:', log);
      return null;
    }
    return shader;
  }

  use(): void {
    this.gl.useProgram(this.program);
  }

  setUniform(name: string, value: number | number[]): void {
    const loc = this.uniforms.get(name);
    if (loc === undefined || loc === null) return;
    const gl = this.gl;
    if (typeof value === 'number') {
      gl.uniform1f(loc, value);
    } else if (value.length === 2) {
      gl.uniform2f(loc, value[0], value[1]);
    } else if (value.length === 3) {
      gl.uniform3f(loc, value[0], value[1], value[2]);
    }
  }

  setSceneTexture(unit: number): void {
    const loc = this.uniforms.get('uScene');
    if (loc === undefined || loc === null) return;
    this.gl.uniform1i(loc, unit);
  }

  destroy(): void {
    this.gl.deleteProgram(this.program);
    this.uniforms.clear();
  }
}
