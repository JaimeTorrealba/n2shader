<template>
  <div ref="container" class="flex flex-col items-center justify-center gap-10 min-h-screen">
    <div class="spotlight" />
    <div class="overflow-hidden">
      <h2 class="text-3xl font-semibold text-center">We are experts at</h2>
    </div>
    <div ref="cards" class="flex gap-6 flex-wrap justify-center items-stretch">
      <DsServiceCard
        v-for="service in services"
        :key="service.title"
        :title="service.title"
        :items="service.items"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { showText } from '~/utils/animations'

const { $gsap } = useNuxtApp()
const container = ref<HTMLElement | null>(null)
const cards = ref<HTMLElement | null>(null)

const services = [
  {
    title: 'Immersive Web Experiences',
    items: [
      '3D Models (web optimized)',
      'Shader-driven visuals',
      'Interactive 3D environments',
      'Digital twins',
      'VR-ready experiences',
    ],
  },
  {
    title: 'Creative UI/UX Development',
    items: [
      'Motion design',
      'Scroll-driven animations',
      'Micro-interaction polish',
      'Design systems',
      'Interactive prototypes',
    ],
  },
  {
    title: 'Fundamentals',
    items: [
      'Accessibility-first build',
      'AI visibility',
      'SEO',
      'User centric design',
      'Responsive design',
    ],
  },
]

onMounted(async () => {
  await nextTick()
  $gsap.registerPlugin(ScrollTrigger)

  const el = container.value
  const cardsEl = cards.value
  if (!el || !cardsEl) return

  const heading = el.querySelector<HTMLElement>('h2')
  if (!heading) return

  const cardItems = cardsEl.querySelectorAll<HTMLElement>('.card-wrapper')

  $gsap.set(heading, { yPercent: 200 })
  $gsap.set(cardItems, { opacity: 0, y: 40 })

  const master = $gsap.timeline()

  ScrollTrigger.create({
    trigger: el,
    start: 'top 50%',
    once: true,
    onEnter: () => {
      master
        .add(showText(heading))
        .to(
          cardItems,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'Power3.out',
            stagger: 0.15,
          },
          '-=0.4'
        )
    },
  })
})
</script>

<style scoped>
.spotlight {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 50%, #0070f320 0%, transparent 70%);
  pointer-events: none;
}
</style>
