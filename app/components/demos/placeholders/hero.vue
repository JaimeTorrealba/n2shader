<script setup lang="ts">
import { ref, watch } from "vue";
import { gsap } from "gsap";

const props = defineProps<{
  isLoaded: boolean;
  noVignette?: boolean;
  align?: "left" | "center" | "right";
  navShowCta?: boolean;
  navLogoAlign?: "left" | "center";
  navDetached?: boolean;
}>();

const alignClasses = computed(() => ({
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
}[props.align ?? "center"]));

const heroTitle = ref<HTMLElement | null>(null);
const heroDesc = ref<HTMLElement | null>(null);
const heroButtons = ref<HTMLElement | null>(null);
const heroBadge = ref<HTMLElement | null>(null);

watch(() => props.isLoaded, (loaded) => {
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
</script>

<template>
  <section class="relative w-full min-h-125 overflow-hidden">
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
      :detached="navDetached"
    />

    <!-- Background slot (canvas, shader, etc.) -->
    <slot />

    <!-- Vignette -->
    <div v-if="!props.noVignette" class="absolute inset-0 z-10 pointer-events-none" style="background: radial-gradient(ellipse at center, transparent 40%, black 100%);" />

    <!-- Hero Content -->
    <div class="absolute inset-0 flex flex-col justify-center px-4 z-20 py-16" :class="alignClasses">
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
.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-leave-to {
  opacity: 0;
}
</style>
