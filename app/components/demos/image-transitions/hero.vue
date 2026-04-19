<script setup lang="ts">
import { ref, shallowRef, onMounted } from "vue";
import { Vector4, Mesh, ShaderMaterial, type IUniform, Texture } from "three";

interface SliderUniforms {
  progress: IUniform<number>;
  intensity: IUniform<number>;
  texture1: IUniform<Texture | null>;
  texture2: IUniform<Texture | null>;
  resolution: IUniform<Vector4>;
}
type SliderMaterial = ShaderMaterial & { uniforms: SliderUniforms };
import { gsap } from "gsap";
import { useTextures } from "@tresjs/cientos";
import { useWindowSize, watchOnce } from "@vueuse/core";
import fragmentEffectOne from "./shaders/fragment-effect-one.glsl";
import fragmentEffectTwo from "./shaders/fragment-effect-two.glsl";
import fragmentEffectThree from "./shaders/fragment-effect-three.glsl";
import fragmentEffectFour from "./shaders/fragment-effect-four.glsl";

const sidebarKey = useState<number>("sidebar-key");

const fragments = [fragmentEffectOne, fragmentEffectTwo, fragmentEffectThree, fragmentEffectFour];
const currentFragment = ref(0);

const { textures, isLoading } = useTextures([
  "/img/earth-one.jpg",
  "/img/forest-one.jpg",
  "/img/ocean-one.jpg",
]);

watchOnce(isLoading, (value) => {
    if (!value) {
        shader.uniforms.texture1.value = textures.value[0];
        shader.uniforms.texture2.value = textures.value[1];
        resize();
    }
})

const sliderRef = shallowRef<Mesh<any, SliderMaterial> | null>(null);
let current = ref(0);
const { width, height } = useWindowSize();

const shader = {
  uniforms: {
    progress: {  value: 0 },
    intensity: {  value: 1 },
    texture1: {  value: null }, // texture 1
    texture2: {  value: null }, // texture 2
    resolution: { value: new Vector4() },
  },
  vertexShader: `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`,
  fragmentShader: fragmentEffectOne,
};
const navigate = (direction: 1 | -1) => {
  const len = textures.value.length;
  const targetIndex = ((current.value + direction) % len + len) % len;
  const targetTexture = textures.value[targetIndex]!;
  sliderRef.value.material.uniforms.texture2.value = targetTexture;
  gsap.to(sliderRef.value.material.uniforms.progress, {
    value: 1,
    duration: 1,
    ease: "power2.out",
    onComplete: () => {
      current.value = targetIndex;
      sliderRef.value.material.uniforms.texture1.value = targetTexture;
      sliderRef.value.material.uniforms.progress.value = 0;
    },
  });
};



const resize = () => {
  if (!sliderRef.value || !textures.value[0]) return;
  const imageAspect = textures.value[0].image.height / textures.value[0].image.width;
  let a1;
  let a2;
  if (height.value / width.value > imageAspect) {
    a1 = (width.value / height.value) * imageAspect;
    a2 = 1;
  } else {
    a1 = 1;
    a2 = height.value / width.value / imageAspect;
  }

  sliderRef.value.material.uniforms.resolution.value.x = width.value;
  sliderRef.value.material.uniforms.resolution.value.y = height.value;
  sliderRef.value.material.uniforms.resolution.value.z = a1;
  sliderRef.value.material.uniforms.resolution.value.w = a2;
};

watch([width, height], () => {
  if (sliderRef.value && !isLoading.value) resize();
});


const swapShader = (index: number) => {
  if (index < 0 || index >= fragments.length) return;
  currentFragment.value = index;
  if (sliderRef.value) {
    sliderRef.value.material.fragmentShader = fragments[index]!;
    sliderRef.value.material.needsUpdate = true;
  }
};

const next = () => navigate(1);
const previous = () => navigate(-1);
const store = useImageTransitionsStore();
onMounted(() => {
  store.register({ next, previous, swapShader });
});
</script>
<template>
    <!-- Hero Section -->
    <section class="relative w-full h-[50vh] overflow-hidden">
      <nav
        class="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-black/30 backdrop-blur-sm border-b border-white/10"
      >
        <div class="text-white/90 font-semibold text-lg tracking-wide">Your Logo</div>
        <ul class="flex gap-8 text-white/70 text-sm">
          <li class="hover:text-white cursor-pointer transition-colors">Home</li>
          <li class="hover:text-white cursor-pointer transition-colors">About</li>
          <li class="hover:text-white cursor-pointer transition-colors">Work</li>
          <li class="hover:text-white cursor-pointer transition-colors">Contact</li>
        </ul>
        <button
          class="px-4 py-1.5 border border-white/40 text-white/80 text-sm hover:bg-white/10 transition-colors rounded-sm"
        >
          Get Started
        </button>
      </nav>
      <!-- Background Canvas scoped to this section -->
      <div class="absolute aspect-video inset-0 flex items-center justify-center" style="z-index: 0">
        <TresCanvas :key="sidebarKey" class="h-full ">
          <TresOrthographicCamera :position="[0, 0, 1]" :args="[-8, 8, 4.5, -4.5, -1, 10]" />
          <TresMesh ref="sliderRef">
            <TresPlaneGeometry :args="[16, 9]" />
            <TresShaderMaterial v-bind="shader" />
          </TresMesh>
        </TresCanvas>
      </div>

      <!-- Vignette -->
      <div class="absolute inset-0 z-10 pointer-events-none" style="background: radial-gradient(ellipse at center, transparent 40%, black 100%);"></div>

      <!-- Hero Content -->
      <div
        class="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20"
      >
        <UBadge color="neutral" variant="outline" class="text-white/50 text-sm uppercase tracking-widest mb-4">
          Your tagline here
        </UBadge>
        <h1 class="text-white/90 text-5xl font-bold leading-tight mb-6">
          Your Title<br />Goes Here
        </h1>
        <p class="text-white/60 text-lg max-w-md mb-10">
          This is your hero description. Add a short sentence that summarizes what you do
          or offer.
        </p>
        <div class="flex gap-4">
          <button
            class="px-6 py-2.5 bg-white/20 text-white/90 border border-white/30 hover:bg-white/30 transition-colors rounded-sm text-sm"
          >
            Primary Action
          </button>
          <button
            class="px-6 py-2.5 text-white/60 hover:text-white transition-colors text-sm underline underline-offset-4"
          >
            Secondary Action
          </button>
        </div>
      </div>
    </section>
</template>