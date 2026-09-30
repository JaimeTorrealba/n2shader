import { afterEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import HeroSection from '~/components/home/HeroSection.vue'

// happy-dom's own window API, not part of the DOM typings
type HappyDomWindow = {
  happyDOM: { settings: { device: { prefersReducedMotion: string } } }
}

// happy-dom re-reads this on every matchMedia() evaluation, so gsap.matchMedia() picks it up on mount
const emulateReducedMotion = (preference: 'reduce' | 'no-preference') => {
  ;(window as unknown as HappyDomWindow).happyDOM.settings.device.prefersReducedMotion = preference
}

// The WebGPU scene can't run in happy-dom and isn't what these tests are about
const mountHeroSection = () =>
  mountSuspended(HeroSection, {
    global: { stubs: { HomeExperienceMetaballsCanvas: true } },
  })

afterEach(() => emulateReducedMotion('no-preference'))

describe('HeroSection', () => {
  it('renders the brand as the only h1, untouched with reduced motion', async () => {
    emulateReducedMotion('reduce')
    const hero = await mountHeroSection()
    const headings = hero.findAll('h1')

    expect(headings).toHaveLength(1)
    expect(headings[0]!.text()).toBe('N2Shader')
  })

  it('keeps N2Shader as the h1 accessible name while the intro splits it', async () => {
    emulateReducedMotion('no-preference')
    const hero = await mountHeroSection()

    expect(hero.get('h1').attributes('aria-label')?.trim()).toBe('N2Shader')
  })

  it('renders the lede as an h2 below the title', async () => {
    emulateReducedMotion('reduce')
    const hero = await mountHeroSection()

    expect(hero.find('h1 + h2').text()).toMatch(/^Lorem ipsum/)
  })

  it('lifts the pre-hydration guard once mounted', async () => {
    document.documentElement.classList.add('intro-pending')
    await mountHeroSection()

    expect(document.documentElement.classList.contains('intro-pending')).toBe(false)
  })
})
