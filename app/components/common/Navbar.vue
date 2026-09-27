<template>
  <nav
    ref="dockRef"
    aria-label="Main navigation"
    class="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-end gap-3 rounded-2xl border-[0.5px] p-2 backdrop-blur-md transition-colors duration-300"
    :class="isLight ? 'bg-black/10 border-black/30' : 'bg-white/10 border-white/60'"
    :style="{ height: `${BASE_ITEM_SIZE + 16}px` }"
    @pointermove="magnifyItems"
    @pointerleave="resetItems"
  >
    <a
      v-for="link in links"
      ref="itemRefs"
      :key="link.href"
      :href="link.href"
      :aria-label="link.label"
      class="relative flex shrink-0 items-center justify-center rounded-xl border-[0.5px] outline-none transition-colors duration-300 focus-visible:ring-2"
      :class="isLight
        ? 'bg-black/5 border-black/20 text-black focus-visible:ring-black'
        : 'bg-white/10 border-white/30 text-white focus-visible:ring-white'"
      :style="{ width: `${BASE_ITEM_SIZE}px`, height: `${BASE_ITEM_SIZE}px` }"
      @click.prevent="scrollToSection(link.href)"
      @pointerenter="showLabel"
      @pointerleave="hideLabel"
      @focus="showLabelOnKeyboardFocus"
      @blur="hideLabel"
    >
      <component :is="link.icon" class="size-1/2" aria-hidden="true" />
      <span
        data-dock-label
        aria-hidden="true"
        class="pointer-events-none invisible absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/20 bg-black px-2 py-0.5 text-xs text-white opacity-0"
      >
        {{ link.label }}
      </span>
    </a>
  </nav>
</template>

<script setup lang="ts">
import {
  EnvelopeIcon,
  HomeIcon,
  QueueListIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";

const BASE_ITEM_SIZE = 48;
const MAGNIFIED_ITEM_SIZE = 68;
const MAGNIFY_RADIUS = 160;
// Distance from the viewport bottom used to sample the section behind the dock
const THEME_SAMPLE_OFFSET = 40;

const links = [
  { label: "About", href: "#about", icon: UserGroupIcon },
  { label: "Expertise", href: "#services", icon: SparklesIcon },
  { label: "Home", href: "#hero", icon: HomeIcon },
  { label: "How it works", href: "#how-it-works", icon: QueueListIcon },
  { label: "Contact", href: "#contact", icon: EnvelopeIcon },
];

const { $gsap } = useNuxtApp();
const reducedMotion = usePreferredReducedMotion();
const { width: windowWidth, height: windowHeight } = useWindowSize();
const dockRef = useTemplateRef<HTMLElement>("dockRef");
const itemRefs = useTemplateRef<HTMLElement[]>("itemRefs");
const isLight = ref(false);

type ItemResizer = {
  el: HTMLElement;
  setWidth: gsap.QuickToFunc;
  setHeight: gsap.QuickToFunc;
};

let gsapContext: gsap.Context | null = null;
let itemResizers: ItemResizer[] = [];

// Cosine falloff: full size under the pointer, easing smoothly back to base at the radius
const getMagnifiedSize = (pointerX: number, item: HTMLElement): number => {
  const { left, width } = item.getBoundingClientRect();
  const distance = Math.min(Math.abs(pointerX - (left + width / 2)), MAGNIFY_RADIUS);
  const falloff = 0.5 * (1 + Math.cos((Math.PI * distance) / MAGNIFY_RADIUS));
  return BASE_ITEM_SIZE + (MAGNIFIED_ITEM_SIZE - BASE_ITEM_SIZE) * falloff;
};

const magnifyItems = (event: PointerEvent) => {
  if (event.pointerType !== "mouse" || reducedMotion.value === "reduce") return;
  // Read every rect before writing so the loop never forces a layout per item
  const targetSizes = itemResizers.map(({ el }) => getMagnifiedSize(event.clientX, el));
  itemResizers.forEach(({ setWidth, setHeight }, index) => {
    setWidth(targetSizes[index]!);
    setHeight(targetSizes[index]!);
  });
};

const resetItems = () => {
  itemResizers.forEach(({ setWidth, setHeight }) => {
    setWidth(BASE_ITEM_SIZE);
    setHeight(BASE_ITEM_SIZE);
  });
};

const toggleLabel = (item: HTMLElement, isVisible: boolean) => {
  const label = item.querySelector("[data-dock-label]");
  if (!label || !gsapContext) return;
  const shouldMove = isVisible && reducedMotion.value !== "reduce";
  gsapContext.add(() => {
    $gsap.to(label, {
      autoAlpha: isVisible ? 1 : 0,
      y: shouldMove ? -6 : 0,
      duration: 0.2,
      ease: isVisible ? "power3.out" : "power2.in",
      overwrite: true,
    });
  });
};

const showLabel = (event: Event) => toggleLabel(event.currentTarget as HTMLElement, true);
const hideLabel = (event: Event) => toggleLabel(event.currentTarget as HTMLElement, false);

// Mouse clicks also focus the link; only keyboard focus should pin the label open
const showLabelOnKeyboardFocus = (event: FocusEvent) => {
  const item = event.currentTarget as HTMLElement;
  if (item.matches(":focus-visible")) toggleLabel(item, true);
};

const scrollToSection = (href: string) => {
  const duration = reducedMotion.value === "reduce" ? 0 : 1;

  if (href === "#hero") {
    $gsap.to(window, { duration, scrollTo: { y: 0 }, ease: "power2.inOut" });
    return;
  }

  const section = document.querySelector<HTMLElement>(href);
  if (!section) return;

  let targetY: number;
  if (getComputedStyle(section).position === "sticky") {
    targetY = document.documentElement.scrollHeight - windowHeight.value;
  } else {
    // If GSAP wrapped the element in a pin-spacer, use the spacer — it always
    // holds the correct document-flow position regardless of pin state
    const anchor = section.parentElement?.classList.contains("pin-spacer")
      ? section.parentElement
      : section;
    targetY = anchor.getBoundingClientRect().top + window.scrollY;
  }

  $gsap.to(window, { duration, scrollTo: { y: targetY }, ease: "power2.inOut" });
};

// Hit-test the stack behind the dock so pinned, sticky and revealed sections all resolve correctly
const updateIsLight = () => {
  const sampleY = windowHeight.value - THEME_SAMPLE_OFFSET;
  const sectionBehindDock = document
    .elementsFromPoint(windowWidth.value / 2, sampleY)
    .map((el) => el.closest<HTMLElement>("section[id]"))
    .find((section) => section !== null);
  if (sectionBehindDock) isLight.value = sectionBehindDock.hasAttribute("data-nav-light");
};

useEventListener("scroll", updateIsLight, { passive: true });
watch([windowWidth, windowHeight], updateIsLight);

onMounted(() => {
  gsapContext = $gsap.context(() => {
    itemResizers = (itemRefs.value ?? []).map((el) => ({
      el,
      setWidth: $gsap.quickTo(el, "width", { duration: 0.35, ease: "power3.out" }),
      setHeight: $gsap.quickTo(el, "height", { duration: 0.35, ease: "power3.out" }),
    }));
  }, dockRef.value ?? undefined);
  updateIsLight();
});

onUnmounted(() => {
  gsapContext?.revert();
  itemResizers = [];
});
</script>
