<script setup>
const { data: demos } = await useAsyncData('demos', () =>
  queryCollection('content').where('path', 'LIKE', '/demos/%').all()
)
</script>
<template>
  <NuxtPage v-if="$route.path !== '/demos'" />
  <template v-else>
    <h1>Demos</h1>
    <ul>
      <li v-for="demo in demos" :key="demo.path">
        <NuxtLink :to="demo.path">{{ demo.title }}</NuxtLink>
      </li>
    </ul>
  </template>
</template>