<script setup lang="ts">
const store = useFancyHeroesStore();
const chip = computed(() => ({ backgroundColor: store.lightColor }));

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
          <h2 class="text-white text-lg font-semibold mb-1 text-center">Texture Controls</h2>
        </template>
        <div class="flex flex-col gap-2">
          <div class="flex gap-1">
            shadow details:
            <USlider
              v-model="store.aoMapIntensity"
              :min="0"
              :max="2"
              :step="0.01"
              label="AO Map Intensity"
            />
          </div>
          <div class="flex gap-1">
            Shadow:
            <USlider
              v-model="store.normalScale"
              :min="0"
              :max="2"
              :step="0.01"
              label="Normal Scale"
            />
          </div>
          <div class="flex gap-1">
            Roughness:
            <USlider
              v-model="store.roughness"
              :min="0"
              :max="1"
              :step="0.01"
              label="Roughness"
            />
          </div>
          <div class="flex gap-1">
            Light intensity
            <USlider
              v-model="store.lightIntensity"
              :min="0"
              :max="10"
              :step="0.1"
              label="Light Intensity"
            />
          </div>
          <div class="flex gap-2 items-center">
            Light color:
            <UPopover>
              <UButton label="Choose color" color="neutral" variant="outline" size="sm">
                <template #leading>
                  <span :style="chip" class="size-3 rounded-full" />
                </template>
              </UButton>
              <template #content>
                <UColorPicker v-model="store.lightColor" class="p-2" />
              </template>
            </UPopover>
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
