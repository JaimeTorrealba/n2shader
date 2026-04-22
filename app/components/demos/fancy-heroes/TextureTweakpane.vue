<script setup lang="ts">
const store = useFancyHeroesTextureStore();
const chip = computed(() => ({ backgroundColor: store.lightColor }));
</script>

<template>
  <UCard class="h-full" variant="subtle" :ui="{ root: 'h-full flex flex-col', body: 'flex-1' }">
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
</template>
