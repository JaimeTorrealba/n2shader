<script setup lang="ts">
const store = useImageTransitionsStore();

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
  <section class="bg-gray-800 p-2 rounded-lg flex flex-col gap-2">
    <h2 class="text-white text-lg font-semibold mb-1 text-center">Image Transitions tweaks</h2>
    <div class="flex justify-around gap-0.5">
      <UButton @click="store.next?.()">Next image</UButton>
      <UButton @click="store.previous?.()">Previous image</UButton>
    </div>
    <USelect v-model="selectedShader" :items="shaderOptions" value-key="value" />
  </section>
</template>
