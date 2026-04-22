<script setup lang="ts">
const props = defineProps<{
  showCta?: boolean;
  logoAlign?: "left" | "center";
  detached?: boolean;
}>();

const mobileMenuOpen = ref(false);

const navClasses = computed(() =>
  props.detached
    ? "w-full bg-black/30 backdrop-blur-sm border-b border-white/10"
    : "absolute top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-sm border-b border-white/10"
);
</script>

<template>
  <nav :class="navClasses">
    <div class="flex items-center px-8 py-4" :class="logoAlign === 'center' ? 'justify-center relative' : 'justify-between'">
      <div class="text-white/90 font-semibold text-lg tracking-wide" :class="logoAlign === 'center' ? 'absolute left-1/2 -translate-x-1/2' : ''">
        Your Logo
      </div>

      <!-- Desktop links -->
      <ul class="hidden md:flex gap-8 text-white/70 text-sm" :class="logoAlign === 'center' ? 'ml-auto' : ''">
        <li class="hover:text-white cursor-pointer transition-colors">Home</li>
        <li class="hover:text-white cursor-pointer transition-colors">About</li>
        <li class="hover:text-white cursor-pointer transition-colors">Work</li>
        <li class="hover:text-white cursor-pointer transition-colors">Contact</li>
      </ul>

      <button
        v-if="showCta !== false"
        class="hidden md:block px-4 py-1.5 border border-white/40 text-white/80 text-sm hover:bg-white/10 transition-colors rounded-sm"
        :class="logoAlign === 'center' ? 'ml-4' : ''"
      >
        Get Started
      </button>

      <!-- Hamburger -->
      <button class="md:hidden flex flex-col gap-1.5 p-1 text-white/80 ml-auto" @click="mobileMenuOpen = !mobileMenuOpen">
        <span class="block w-6 h-px bg-current transition-all" :class="mobileMenuOpen ? 'rotate-45 translate-y-2' : ''" />
        <span class="block w-6 h-px bg-current transition-all" :class="mobileMenuOpen ? 'opacity-0' : ''" />
        <span class="block w-6 h-px bg-current transition-all" :class="mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''" />
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition name="mobile-menu">
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-white/10 px-8 py-4 flex flex-col gap-4">
        <ul class="flex flex-col gap-4 text-white/70 text-sm">
          <li class="hover:text-white cursor-pointer transition-colors">Home</li>
          <li class="hover:text-white cursor-pointer transition-colors">About</li>
          <li class="hover:text-white cursor-pointer transition-colors">Work</li>
          <li class="hover:text-white cursor-pointer transition-colors">Contact</li>
        </ul>
        <button v-if="showCta !== false" class="self-start px-4 py-1.5 border border-white/40 text-white/80 text-sm hover:bg-white/10 transition-colors rounded-sm">
          Get Started
        </button>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
