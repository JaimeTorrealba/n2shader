<script setup lang="ts">
const store = useFancyHeroesStore();

const shaderOptions = [
  { label: "Dissolve down", value: 0 },
  { label: "Center appear", value: 1 },
  { label: "Center dissolve", value: 2 },
  { label: "Dissolve left", value: 3 },
];

const selectedShader = ref(0);

watch(selectedShader, (value) => {
  store.swapShader?.(value);
});
</script>

<template>
  <UCard :ui="{ root: 'h-full flex flex-col', body: 'flex-1' }">
    <template #header>
      <h2 class="text-white text-lg font-semibold mb-1 text-center">Image Transitions</h2>
    </template>
    <p class="text-center text-sm text-gray-400">
      Full-screen GLSL shader transitions between images using a WebGL plane. Each effect
      warps UV coordinates differently — dissolving, expanding, or sliding the texture
      boundary during the swap. TO IMPROVE
    </p>
    <template #footer>
      <div class="flex justify-center items-center gap-2 mb-4">
        <p>Effect:</p>
        <USelect
          label
          v-model="selectedShader"
          :items="shaderOptions"
          value-key="value"
        />
      </div>
      <div class="flex justify-center items-center gap-2 mb-4">
        <UButton @click="store.next?.()">Next image</UButton>
        <UButton @click="store.previous?.()">Previous image</UButton>
      </div>
    </template>
  </UCard>
</template>
