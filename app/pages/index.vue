<script setup lang="ts">
import { ScrollTrigger } from "gsap/ScrollTrigger";
const { $gsap } = useNuxtApp();
const { width } = useWindowSize();
const isDesktop = computed(() => width.value >= 1024);

type MobileStrategy = "same" | "disable" | "simplify";
type TransitionMode = "parallax" | "reveal" | "pin" | "none";

interface MobileConfig {
  breakpoint: number;
  strategy: MobileStrategy;
}

interface TransitionConfig {
  parallaxY: number;
  revealY: number;
  overlayColor: string;
  mobile: MobileConfig;
}

type ConfigOverrides = Partial<Omit<TransitionConfig, "mobile">> & {
  mobile?: Partial<MobileConfig>;
};

function sectionTransition01(
  scopeOrConfig: Element | Document | ConfigOverrides = document,
  maybeConfig: ConfigOverrides = {}
) {
  const DEFAULT_CONFIG: TransitionConfig = {
    parallaxY: 300,
    revealY: 0,
    overlayColor: "black",
    mobile: {
      breakpoint: 768,
      strategy: "simplify",
    },
  };

  const isScope = (value: unknown): value is Element | Document =>
    value instanceof Element || value instanceof Document;

  const getConfig = (overrides: ConfigOverrides = {}): TransitionConfig => ({
    ...DEFAULT_CONFIG,
    ...overrides,
    mobile: {
      ...DEFAULT_CONFIG.mobile,
      ...(overrides.mobile || {}),
    },
  });

  const getYValue = (section: HTMLElement, fallback: number): number => {
    const yValue = parseFloat(section.dataset.stY || String(fallback));
    return Number.isNaN(yValue) ? fallback : yValue;
  };

  const getOpacityValue = (section: HTMLElement): number | null => {
    const opacityValue = parseFloat(section.dataset.stOpacity || "");
    if (Number.isNaN(opacityValue)) return null;
    return Math.max(0, Math.min(1, opacityValue));
  };

  const getOverlayColor = (section: HTMLElement, fallback: string): string =>
    section.dataset.stOverlay || fallback;

  const getOverlayElement = (section: HTMLElement, color: string): HTMLElement => {
    let overlay = section.querySelector<HTMLElement>("[data-st-overlay-el]");

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.setAttribute("data-st-overlay-el", "");
      overlay.setAttribute("aria-hidden", "true");
      section.append(overlay);
    }

    if (getComputedStyle(section).position === "static") {
      section.style.position = "relative";
    }

    section.style.isolation = "isolate";

    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      zIndex: "2",
      pointerEvents: "none",
      background: color,
      opacity: "0",
      willChange: "opacity",
    });

    return overlay;
  };

  const resetOverlay = (section: HTMLElement): void => {
    const existingOverlay = section.querySelector("[data-st-overlay-el]");
    if (existingOverlay) {
      $gsap.set(existingOverlay, { opacity: 0 });
    }
  };

  const getConfiguredYValue = (
    section: HTMLElement,
    mode: TransitionMode,
    config: TransitionConfig
  ): number => {
    if (mode === "reveal") return getYValue(section, config.revealY);
    if (mode === "parallax") return getYValue(section, config.parallaxY);
    return 0;
  };

  const isMobileViewport = (config: TransitionConfig): boolean =>
    window.matchMedia(`(max-width: ${config.mobile.breakpoint}px)`).matches;

  const getMobileStrategy = (config: TransitionConfig): MobileStrategy => {
    const allowed = new Set<string>(["same", "disable", "simplify"]);
    return allowed.has(config.mobile.strategy)
      ? config.mobile.strategy
      : DEFAULT_CONFIG.mobile.strategy;
  };

  const hasYMotion = (mode: TransitionMode, y: number): boolean =>
    mode === "parallax" || (mode === "reveal" && y !== 0);

  const resolveTransition = (
    mode: TransitionMode,
    y: number,
    strategy: MobileStrategy,
    isMobile: boolean
  ): { mode: TransitionMode; y: number } => {
    if (!isMobile || strategy === "same" || !hasYMotion(mode, y)) {
      return { mode, y };
    }

    if (strategy === "disable") {
      return { mode: "none", y: 0 };
    }

    if (mode === "parallax") {
      return { mode: "pin", y: 0 };
    }

    return { mode, y: 0 };
  };

  const scope = isScope(scopeOrConfig) ? scopeOrConfig : document;
  const config = getConfig(isScope(scopeOrConfig) ? maybeConfig : scopeOrConfig);
  const mobileStrategy = getMobileStrategy(config);
  const isMobile = isMobileViewport(config);
  const sections = scope.querySelectorAll<HTMLElement>("[data-st-01]");

  sections.forEach((section) => {
    const configuredMode = (section.getAttribute("data-st-01") ||
      "parallax") as TransitionMode;
    const configuredY = getConfiguredYValue(section, configuredMode, config);
    const opacity = getOpacityValue(section);
    const { mode, y } = resolveTransition(
      configuredMode,
      configuredY,
      mobileStrategy,
      isMobile
    );

    if (mode === "none") {
      resetOverlay(section);
      return;
    }

    if (mode === "reveal") {
      if (width.value < 1024) {
        resetOverlay(section);
        return;
      }

      const previousSection = section.previousElementSibling as HTMLElement | null;
      if (!previousSection) return;

      $gsap.set(previousSection, { zIndex: 1 });
      $gsap.set(section, {
        position: "sticky",
        bottom: 0,
        zIndex: 0,
      });

      if (opacity === null) resetOverlay(section);

      if (y === 0 && opacity === null) return;

      const timeline = $gsap.timeline({
        scrollTrigger: {
          trigger: previousSection,
          start: "bottom bottom",
          end: () => `+=${section.offsetHeight}`,
          scrub: true,
        },
      });

      if (y !== 0) {
        timeline.fromTo(
          section,
          {
            y,
          },
          {
            y: 0,
            ease: "none",
            force3D: true,
          },
          0
        );
      }

      if (opacity !== null) {
        const overlay = getOverlayElement(
          section,
          getOverlayColor(section, config.overlayColor)
        );
        $gsap.set(overlay, { opacity });
        timeline.to(overlay, { opacity: 0, ease: "none" }, 0);
      }

      return;
    }

    const nextSection = section.nextElementSibling as HTMLElement | null;
    if (!nextSection) return;

    if (mode === "pin") {
      ScrollTrigger.create({
        trigger: nextSection,
        start: "top bottom",
        end: "top top",
        pin: section,
        pinSpacing: false,
      });

      if (configuredMode === "parallax" && opacity !== null) {
        const overlay = getOverlayElement(
          section,
          getOverlayColor(section, config.overlayColor)
        );

        $gsap
          .timeline({
            scrollTrigger: {
              trigger: nextSection,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          })
          .to(overlay, { opacity, ease: "none" }, 0);
        return;
      }

      resetOverlay(section);
      return;
    }

    const scrollTrigger = {
      trigger: nextSection,
      start: "top bottom",
      end: "top top",
      scrub: true,
    };

    const tween = {
      y,
      ease: "none",
      force3D: true,
    };

    if (opacity === null) {
      resetOverlay(section);
      $gsap.to(section, { ...tween, scrollTrigger });
      return;
    }

    const overlay = getOverlayElement(
      section,
      getOverlayColor(section, config.overlayColor)
    );

    $gsap
      .timeline({ scrollTrigger })
      .to(section, tween, 0)
      .to(overlay, { opacity, ease: "none" }, 0);
  });
}

function refreshReveal() {
  document.querySelectorAll<HTMLElement>('[data-st-01="reveal"]').forEach((section) => {
    const prev = section.previousElementSibling as HTMLElement | null;

    // Kill only the ScrollTriggers that belong to this reveal pair
    if (prev) {
      ScrollTrigger.getAll()
        .filter((t) => t.vars.trigger === prev)
        .forEach((t) => t.kill());
      $gsap.set(prev, { clearProps: "zIndex" });
    }
    $gsap.set(section, { clearProps: "position,bottom,zIndex" });

    // Re-apply reveal logic (mirrors the reveal branch in sectionTransition01)
    if (width.value < 1024 || !prev) return;

    $gsap.set(prev, { zIndex: 1 });
    $gsap.set(section, { position: "sticky", bottom: 0, zIndex: 0 });

    const y = parseFloat(section.dataset.stY || "0") || 0;
    const rawOpacity = parseFloat(section.dataset.stOpacity || "");
    const opacity = Number.isNaN(rawOpacity) ? null : Math.max(0, Math.min(1, rawOpacity));

    if (y === 0 && opacity === null) return;

    const tl = $gsap.timeline({
      scrollTrigger: {
        trigger: prev,
        start: "bottom bottom",
        end: () => `+=${section.offsetHeight}`,
        scrub: true,
      },
    });

    if (y !== 0) {
      tl.fromTo(section, { y }, { y: 0, ease: "none", force3D: true }, 0);
    }

    if (opacity !== null) {
      const color = section.dataset.stOverlay || "black";
      let overlay = section.querySelector<HTMLElement>("[data-st-overlay-el]");
      if (overlay) {
        $gsap.set(overlay, { opacity });
        tl.to(overlay, { opacity: 0, ease: "none" }, 0);
      }
    }
  });
}

onMounted(async () => {
  $gsap.registerPlugin(ScrollTrigger);
  await nextTick();
  sectionTransition01();
});

watch(isDesktop, () => {
  refreshReveal();
});
</script>

<template>
  <main>
    <section id="hero" class="bg-black" data-st-01="parallax">
      <HomeHeroSection />
    </section>

    <section id="about" class="bg-white rounded-2xl" data-nav-light>
      <HomeAboutSection />
    </section>

    <section id="services" class="bg-black my-16 md:my-0" data-st-01="pin">
      <HomeServicesSection />
    </section>

    <section id="how-it-works" class="bg-white rounded-2xl" data-nav-light>
      <HomeHowItWorksSection />
    </section>

    <section id="contact" class="bg-black" data-st-01="reveal" data-st-y="0">
      <HomeContactSection />
    </section>
  </main>
</template>

<style>
main {
  position: relative;
}

section {
  position: relative;
  min-height: 100vh;
  padding: 0 2rem;
  z-index: 1;
  h2 {
    font-size: 3rem;
    line-height: 1;
    text-align: center;
  }
}

section[data-st-01]:not([data-st-01="pin"]) {
  will-change: transform;
}

</style>
