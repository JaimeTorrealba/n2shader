<script setup lang="ts">
definePageMeta({ layout: "demos" });

const route = useRoute();
const slug = Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug;

const demoModules = import.meta.glob("../../components/**/index.vue");
const componentPath = `../../components/demos/${slug}/index.vue`;
const component = defineAsyncComponent(
  () => (demoModules[componentPath] ?? (() => Promise.reject(new Error(`Demo not found: ${componentPath}`))))() as Promise<{ default: Component }>
);
</script>

<template>
  <ClientOnly>
    <component :is="component" />
  </ClientOnly>
</template>
