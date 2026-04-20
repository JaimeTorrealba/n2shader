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

const store = useImageTransitionsStore();
const mobileMenuOpen = ref(false);
const fragments = [fragmentEffectOne, fragmentEffectTwo, fragmentEffectThree, fragmentEffectFour];
const current = ref(0);
const { width, height } = useWindowSize();

const canvasEl = ref<HTMLCanvasElement | null>(null);
const isLoaded = ref(false);
const heroTitle = ref<HTMLElement | null>(null);
const heroDesc = ref<HTMLElement | null>(null);
const heroButtons = ref<HTMLElement | null>(null);
const heroBadge = ref<HTMLElement | null>(null);

watch(isLoaded, (loaded) => {
  if (!loaded) return;
  gsap.fromTo(
    [heroTitle.value, heroDesc.value, heroButtons.value, heroBadge.value],
    { y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.15,
    }
  );
});

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

  const imageAspect = textures[0].image.height / textures[0].image.width;
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
  <section class="relative w-full min-h-125 overflow-hidden">
    <!-- Loading state -->
    <Transition name="fade">
      <div v-if="!isLoaded" class="absolute inset-0 z-30 bg-black flex items-center justify-center gap-2">
        <span class="w-2 h-2 rounded-full bg-white/40 animate-bounce [animation-delay:-0.3s]" />
        <span class="w-2 h-2 rounded-full bg-white/40 animate-bounce [animation-delay:-0.15s]" />
        <span class="w-2 h-2 rounded-full bg-white/40 animate-bounce" />
      </div>
    </Transition>
    <nav class="absolute top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-sm border-b border-white/10">
      <div class="flex items-center justify-between px-8 py-4">
        <div class="text-white/90 font-semibold text-lg tracking-wide">Your Logo</div>

        <!-- Desktop -->
        <ul class="hidden md:flex gap-8 text-white/70 text-sm">
          <li class="hover:text-white cursor-pointer transition-colors">Home</li>
          <li class="hover:text-white cursor-pointer transition-colors">About</li>
          <li class="hover:text-white cursor-pointer transition-colors">Work</li>
          <li class="hover:text-white cursor-pointer transition-colors">Contact</li>
        </ul>
        <button class="hidden md:block px-4 py-1.5 border border-white/40 text-white/80 text-sm hover:bg-white/10 transition-colors rounded-sm">
          Get Started
        </button>

        <!-- Hamburger -->
        <button class="md:hidden flex flex-col gap-1.5 p-1 text-white/80" @click="mobileMenuOpen = !mobileMenuOpen">
          <span class="block w-6 h-px bg-current transition-all" :class="mobileMenuOpen ? 'rotate-45 translate-y-2' : ''" />
          <span class="block w-6 h-px bg-current transition-all" :class="mobileMenuOpen ? 'opacity-0' : ''" />
          <span class="block w-6 h-px bg-current transition-all" :class="mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''" />
        </button>
      </div>

      <!-- Mobile menu -->
      <Transition name="mobile-menu">
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-white/10 px-8 py-4 flex flex-col gap-4">
          <ul class="flex flex-col gap-4 text-white/70 text-sm">
            <li class="hover:text-white cursor-pointer transition-colors">Home</li>
            <li class="hover:text-white cursor-pointer transition-colors">About</li>
            <li class="hover:text-white cursor-pointer transition-colors">Work</li>
            <li class="hover:text-white cursor-pointer transition-colors">Contact</li>
          </ul>
          <button class="self-start px-4 py-1.5 border border-white/40 text-white/80 text-sm hover:bg-white/10 transition-colors rounded-sm">
            Get Started
          </button>
        </div>
      </Transition>
    </nav>

    <!-- Background Canvas -->
    <canvas ref="canvasEl" class="absolute inset-0 w-full h-full" style="z-index: 0;" />

    <!-- Vignette -->
    <div class="absolute inset-0 z-10 pointer-events-none" style="background: radial-gradient(ellipse at center, transparent 40%, black 100%);" />

    <!-- Hero Content -->
    <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20 py-16">
      <div ref="heroBadge" class="opacity-0 mb-4">
        <UBadge color="neutral" variant="outline" class="text-white/50 text-sm uppercase tracking-widest">
          Your tagline here
        </UBadge>
      </div>
      <h1 ref="heroTitle" class="text-white/90 text-5xl font-bold leading-tight mb-6 opacity-0">
        Your Title<br />Goes Here
      </h1>
      <p ref="heroDesc" class="text-white/60 text-lg max-w-md mb-10 opacity-0">
        This is your hero description. Add a short sentence that summarizes what you do or offer.
      </p>
      <div ref="heroButtons" class="flex gap-4 opacity-0">
        <button class="px-6 py-2.5 bg-white/20 text-white/90 border border-white/30 hover:bg-white/30 transition-colors rounded-sm text-sm">
          Primary Action
        </button>
        <button class="px-6 py-2.5 text-white/60 hover:text-white transition-colors text-sm underline underline-offset-4">
          Secondary Action
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-leave-to {
  opacity: 0;
}
</style>
