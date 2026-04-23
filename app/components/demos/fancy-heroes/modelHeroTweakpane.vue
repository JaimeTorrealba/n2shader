<script setup lang="ts">
const store = useModelHeroStore();
</script>

<template>
  <UCard class="h-full" :ui="{ root: 'h-full flex flex-col', body: 'flex-1' }">
    <template #header>
      <h2 class="text-white text-lg font-semibold mb-1 text-center">Model Controls</h2>
    </template>
    <div class="flex flex-col gap-2">
      <div class="flex gap-1">
        Scale:
        <USlider v-model="store.modelScale" :min="0.1" :max="3" :step="0.01" />
      </div>
      <div class="flex gap-1">
        Position X:
        <USlider v-model="store.modelX" :min="-5" :max="5" :step="0.01" />
      </div>
      <div class="flex gap-1">
        Position Y:
        <USlider v-model="store.modelY" :min="-5" :max="5" :step="0.01" />
      </div>
      <div class="flex gap-1">
        Rotation Speed:
        <USlider v-model="store.rotationSpeed" :min="0" :max="3" :step="0.01" :disabled="!store.autoRotate" />
      </div>
      <div class="flex gap-1">
        Light Intensity:
        <USlider v-model="store.hdriIntensity" :min="0" :max="3" :step="0.01" />
      </div>
    </div>
  </UCard>
</template>
