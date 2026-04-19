<script setup lang="ts">
const open = ref(true);
const demoPage = useState("demo-page");
const sidebarKey = useState("sidebar-key", () => 0);

watch(open, () => {
  setTimeout(() => sidebarKey.value++, 300);
});
</script>

<template>
  <div class="flex flex-1 flex-row-reverse">
    <USidebar
      v-model:open="open"
      side="right"
      rail
      :ui="{
        container: 'h-full',
        inner: 'bg-elevated/25 divide-transparent',
        body: 'py-0 overflow-y-auto',
      }"
    >
      <template #header> </template>

      <template #default>
        <ContentRenderer v-if="demoPage" :value="demoPage" />
      </template>

      <template #footer> </template>
    </USidebar>

    <div class="flex-1 flex flex-col">
      <div
        class="h-(--ui-header-height) shrink-0 flex items-center px-4 border-b border-default justify-end"
      >
        <UButton
          icon="i-lucide-panel-left"
          color="neutral"
          variant="ghost"
          aria-label="Toggle sidebar"
          @click="open = !open"
        />
      </div>

      <div class="flex-1 overflow-hidden">
        <slot />
      </div>
    </div>
  </div>
</template>
