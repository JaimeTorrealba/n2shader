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
        root: '[--sidebar-width:20rem]',
        container: 'h-full',
        inner: 'bg-elevated/25 divide-transparent',
        body: 'py-0 overflow-y-auto',
      }"
    >
      <template #header> </template>

      <template #default>
        <ContentRenderer v-if="demoPage" :value="demoPage" class="content-wrapper" />
      </template>

      <template #footer> </template>
    </USidebar>

    <div class="flex-1 flex flex-col">
      <div
        class="h-(--ui-header-height) shrink-0 flex items-center px-4 border-b border-default justify-between"
      >
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          aria-label="Toggle sidebar"
          class="toggle-btn"
          to="/demos"
        />
        <UButton
          icon="i-lucide-panel-left"
          color="neutral"
          variant="ghost"
          aria-label="Toggle sidebar"
          class="toggle-btn"
          @click="open = !open"
        />
      </div>

      <div class="flex-1 overflow-hidden">
        <slot />
      </div>
    </div>
  </div>
</template>
<style scoped>
@media (max-width: 1024px) {
  .toggle-btn {
    animation: glow-pulse 2s ease-in-out infinite;
  }
}

@keyframes glow-pulse {
  0%, 100% {
    filter: drop-shadow(0 0 0px rgba(255, 255, 255, 0));
  }
  50% {
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 1));
  }
}

.content-wrapper :deep(h1),
.content-wrapper :deep(h2) {
  text-align: center;
  text-wrap: balance;
}
</style>
