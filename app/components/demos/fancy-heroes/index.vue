<script setup lang="ts"></script>

<template>
  <div class="w-full">
    <DemosFancyHeroesModelHero />

    SEPARATOR
    <DemosFancyHeroesImageTransitions />
    <section class="flex flex-col gap-2 items-center md:flex-row p-8 min-h-96">
      <div class="w-1/2 h-full">
        <DemosFancyHeroesImageTransitionsTweakpane />
      </div>
      <div class="w-1/2 h-full">
        TEXT
      </div>
    </section>
    SEPARATOR
    <DemosFancyHeroesTexture />
    <section class="flex flex-col gap-2 items-center md:flex-row p-8 min-h-96">
      <div class="w-1/2 h-full">
        <DemosFancyHeroesTextureTweakpane />
      </div>
      <div class="w-1/2 h-full">
        TEXT
      </div>
    </section>
    SEPARATOR
  </div>
</template>
