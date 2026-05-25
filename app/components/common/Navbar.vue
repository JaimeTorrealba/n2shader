<template>
  <header class="fixed top-0 left-0 right-0 z-50 flex justify-center py-4 pointer-events-none">
    <nav
      class="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md transition-colors duration-300"
      :class="isLight
        ? 'bg-black/10 border-[0.5px] border-black/30'
        : 'bg-white/10 border-[0.5px] border-white/60'"
      aria-label="Main navigation"
    >
      <a
        v-for="link in links"
        :key="link.href"
        :href="link.href"
        class="px-3 py-1.5 font-semibold rounded-full hover:scale-110 cursor-pointer"
        style="transition: color 150ms ease-out, scale 150ms ease-out"
        :class="isLight ? 'text-black' : 'text-white'"
        @click.prevent="scrollTo(link.href)"
      >
        {{ link.label }}
      </a>
    </nav>
  </header>
</template>

<script setup lang="ts">
const links = [
  { label: "About", href: "#about" },
  { label: "Expertise", href: "#services" },
  { label: "LOGO", href: "#hero" },
  { label: "How", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

const isLight = ref(false);

const { $gsap } = useNuxtApp();

const NAVBAR_HEIGHT = 56;

function scrollTo(href: string) {
  if (href === "#hero") {
    $gsap.to(window, { duration: 1, scrollTo: { y: 0 }, ease: "power2.inOut" });
    return;
  }

  const el = document.querySelector(href) as HTMLElement | null;
  if (!el) return;

  const pos = getComputedStyle(el).position;
  let y: number;

  if (pos === "sticky") {
    y = document.documentElement.scrollHeight - window.innerHeight;
  } else {
    // If GSAP wrapped the element in a pin-spacer, use the spacer — it always
    // holds the correct document-flow position regardless of pin state
    const anchor = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
    y = anchor.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
  }

  $gsap.to(window, { duration: 1, scrollTo: { y }, ease: "power2.inOut" });
}

function updateIsLight() {
  const checkY = NAVBAR_HEIGHT - 30;
  const sections = Array.from(document.querySelectorAll<HTMLElement>("section[id]")).reverse();
  for (const section of sections) {
    if (getComputedStyle(section).position === "sticky") continue;
    const { top, bottom } = section.getBoundingClientRect();
    if (top <= checkY && bottom > checkY) {
      isLight.value = section.hasAttribute("data-nav-light");
      return;
    }
  }
}

onMounted(() => {
  window.addEventListener("scroll", updateIsLight, { passive: true });
  updateIsLight();
  onUnmounted(() => window.removeEventListener("scroll", updateIsLight));
});
</script>
