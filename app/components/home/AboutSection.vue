<template>
  <div ref="container" class="flex flex-col items-center justify-center h-screen gap-8">
    <div class="overflow-hidden">
      <h2 class="text-black font-semibold">About</h2>
    </div>
    <div class="sm:max-w-2/3 md:max-w-1/2">
      <p class="text-xl text-body-text text-center">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nesciunt est voluptatum
        fuga at ab debitis eligendi dolores quasi officiis, aliquam suscipit nisi numquam
        rem, odio explicabo consectetur natus ut soluta.
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

const { $gsap } = useNuxtApp();
const container = ref<HTMLElement | null>(null);

let aboutMotion: ReturnType<typeof $gsap.matchMedia> | null = null;

onMounted(async () => {
  await nextTick();
  $gsap.registerPlugin(ScrollTrigger, SplitText);

  const el = container.value;
  if (!el) return;

  const heading = el.querySelector<HTMLElement>("h2");
  const body = el.querySelector<HTMLElement>("p");

  if (!heading || !body) return;

  aboutMotion = $gsap.matchMedia();
  // Reduced motion gets no reveal: the heading and text are simply there
  aboutMotion.add("(prefers-reduced-motion: no-preference)", () => {
    const master = $gsap.timeline();
    const splitBody = new SplitText(body, { type: "chars" });

    $gsap.set(splitBody.chars, { color: "#f7f7f7" });
    $gsap.set(heading, { yPercent: 200 });

    ScrollTrigger.create({
      trigger: el,
      start: "top 50%",
      once: true,
      onEnter: () => {
        master.add(showText(heading)).to(
          splitBody.chars,
          {
            color: "#7a7060",
            ease: "Power4.out",
            stagger: 0.015,
            duration: 0.5,
            onComplete: () => splitBody.revert(),
          },
          "-=0.25"
        );
      },
    });
  });
});

onBeforeUnmount(() => {
  aboutMotion?.revert();
  aboutMotion = null;
});
</script>
