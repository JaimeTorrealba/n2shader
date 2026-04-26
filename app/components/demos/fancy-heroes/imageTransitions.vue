<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import {
  WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry,
  ShaderMaterial, Mesh, TextureLoader, Vector4, type IUniform, Texture,
} from "three";
import { gsap } from "gsap";
import { useWindowSize } from "@vueuse/core";
import fragmentEffectOne from "./shaders/fragment-effect-one.glsl";
import fragmentEffectTwo from "./shaders/fragment-effect-two.glsl";
import fragmentEffectThree from "./shaders/fragment-effect-three.glsl";
import fragmentEffectFour from "./shaders/fragment-effect-four.glsl";

interface SliderUniforms {
  progress: IUniform<number>;
  intensity: IUniform<number>;
  texture1: IUniform<Texture | null>;
  texture2: IUniform<Texture | null>;
  resolution: IUniform<Vector4>;
}

const store = useFancyHeroesStore();
const fragments = [fragmentEffectOne, fragmentEffectTwo, fragmentEffectThree, fragmentEffectFour];
const current = ref(0);
const { width, height } = useWindowSize();

const canvasEl = ref<HTMLCanvasElement | null>(null);
const isLoaded = ref(false);

const imagePaths = ["/img/earth-one.jpg", "/img/forest-one.jpg", "/img/ocean-one.jpg"];

let renderer: WebGLRenderer;
let scene: Scene;
let camera: OrthographicCamera;
let material: ShaderMaterial & { uniforms: SliderUniforms };
let mesh: Mesh;
let textures: Texture[] = [];
let rafId: number;
let interval: ReturnType<typeof setInterval>;

const resize = () => {
  if (!canvasEl.value || !textures[0]) return;
  const w = canvasEl.value.clientWidth;
  const h = canvasEl.value.clientHeight;
  renderer.setSize(w, h, false);

  const img = textures[0].image as HTMLImageElement;
  const imageAspect = img.height / img.width;
  let a1: number, a2: number;
  if (h / w > imageAspect) {
    a1 = (w / h) * imageAspect;
    a2 = 1;
  } else {
    a1 = 1;
    a2 = (h / w) / imageAspect;
  }
  material.uniforms.resolution.value.set(w, h, a1, a2);
};

const navigate = (direction: 1 | -1) => {
  const len = textures.length;
  const targetIndex = ((current.value + direction) % len + len) % len;
  const targetTexture = textures[targetIndex]!;
  material.uniforms.texture2.value = targetTexture;
  gsap.to(material.uniforms.progress, {
    value: 1,
    duration: 1,
    ease: "power2.out",
    onComplete: () => {
      current.value = targetIndex;
      material.uniforms.texture1.value = targetTexture;
      material.uniforms.progress.value = 0;
    },
  });
};

const swapShader = (index: number) => {
  if (index < 0 || index >= fragments.length) return;
  store.currentFragment = index;
  material.fragmentShader = fragments[index]!;
  material.needsUpdate = true;
};

const next = () => navigate(1);
const previous = () => navigate(-1);

watch([width, height], resize);

onMounted(async () => {
  const canvas = canvasEl.value!;

  renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene = new Scene();
  camera = new OrthographicCamera(-8, 8, 4.5, -4.5, -1, 10);
  camera.position.z = 1;

  const geometry = new PlaneGeometry(16, 9);
  material = new ShaderMaterial({
    uniforms: {
      progress: { value: 0 },
      intensity: { value: 1 },
      texture1: { value: null },
      texture2: { value: null },
      resolution: { value: new Vector4() },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: fragments[store.currentFragment] ?? fragmentEffectOne,
  }) as ShaderMaterial & { uniforms: SliderUniforms };

  mesh = new Mesh(geometry, material);
  scene.add(mesh);

  const loader = new TextureLoader();
  textures = await Promise.all(imagePaths.map(p => loader.loadAsync(p)));
  material.uniforms.texture1.value = textures[0]!;
  material.uniforms.texture2.value = textures[1]!;
  resize();
  isLoaded.value = true;

  const renderLoop = () => {
    rafId = requestAnimationFrame(renderLoop);
    renderer.render(scene, camera);
  };
  renderLoop();

  store.register({ next, previous, swapShader });
  interval = setInterval(next, 5000);
});

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  clearInterval(interval);
  renderer?.dispose();
});
</script>

<template>
  <DemosPlaceholdersHero :is-loaded="isLoaded" navShowCta>
    <canvas ref="canvasEl" class="absolute inset-0 w-full h-full" style="z-index: 0" />
  </DemosPlaceholdersHero>
  <DemosFancyHeroesImageTransitionsTweakpane />
</template>
