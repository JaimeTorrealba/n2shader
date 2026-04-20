<script setup lang="ts">
definePageMeta({ layout: "demos" });

const route = useRoute();

const { data: page } = await useAsyncData("page-" + route.path, () => {
  return queryCollection("content").path(route.path).first();
});

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}

const slug = page.value?.stem.split("/").pop();
const component = defineAsyncComponent(() =>
  import(`../../components/demos/${slug}/index.vue`).catch(() =>
    import(`../../components/demos/${slug}.vue`)
  )
);

useState("demo-page", () => page.value);
</script>

<template>
  <ClientOnly>
    <component :is="component" v-if="page" />
  </ClientOnly>
</template>
