<script setup lang="ts">
const store = useFancyHeroesStore();

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
          <h2 class="text-white text-lg font-semibold mb-1 text-center">
            Model Controls
          </h2>
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
            <USlider
              v-model="store.rotationSpeed"
              :min="0"
              :max="3"
              :step="0.01"
              :disabled="!store.autoRotate"
            />
          </div>
          <div class="flex gap-1">
            Light Intensity:
            <USlider v-model="store.hdriIntensity" :min="0" :max="3" :step="0.01" />
          </div>
        </div>
      </UCard>
    </div>
    <div class="w-1/2 h-full">
      <UCard>
        <UAccordion :items="accordionItems" />
      </UCard>
    </div>
  </section>
</template>
