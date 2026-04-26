<script setup lang="ts">
const store = useFancyHeroesStore();
</script>

<template>
  <DemosPlaceholdersHero :is-loaded="true" noVignette align="right">
    <DemosFancyHeroesVueBitsAurora
      v-if="store.activeBackground === 'aurora'"
      :color-stops="store.auroraColorStops"
      :amplitude="store.auroraAmplitude"
      :blend="store.auroraBlend"
      :speed="store.auroraSpeed"
      :intensity="store.auroraIntensity"
      :offset-y="store.auroraOffsetY"
      class="w-full h-full"
    />
    <DemosFancyHeroesVueBitsFloatingLines
      v-else-if="store.activeBackground === 'floatingLines'"
      :enabled-waves="['top', 'middle', 'bottom']"
      :line-count="store.flLineCount"
      :line-distance="store.flLineDistance"
      :animation-speed="store.flAnimationSpeed"
      :interactive="store.flInteractive"
    />
  </DemosPlaceholdersHero>
  <section class="flex flex-col gap-2 items-center md:flex-row p-8 min-h-96">
    <div class="w-1/2 h-full">
      <DemosFancyHeroesBackgroundsTweakpane />
    </div>
    <div class="w-1/2 h-full">TEXT</div>
  </section>
</template>
