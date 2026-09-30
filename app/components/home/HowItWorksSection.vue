<template>
  <div ref="container" class="flex flex-col items-center justify-center gap-12 h-screen text-black">
    <div class="overflow-hidden">
      <h2 class="py-8 font-semibold">How it works</h2>
    </div>

    <!-- max-w-full: the row is ~700px of nowrap steps; never let it (or the JS-set width) outgrow the section -->
    <div ref="cardsViewport" class="max-w-full overflow-hidden">
      <div ref="cardsRow" class="flex items-center gap-6 text-lg">
        <template v-for="(card, i) in cards" :key="card.label">
          <div
            ref="cardEls"
            class="flex flex-col items-center gap-2 transition-colors duration-300 shrink-0 whitespace-nowrap"
            :class="activeIndex === i ? 'text-primary font-semibold' : 'text-black'"
          >
            <component :is="card.icon" class="w-6 h-6" />
            {{ card.label }}
          </div>
          <span v-if="i < cards.length - 1" ref="arrowEls" class="shrink-0">
            <ArrowRightIcon class="w-5 h-5 text-black" />
          </span>
        </template>
      </div>
    </div>

    <div ref="contentArea" class="relative w-full max-w-2xl h-40 opacity-0">
      <div
        v-for="card in cards"
        :key="card.label"
        ref="sections"
        class="absolute inset-0 flex flex-col gap-3 opacity-0"
      >
        <h3 class="text-[32px] leading-tight text-center">{{ card.title }}</h3>
        <p class="text-body-text text-center">{{ card.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, type Component } from "vue"
import { useResizeObserver, useWindowSize } from "@vueuse/core"
import { ArrowRightIcon } from "@heroicons/vue/24/outline"
import { InboxArrowDownIcon, PencilIcon, CubeTransparentIcon, WrenchScrewdriverIcon } from "@heroicons/vue/24/solid"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { PROCESS_STEPS, type ProcessStepId } from "#shared/homeContent"
import { showText } from "~/utils/animations"

const { $gsap } = useNuxtApp()

const container = ref<HTMLElement | null>(null)
const sections = ref<HTMLElement[]>([])
const cardEls = ref<HTMLElement[]>([])
const arrowEls = ref<HTMLElement[]>([])
const cardsViewport = ref<HTMLElement | null>(null)
const cardsRow = ref<HTMLElement | null>(null)
const contentArea = ref<HTMLElement | null>(null)
const activeIndex = ref(0)

const MOBILE_BREAKPOINT = 600
const { width: windowWidth } = useWindowSize()

const STEP_ICONS: Record<ProcessStepId, Component> = {
  discuss: InboxArrowDownIcon,
  agreement: PencilIcon,
  design: CubeTransparentIcon,
  aftercare: WrenchScrewdriverIcon,
}

const cards = PROCESS_STEPS.map((step) => ({ ...step, icon: STEP_ICONS[step.id] }))

// Set by the matchMedia in onMounted: with reduced motion, steps swap without moving
let isMotionReduced = false
let howItWorksMotion: ReturnType<typeof $gsap.matchMedia> | null = null
let stopClampOnResize: (() => void) | null = null

function getVisibleCount(): number {
  return windowWidth.value < MOBILE_BREAKPOINT ? 2 : 3
}

function getCardOffset(index: number): number {
  if (!cardsRow.value || !cardEls.value[index]) return 0
  const rowLeft = cardsRow.value.getBoundingClientRect().left
  const cardLeft = cardEls.value[index].getBoundingClientRect().left
  return cardLeft - rowLeft
}

function clampViewport() {
  if (!cardsViewport.value || !cardsRow.value) return
  if (windowWidth.value < MOBILE_BREAKPOINT) {
    const visibleCount = getVisibleCount()
    const lastVisibleCard = cardEls.value[visibleCount - 1]
    if (!lastVisibleCard) return
    const rowLeft = cardsRow.value.getBoundingClientRect().left
    const cardRight = lastVisibleCard.getBoundingClientRect().right
    cardsViewport.value.style.width = `${cardRight - rowLeft}px`
  } else {
    cardsViewport.value.style.width = ""
  }
}

function slideRow(index: number) {
  if (!cardsRow.value || windowWidth.value >= MOBILE_BREAKPOINT) return
  const maxShift = cards.length - getVisibleCount()
  const offset = getCardOffset(Math.min(index, maxShift))
  $gsap.to(cardsRow.value, { x: -offset, duration: isMotionReduced ? 0 : 0.4, ease: "power2.out" })
}

// Heading, then the step row left to right, then the active description
const playStepsEntrance = (heading: HTMLElement | null | undefined) => {
  if (heading) $gsap.set(heading, { yPercent: 200 })
  $gsap.set(cardEls.value, { opacity: 0, y: 12 })
  $gsap.set(arrowEls.value, { opacity: 0 })

  ScrollTrigger.create({
    trigger: container.value,
    start: "top 50%",
    once: true,
    onEnter: () => {
      const tl = $gsap.timeline()

      if (heading) tl.add(showText(heading))

      // interleave cards and arrows so they stagger together left to right
      const row = [...cardEls.value, ...arrowEls.value].sort((a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
      )
      tl.to(row, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.08 }, "-=0.4")

      tl.to(contentArea.value, { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.1")

      const idx = activeIndex.value
      if (sections.value[idx]) {
        tl.fromTo(
          sections.value[idx],
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
          "-=0.2"
        )
      }
    },
  })
}

watch(activeIndex, (newVal, oldVal) => {
  $gsap.killTweensOf(sections.value)
  if (sections.value[oldVal]) {
    $gsap.set(sections.value[oldVal], { opacity: 0 })
  }
  const nextSection = sections.value[newVal]
  if (nextSection && isMotionReduced) {
    $gsap.set(nextSection, { opacity: 1, y: 0 })
  } else if (nextSection) {
    $gsap.fromTo(
      nextSection,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
    )
  }
  slideRow(newVal)
})

onMounted(async () => {
  await nextTick()
  $gsap.registerPlugin(ScrollTrigger)

  clampViewport()
  stopClampOnResize = useResizeObserver(document.body, clampViewport).stop

  const heading = container.value?.querySelector<HTMLElement>("h2")

  howItWorksMotion = $gsap.matchMedia()
  howItWorksMotion.add(
    {
      reduceMotion: "(prefers-reduced-motion: reduce)",
      allowMotion: "(prefers-reduced-motion: no-preference)",
    },
    (context) => {
      const { reduceMotion } = context.conditions as { reduceMotion: boolean }
      isMotionReduced = reduceMotion

      if (reduceMotion) {
        // No entrance: the step row and the active description are simply there
        const visibleOnStart = [contentArea.value, sections.value[activeIndex.value]].filter(
          (el): el is HTMLElement => !!el
        )
        $gsap.set(visibleOnStart, { opacity: 1 })
      } else {
        playStepsEntrance(heading)
      }

      // Both modes: the pin only holds the section still while scrolling picks the step
      ScrollTrigger.create({
        trigger: container.value,
        start: "top top",
        end: "+=300%",
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const index = Math.min(cards.length - 1, Math.floor(self.progress * cards.length))
          if (index !== activeIndex.value) activeIndex.value = index
        },
      })
    }
  )
})

// Before unmount: the pin wraps the section in a spacer that must be removed while Vue still owns the DOM
onBeforeUnmount(() => {
  howItWorksMotion?.revert()
  howItWorksMotion = null
  stopClampOnResize?.()
})
</script>
