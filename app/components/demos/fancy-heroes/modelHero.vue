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

const accordionItems = [
  {
    label: "When is this hero a good fit?",
    content: "This hero works best for brands that sell or showcase a physical product — hardware, consumer electronics, industrial equipment, furniture, or anything with a distinctive 3D form. If your product's shape and materiality are part of its value proposition, putting it front and center in three dimensions is more convincing than a photo.",
  },
  {
    label: "What interactions and animations are possible?",
    content: "The model can auto-rotate, respond to mouse movement via parallax, or be driven by scroll position. You can also trigger animations baked into the GLTF file — product assembly sequences, exploded views, color variant swaps, or state transitions (open/closed, folded/unfolded). Point lights can track the cursor to give the impression the user is inspecting the object with a flashlight.",
  },
  {
    label: "How does it perform on mobile and other devices?",
    content: "WebGL is supported on all modern mobile browsers. Performance scales with device — on lower-end phones you may want to reduce geometry detail, disable shadows, and cap the pixel ratio at 1. The parallax effect automatically degrades gracefully since it relies on mousemove, which has no equivalent on touch; you can substitute a subtle idle sway animation instead.",
  },
];

const { width, height } = useWindowSize();
const store = useModelHeroStore();

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
  <section class="flex flex-col gap-2 items-start md:flex-row p-8 min-h-96">
    <div class="w-1/2 h-full">
      <DemosFancyHeroesModelHeroTweakpane />
    </div>
    <div class="w-1/2 h-full">
      <UCard>
        <UAccordion :items="accordionItems" />
      </UCard>
    </div>
  </section>
</template>
