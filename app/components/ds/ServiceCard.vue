<template>
  <div class="card-wrapper">
    <div class="card-inner">
      <div v-if="!image" class="w-full h-48 bg-white/10" />
      <img v-else :src="image" alt="" class="w-full h-48 object-cover" >
      <div class="p-6 flex flex-col gap-4">
        <h3 class="text-xl text-center font-semibold pb-4 min-h-18 flex items-center justify-center">{{ title }}</h3>
        <ul class="list-disc list-inside space-y-1">
          <li v-for="item in items" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  image?: string
  title: string
  items: string[]
}>()
</script>

<style scoped>
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.card-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 18rem;
  /* Narrow phones: shrink to the row instead of pushing the page sideways */
  max-width: 100%;
  height: 100%;
  border-radius: 1rem;
  padding: 2px;
}

.card-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: conic-gradient(
    from var(--angle),
    transparent 30%,
    #0070f3 50%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  animation: border-spin 3s linear infinite;
}

.card-wrapper:hover::before {
  opacity: 1;
}

/* The glow still shows on hover, it just doesn't spin */
@media (prefers-reduced-motion: reduce) {
  .card-wrapper::before {
    animation: none;
  }
}

@keyframes border-spin {
  to {
    --angle: 360deg;
  }
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #0d0d0d;
  border: 1px solid rgb(255 255 255 / 0.2);
}
</style>
