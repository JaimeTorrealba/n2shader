<script setup lang="ts">
const store = useFancyHeroesStore();

const backgroundOptions = [
  { label: 'Aurora', value: 'aurora' },
  { label: 'Floating Lines', value: 'floatingLines' },
];

const enabledWaves = computed(() => {
  const waves: Array<'top' | 'middle' | 'bottom'> = [];
  if (store.flEnableTop) waves.push('top');
  if (store.flEnableMiddle) waves.push('middle');
  if (store.flEnableBottom) waves.push('bottom');
  return waves;
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
    label: "soon",
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
          <h2 class="text-white text-lg font-semibold mb-1 text-center">Background Controls</h2>
        </template>
        <div class="flex flex-col gap-3">
          <div class="flex gap-2 items-center">
            Effect:
            <USelect v-model="store.activeBackground" :items="backgroundOptions" value-key="value" />
          </div>

          <!-- Aurora controls -->
          <template v-if="store.activeBackground === 'aurora'">
            <div class="flex gap-2 items-center">
              Amplitude:
              <USlider v-model="store.auroraAmplitude" :min="0" :max="3" :step="0.01" />
            </div>
            <div class="flex gap-2 items-center">
              Blend:
              <USlider v-model="store.auroraBlend" :min="0" :max="1" :step="0.01" />
            </div>
            <div class="flex gap-2 items-center">
              Speed:
              <USlider v-model="store.auroraSpeed" :min="0" :max="5" :step="0.01" />
            </div>
            <div class="flex gap-2 items-center">
              Intensity:
              <USlider v-model="store.auroraIntensity" :min="0" :max="2" :step="0.01" />
            </div>
            <div class="flex gap-2 items-center">
              Offset Y:
              <USlider v-model="store.auroraOffsetY" :min="-1" :max="1" :step="0.01" />
            </div>
            <div class="flex gap-2 items-center">
              Stop 1:
              <UPopover>
                <UButton color="neutral" variant="outline" size="sm">
                  <template #leading>
                    <span class="size-3 rounded-full" :style="{ backgroundColor: store.auroraColorStops[0] }" />
                  </template>
                  Choose color
                </UButton>
                <template #content>
                  <UColorPicker :model-value="store.auroraColorStops[0]" @update:model-value="store.auroraColorStops[0] = $event" class="p-2" />
                </template>
              </UPopover>
            </div>
            <div class="flex gap-2 items-center">
              Stop 2:
              <UPopover>
                <UButton color="neutral" variant="outline" size="sm">
                  <template #leading>
                    <span class="size-3 rounded-full" :style="{ backgroundColor: store.auroraColorStops[1] }" />
                  </template>
                  Choose color
                </UButton>
                <template #content>
                  <UColorPicker :model-value="store.auroraColorStops[1]" @update:model-value="store.auroraColorStops[1] = $event" class="p-2" />
                </template>
              </UPopover>
            </div>
            <div class="flex gap-2 items-center">
              Stop 3:
              <UPopover>
                <UButton color="neutral" variant="outline" size="sm">
                  <template #leading>
                    <span class="size-3 rounded-full" :style="{ backgroundColor: store.auroraColorStops[2] }" />
                  </template>
                  Choose color
                </UButton>
                <template #content>
                  <UColorPicker :model-value="store.auroraColorStops[2]" @update:model-value="store.auroraColorStops[2] = $event" class="p-2" />
                </template>
              </UPopover>
            </div>
          </template>

          <!-- Floating lines controls -->
          <template v-else-if="store.activeBackground === 'floatingLines'">
            <div class="flex gap-2 items-center">
              Lines:
              <USlider v-model="store.flLineCount" :min="1" :max="40" :step="1" />
            </div>
            <div class="flex gap-2 items-center">
              Distance:
              <USlider v-model="store.flLineDistance" :min="1" :max="20" :step="0.5" />
            </div>
            <div class="flex gap-2 items-center">
              Speed:
              <USlider v-model="store.flAnimationSpeed" :min="0" :max="5" :step="0.01" />
            </div>
            <div class="flex gap-2 items-center">
              <UToggle v-model="store.flInteractive" size="xs" /> Interactive
            </div>
          </template>
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
