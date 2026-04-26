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

const accordionItems = [
  {
    label: "When is this hero a good fit?",
    content: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia esse aperiam excepturi distinctio nisi quaerat architecto hic, culpa adipisci facere, inventore ratione maxime! Tempore possimus, repudiandae nostrum aut soluta magni.",
  },
  {
    label: "What interactions and animations are possible?",
    content:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia esse aperiam excepturi distinctio nisi quaerat architecto hic, culpa adipisci facere, inventore ratione maxime! Tempore possimus, repudiandae nostrum aut soluta magni.",
  },
  {
    label: "How does it perform on mobile and other devices?",
    content:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia esse aperiam excepturi distinctio nisi quaerat architecto hic, culpa adipisci facere, inventore ratione maxime! Tempore possimus, repudiandae nostrum aut soluta magni.",
  },
  {
    label: "The sky is the limit",
    content:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia esse aperiam excepturi distinctio nisi quaerat architecto hic, culpa adipisci facere, inventore ratione maxime! Tempore possimus, repudiandae nostrum aut soluta magni.",
  },
  {
    label: "disclaimer",
    content:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia esse aperiam excepturi distinctio nisi quaerat architecto hic, culpa adipisci facere, inventore ratione maxime! Tempore possimus, repudiandae nostrum aut soluta magni.",
  },
  {
    label: "need inspiration?",
    content:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia esse aperiam excepturi distinctio nisi quaerat architecto hic, culpa adipisci facere, inventore ratione maxime! Tempore possimus, repudiandae nostrum aut soluta magni.",
  },
];
</script>

<template>
  <section class="flex flex-col gap-2 items-start md:flex-row p-8 min-h-96">
    <div class="w-1/2 h-full">
      <UCard class="h-full" :ui="{ root: 'h-full flex flex-col', body: 'flex-1' }">
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
    </div>
    <div class="w-1/2 h-full">
      <UCard>
        <UAccordion :items="accordionItems" />
      </UCard>
    </div>
  </section>
</template>
