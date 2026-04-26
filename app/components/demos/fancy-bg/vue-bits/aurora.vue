<template>
  <div ref="containerRef" :class="className" :style="style" class="relative">
    <canvas ref="canvasEl" class="absolute inset-0 w-full h-full" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, type CSSProperties } from 'vue';
import {
  WebGLRenderer, Scene, OrthographicCamera, Mesh,
  ShaderMaterial, BufferGeometry, BufferAttribute,
  Color, Vector2, Vector3, GLSL3,
  CustomBlending, OneFactor, OneMinusSrcAlphaFactor,
} from 'three';

interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  time?: number;
  speed?: number;
  intensity?: number;
  offsetY?: number;
  className?: string;
  style?: CSSProperties;
}

const props = withDefaults(defineProps<AuroraProps>(), {
  colorStops: () => ['#7cff67', '#171D22', '#7cff67'],
  amplitude: 1.0,
  blend: 0.5,
  speed: 1.0,
  intensity: 1.0,
  offsetY: 0.0,
  className: '',
  style: () => ({}),
});

const containerRef = ref<HTMLDivElement | null>(null);
const canvasEl = ref<HTMLCanvasElement | null>(null);

// Three.js removes #version and precision — we only write the logic
const VERT = `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = `
out vec4 fragColor;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
uniform float uIntensity;
uniform float uOffsetY;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m * m * m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {                              \
  int index = 0;                                                              \
  for (int i = 0; i < 2; i++) {                                              \
    ColorStop currentColor = colors[i];                                      \
    bool isInBetween = currentColor.position <= factor;                      \
    index = int(mix(float(index), float(i), float(isInBetween)));            \
  }                                                                           \
  ColorStop currentColor = colors[index];                                    \
  ColorStop nextColor = colors[index + 1];                                   \
  float range = nextColor.position - currentColor.position;                  \
  float lerpFactor = (factor - currentColor.position) / range;               \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor);         \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = ((uv.y + uOffsetY) * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  float finalAlpha = auroraAlpha * smoothstep(0.0, 0.5, intensity) * uIntensity;

  fragColor = vec4(rampColor * finalAlpha, finalAlpha);
}
`;

let renderer: WebGLRenderer;
let scene: Scene;
let camera: OrthographicCamera;
interface AuroraUniforms {
  uTime: { value: number };
  uAmplitude: { value: number };
  uColorStops: { value: Vector3[] };
  uResolution: { value: Vector2 };
  uBlend: { value: number };
  uIntensity: { value: number };
  uOffsetY: { value: number };
}
type AuroraMaterial = ShaderMaterial & { uniforms: AuroraUniforms };
let material: AuroraMaterial;
let rafId: number;

const hexToVec3 = (hex: string): Vector3 => {
  const c = new Color(hex);
  return new Vector3(c.r, c.g, c.b);
};

const resize = () => {
  const container = containerRef.value;
  if (!container || !renderer || !material) return;
  const w = container.offsetWidth || window.innerWidth;
  const h = container.offsetHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  material.uniforms.uResolution.value.set(w, h);
};

onMounted(() => {
  const container = containerRef.value!;
  const canvas = canvasEl.value!;

  renderer = new WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  scene = new Scene();
  camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // Full-screen triangle (more efficient than a quad)
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));

  material = new ShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uTime: { value: 0 },
      uAmplitude: { value: props.amplitude },
      uColorStops: { value: props.colorStops.map(hexToVec3) },
      uResolution: { value: new Vector2(container.offsetWidth, container.offsetHeight) },
      uBlend: { value: props.blend },
      uIntensity: { value: props.intensity },
      uOffsetY: { value: props.offsetY },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: CustomBlending,
    blendSrc: OneFactor,
    blendDst: OneMinusSrcAlphaFactor,
  }) as AuroraMaterial;

  scene.add(new Mesh(geometry, material));

  const update = (t: number) => {
    rafId = requestAnimationFrame(update);
    const time = props.time ?? t * 0.01;
    material.uniforms.uTime.value = time * (props.speed ?? 1.0) * 0.1;
    renderer.render(scene, camera);
  };
  rafId = requestAnimationFrame(update);

  resize();
  window.addEventListener('resize', resize);
});

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  window.removeEventListener('resize', resize);
  renderer?.dispose();
});

watch(() => props.amplitude, (v) => { if (material) material.uniforms.uAmplitude.value = v; });
watch(() => props.blend, (v) => { if (material) material.uniforms.uBlend.value = v; });
watch(() => props.intensity, (v) => { if (material) material.uniforms.uIntensity.value = v; });
watch(() => props.colorStops, (v) => { if (material) material.uniforms.uColorStops.value = v.map(hexToVec3); }, { deep: true });
watch(() => props.offsetY, (v) => { if (material) material.uniforms.uOffsetY.value = v; });
</script>

<style scoped>
div {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
}
</style>
