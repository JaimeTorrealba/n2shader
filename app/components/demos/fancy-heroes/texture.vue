<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  PlaneGeometry,
  Mesh,
  TextureLoader,
  Texture,
  MeshStandardMaterial,
  PointLight,
  AmbientLight,
  ACESFilmicToneMapping,
  SRGBColorSpace,
} from "three";
import { useWindowSize } from "@vueuse/core";

const { width, height } = useWindowSize();
const textureStore = useFancyHeroesStore();

const canvasEl = ref<HTMLCanvasElement | null>(null);
const isLoaded = ref(false);

const imagePaths = [
  "/textures/bricks/color.png",
  "/textures/bricks/ao.png",
  "/textures/bricks/normal.png",
  "/textures/bricks/roughness.png",
];

let renderer: WebGLRenderer;
let scene: Scene;
let camera: OrthographicCamera;
let mesh: Mesh;
let material: MeshStandardMaterial;
let textures: Texture[] = [];
let rafId: number;
let light: PointLight;
let onMouseMove: (e: MouseEvent) => void;

const resize = () => {
  if (!canvasEl.value) return;
  const w = canvasEl.value.clientWidth;
  const h = canvasEl.value.clientHeight;
  renderer.setSize(w, h, false);

  const canvasAspect = w / h;
  const planeAspect = 16 / 9;
  let halfW: number, halfH: number;
  if (canvasAspect > planeAspect) {
    halfW = 8;
    halfH = 8 / canvasAspect;
  } else {
    halfH = 4.5;
    halfW = 4.5 * canvasAspect;
  }
  camera.left = -halfW;
  camera.right = halfW;
  camera.top = halfH;
  camera.bottom = -halfH;
  camera.updateProjectionMatrix();
};

watch([width, height], resize);

onMounted(async () => {
  const canvas = canvasEl.value!;

  renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = SRGBColorSpace;

  scene = new Scene();
  camera = new OrthographicCamera(-8, 8, 4.5, -4.5, -1, 10);
  camera.position.z = 1;

  const geometry = new PlaneGeometry(16, 9, 256, 144);
  material = new MeshStandardMaterial({ metalness: 0 });

  mesh = new Mesh(geometry, material);
  scene.add(mesh);

  const ambient = new AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  light = new PointLight(0xffffff, 2, 10, 1);
  light.position.set(0, 0, 2);
  scene.add(light);

  const container = canvas.parentElement!;

  onMouseMove = (e: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    light.position.x = (nx - 0.5) * 16;
    light.position.y = (0.5 - ny) * 9;
  };

  container.addEventListener("mousemove", onMouseMove);

  const loader = new TextureLoader();
  textures = await Promise.all(imagePaths.map((p) => loader.loadAsync(p)));
  isLoaded.value = true;
  material.map = textures[0]!;
  material.aoMap = textures[1]!;
  material.aoMapIntensity = 0.5;
  material.normalMap = textures[2]!;
  material.normalScale.set(0.5, 0.5);
  material.roughnessMap = textures[3]!;
  material.roughness = 0.5;
  material.needsUpdate = true;
  resize();

  watch(
    () => textureStore.aoMapIntensity,
    (v) => {
      material.aoMapIntensity = v;
    }
  );
  watch(
    () => textureStore.normalScale,
    (v) => {
      material.normalScale.set(v, v);
    }
  );
  watch(
    () => textureStore.roughness,
    (v) => {
      material.roughness = v;
    }
  );
  watch(
    () => textureStore.lightIntensity,
    (v) => {
      light.intensity = v;
    }
  );
  watch(
    () => textureStore.lightColor,
    (v) => {
      light.color.set(v);
    }
  );

  const renderLoop = () => {
    rafId = requestAnimationFrame(renderLoop);
    renderer.render(scene, camera);
  };
  renderLoop();
});

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  canvasEl.value?.parentElement?.removeEventListener("mousemove", onMouseMove);
  renderer?.dispose();
});
</script>

<template>
  <DemosPlaceholdersHero :is-loaded="isLoaded" noVignette align="left">
    <canvas ref="canvasEl" class="absolute inset-0 w-full h-full" style="z-index: 0" />
  </DemosPlaceholdersHero>
  <section class="flex flex-col gap-2 items-center md:flex-row p-8 min-h-96">
    <div class="w-1/2 h-full">
      <DemosFancyHeroesTextureTweakpane />
    </div>
    <div class="w-1/2 h-full">TEXT</div>
  </section>
</template>
