<script setup lang="ts">
const store = useImageTransitionsStore();

const shaderOptions = [
  { label: "Effect 1", value: 0 },
  { label: "Effect 2", value: 1 },
  { label: "Effect 3", value: 2 },
  { label: "Effect 4", value: 3 },
];

const selectedShader = ref(0);

watch(selectedShader, (value) => {
  store.swapShader?.(value);
});
</script>

<template>
  <section class="bg-gray-800 py-2 rounded-lg flex flex-col gap-1">
    <h2 class="text-white text-lg font-semibold mb-1">Image Transitions tweaks</h2>
    <div class="flex justify-between gap-0.5">
      <UButton @click="store.next?.()">Next image</UButton>
      <UButton @click="store.previous?.()">Previous image</UButton>
    </div>
    <USelect v-model="selectedShader" :items="shaderOptions" value-key="value" />
  </section>
</template>
