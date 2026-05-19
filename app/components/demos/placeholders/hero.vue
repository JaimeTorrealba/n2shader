<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const props = defineProps<{
  title: string;
  description: string;
  isLoaded: boolean;
  noVignette?: boolean;
  align?: "left" | "center" | "right";
  navShowCta?: boolean;
  navLogoAlign?: "left" | "center";
  navSolidBg?: boolean;
}>();

const alignClasses = computed(() => ({
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
}[props.align ?? "center"]));

const heroSection = ref<HTMLElement | null>(null);
const heroTitle = ref<HTMLElement | null>(null);
const heroDesc = ref<HTMLElement | null>(null);
const heroButtons = ref<HTMLElement | null>(null);
const heroBadge = ref<HTMLElement | null>(null);

let trigger: ScrollTrigger | null = null;
let animated = false;

function playAnimation() {
  if (animated) return;
  animated = true;
  gsap.fromTo(
    [heroBadge.value, heroTitle.value, heroDesc.value, heroButtons.value],
    { y: 24 },
    { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.15 }
  );
}

onMounted(() => {
  trigger = ScrollTrigger.create({
    trigger: heroSection.value,
    start: "top 85%",
    onEnter: () => { if (props.isLoaded) playAnimation(); },
  });
});

watch(() => props.isLoaded, (loaded) => {
  if (!loaded) return;
  if (heroSection.value && ScrollTrigger.isInViewport(heroSection.value)) playAnimation();
});

onUnmounted(() => { trigger?.kill(); });
</script>

<template>
  <section ref="heroSection" class="relative w-full aspect-video max-h-screen md:max-h-[75vh] overflow-hidden">
    <Transition name="fade">
      <div v-if="!isLoaded" class="absolute inset-0 z-30 bg-black flex items-center justify-center gap-2">
        <span class="w-2 h-2 rounded-full bg-white/40 animate-bounce [animation-delay:-0.3s]" />
        <span class="w-2 h-2 rounded-full bg-white/40 animate-bounce [animation-delay:-0.15s]" />
        <span class="w-2 h-2 rounded-full bg-white/40 animate-bounce" />
      </div>
    </Transition>

    <DemosPlaceholdersNav
      :show-cta="navShowCta"
      :logo-align="navLogoAlign"
      :solid-bg="navSolidBg"
    />

    <!-- Background slot (canvas, shader, etc.) -->
    <slot />

    <!-- Vignette -->
    <div v-if="!props.noVignette" class="absolute inset-0 z-10 pointer-events-none" style="background: radial-gradient(ellipse at center, transparent 40%, black 100%);" />

    <!-- Content area darkening gradient -->
    <div
      class="absolute inset-0 z-10 pointer-events-none"
      :style="{
        background: align === 'right'
          ? 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(0,0,0,0.55) 0%, transparent 100%)'
          : align === 'left'
          ? 'radial-gradient(ellipse 60% 80% at 20% 50%, rgba(0,0,0,0.55) 0%, transparent 100%)'
          : 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(0,0,0,0.55) 0%, transparent 100%)'
      }"
    />

    <!-- Hero Content -->
    <div class="absolute inset-0 flex flex-col justify-center px-4 z-20 py-16" :class="alignClasses">
      <div ref="heroBadge" class="opacity-0 mb-4">
        <UBadge color="neutral" variant="outline" class="text-white/50 text-sm uppercase tracking-widest">
          Your tagline here
        </UBadge>
      </div>
      <h1 ref="heroTitle" class="text-white/90 text-5xl font-bold leading-tight mb-6 opacity-0">
        {{ title }}
      </h1>
      <p ref="heroDesc" class="text-white/60 text-lg max-w-md mb-10 opacity-0" style="text-shadow: 0 1px 8px rgba(0,0,0,0.9)">
        {{ description }}
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
.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-leave-to {
  opacity: 0;
}
</style>
