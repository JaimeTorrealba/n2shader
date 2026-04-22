<script setup lang="ts"></script>

<template>
  <div class="w-full">
    <DemosFancyHeroesImageTransitions />
    <section class="flex flex-col gap-2 items-center md:flex-row p-8 min-h-96">
      <div class="w-1/2 h-full">
        <DemosFancyHeroesImageTransitionsTweakpane />
      </div>
      <div class="w-1/2 h-full">
        <DemosFancyHeroesTextureTweakpane />
      </div>
    </section>
    <DemosFancyHeroesTexture />

    SEPARATOR

    <!-- Future sections go here in normal flow -->
  </div>
</template>
