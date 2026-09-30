<template>
  <footer class="relative z-10 bg-black pt-8 pb-dock">
    <p class="text-center text-sm text-white/60">
      &copy; {{ currentYear }} N2Shader. All rights reserved.
    </p>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>
