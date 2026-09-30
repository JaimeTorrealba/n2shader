<template>
  <!-- -mx-8 bleeds past the section's 2rem side padding so the scene is full width -->
  <div class="relative -mx-8 min-h-svh overflow-hidden">
    <ClientOnly>
      <HomeExperienceMetaballsCanvas />
    </ClientOnly>

    <!-- Top band only: the N2S monogram owns the centre (top edge ~41% down) and the balls rest below it.
         Stays inside the canvas parent so the pointer ball keeps following the cursor over the text.
         Hidden while html has .intro-pending (set before paint in nuxt.config.ts) so the SSR text
         doesn't flash before the intro plays. -->
    <div class="relative z-10 px-8 pt-16 text-shadow-halo motion-safe:[.intro-pending_&]:invisible md:pt-20">
      <!-- No kerning: the split letters can't kern, so the title would shift when the split reverts -->
      <h1
        ref="heroTitleRef"
        class="text-[clamp(3.5rem,min(9vw,14svh),9rem)] leading-[0.9] font-semibold tracking-tight text-white [font-kerning:none]"
      >
        N2Shader
      </h1>
      <!-- ! overrides index.vue's unlayered `section h2` rule (size, line-height, centring) -->
      <h2
        ref="heroLedeRef"
        class="mt-5 max-w-xl text-base! leading-relaxed! text-left! text-white/70 md:text-lg!"
      >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
      </h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SplitText } from "gsap/SplitText";

const { $gsap } = useNuxtApp();

const heroTitleRef = useTemplateRef<HTMLHeadingElement>("heroTitleRef");
const heroLedeRef = useTemplateRef<HTMLHeadingElement>("heroLedeRef");

let introMatchMedia: ReturnType<typeof $gsap.matchMedia> | null = null;

// Masked rise: the title letter by letter, then the lede line by line.
// Kept short with no delay: the text is hidden until this runs, so it's the page's LCP.
const playHeroIntro = (title: HTMLElement, lede: HTMLElement) => {
  const titleSplit = SplitText.create(title, { type: "lines,chars", mask: "lines" });
  const ledeSplit = SplitText.create(lede, { type: "lines", mask: "lines" });

  $gsap
    .timeline({
      defaults: { ease: "expo.out" },
      // Back to plain text: the masks would clip the halo, and split lines don't re-wrap on resize
      onComplete: () => {
        titleSplit.revert();
        ledeSplit.revert();
      },
    })
    .from(titleSplit.chars, { yPercent: 110, duration: 1, stagger: 0.03 })
    .from(ledeSplit.lines, { yPercent: 100, duration: 0.9, stagger: 0.08 }, 0.25);
};

onMounted(async () => {
  $gsap.registerPlugin(SplitText);
  await nextTick();
  // Split with the real font: Sentient's widths decide where the lede's lines break
  await document.fonts.ready;

  const title = heroTitleRef.value;
  const lede = heroLedeRef.value;
  if (title && lede) {
    introMatchMedia = $gsap.matchMedia();
    // Reduced motion gets no intro: the text is simply there
    introMatchMedia.add("(prefers-reduced-motion: no-preference)", () => playHeroIntro(title, lede));
  }

  // The from() tweens already hold the text below its masks, so the pre-paint guard can go
  document.documentElement.classList.remove("intro-pending");
});

onBeforeUnmount(() => {
  introMatchMedia?.revert();
  introMatchMedia = null;
});
</script>
