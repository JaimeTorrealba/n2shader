<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  NeutralToneMapping,
  SRGBColorSpace,
  Group,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { EquirectangularReflectionMapping } from "three";
import { useWindowSize } from "@vueuse/core";

const MODEL_PATH = "/models/bosh_drill.glb";



const { width, height } = useWindowSize();
const store = useFancyHeroesStore();

const canvasEl = ref<HTMLCanvasElement | null>(null);
const isLoaded = ref(false);

const PARALLAX_FACTOR = 0.5;
const PARALLAX_EASE = 2;

let renderer: WebGLRenderer;
let scene: Scene;
let camera: PerspectiveCamera;
let cameraRig: Group;
let rafId: number;
let onMouseMove: (e: MouseEvent) => void;
let lastTime = 0;
let targetX = 0;
let targetY = 0;

const resize = () => {
  if (!canvasEl.value) return;
  const w = canvasEl.value.clientWidth;
  const h = canvasEl.value.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
};

watch([width, height], resize);

onMounted(async () => {
  const canvas = canvasEl.value!;

  renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = SRGBColorSpace;

  scene = new Scene();

  camera = new PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 1, 5);

  cameraRig = new Group();
  cameraRig.add(camera);
  scene.add(cameraRig);

  const container = canvas.parentElement!;

  onMouseMove = (e: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    targetX = (e.clientX - rect.left) / rect.width - 0.5;
    targetY = -((e.clientY - rect.top) / rect.height - 0.5);
  };
  container.addEventListener("mousemove", onMouseMove);

  const hdri = await new HDRLoader().loadAsync("/hdri/empty_workshop_1k.hdr");
  hdri.mapping = EquirectangularReflectionMapping;
  scene.environment = hdri;
  scene.background = hdri;

  const loader = new GLTFLoader();
  const { scene: gltf } = await loader.loadAsync(MODEL_PATH);
  gltf.position.set(-2, 0.5, 0);
  gltf.scale.set(2.0, 2.0, 2.0);
  scene.add(gltf);

  isLoaded.value = true;
  resize();

  watch(
    () => store.hdriIntensity,
    (v) => {
      scene.environmentIntensity = v;
    },
    { immediate: true }
  );
  watch(
    () => store.modelScale,
    (v) => {
      gltf.scale.setScalar(v);
    }
  );
  watch(
    () => store.modelX,
    (v) => {
      gltf.position.x = v;
    }
  );
  watch(
    () => store.modelY,
    (v) => {
      gltf.position.y = v;
    }
  );

  lastTime = performance.now();

  const renderLoop = () => {
    rafId = requestAnimationFrame(renderLoop);

    const now = performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (store.autoRotate && gltf) {
      gltf.rotation.y += delta * store.rotationSpeed;
    }

    const t = 1 - Math.exp(-PARALLAX_EASE * delta);
    cameraRig.position.x += (targetX * PARALLAX_FACTOR - cameraRig.position.x) * t;
    cameraRig.position.y += (targetY * PARALLAX_FACTOR - cameraRig.position.y) * t;

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
  <DemosPlaceholdersHero :is-loaded="isLoaded" navSolidBg align="right">
    <canvas ref="canvasEl" class="absolute inset-0 w-full h-full" style="z-index: 0" />
  </DemosPlaceholdersHero>
  <DemosFancyHeroesModelHeroTweakpane />
</template>
