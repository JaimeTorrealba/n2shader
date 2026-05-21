<template>
  <div ref="container" class="flex flex-col items-center justify-center gap-12 h-screen text-black">
    <div class="overflow-hidden">
      <h2 class="py-8 font-semibold">How it works</h2>
    </div>

    <div ref="cardsViewport" class="overflow-hidden">
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
        v-for="(card, i) in cards"
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
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue"
import { useResizeObserver, useWindowSize } from "@vueuse/core"
import { ArrowRightIcon } from "@heroicons/vue/24/outline"
import { InboxArrowDownIcon, PencilIcon, CubeTransparentIcon, WrenchScrewdriverIcon } from "@heroicons/vue/24/solid"
import { ScrollTrigger } from "gsap/ScrollTrigger"
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
  $gsap.to(cardsRow.value, { x: -offset, duration: 0.4, ease: "power2.out" })
}

const cards = [
  {
    label: "Let's discuss",
    icon: InboxArrowDownIcon,
    title: "Your adventure start here",
    description: "After the first contact so we can start understanding your brand and requirements, then the team will send some references and ideas. This guide is free.",
  },
  {
    label: "We're serious now",
    icon: PencilIcon,
    title: "Gathering",
    description: "Once a direction is accepted a contract have to be sign, and for start working we require a 50% of the payment in advance. We start gathering all the information (assets, texts, etc).",
  },
  {
    label: "The exciting!",
    icon: CubeTransparentIcon,
    title: "The back and forth",
    description: "The team send design proposal, this then go back and forth a couple of times. Then in base of the selected design we provide 3 simples website.",
  },
  {
    label: "Post service",
    icon: WrenchScrewdriverIcon,
    title: "Post sell",
    description: "After the project is finish, we still commit with a generous plan of maintain projects.",
  },
]

let st: ScrollTrigger | undefined

watch(activeIndex, (newVal, oldVal) => {
  if (sections.value[oldVal]) {
    $gsap.set(sections.value[oldVal], { opacity: 0 })
  }
  if (sections.value[newVal]) {
    $gsap.fromTo(
      sections.value[newVal],
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
  useResizeObserver(document.body, clampViewport)

  const heading = container.value?.querySelector<HTMLElement>("h2")
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

      if (sections.value[0]) {
        tl.fromTo(
          sections.value[0],
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
          "-=0.2"
        )
      }
    },
  })

  st = ScrollTrigger.create({
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
})

onUnmounted(() => {
  st?.kill()
})
</script>
