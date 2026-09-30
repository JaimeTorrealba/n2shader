<script lang="ts" setup></script>

<template>
  <div>
    <!-- Single root: Nuxt layouts need one for layout transitions -->
    <CommonNavbar />
    <slot />
    <CommonFooter />
  </div>
</template>
