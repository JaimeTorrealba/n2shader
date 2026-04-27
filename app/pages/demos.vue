<script setup>
const { data: demos } = await useAsyncData("demos", () =>
  queryCollection("content").where("path", "LIKE", "/demos/%").all()
);
</script>
<template>
  <NuxtPage v-if="$route.path !== '/demos'" />
  <template v-else>
    <main class="min-h-screen">
      <h1 class="text-center text-4xl font-bold my-4">
        Collection of demos to inspire you
      </h1>
      <UContainer class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
        <UPageCard
          v-for="demo in demos"
          :key="demo.path"
          :title="demo.title"
          :to="demo.path"
          spotlight
          spotlight-color="primary"
          orientation="vertical"
          reverse
        >
          <img :src="demo.img" :alt="demo.title" class="w-full" />
        </UPageCard>
      </UContainer>
    </main>
  </template>
</template>
