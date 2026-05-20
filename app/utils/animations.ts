import { gsap } from 'gsap'

export const showText = (elem: HTMLElement): gsap.core.Timeline => {
  return gsap.timeline().to(elem, {
    yPercent: 0,
    ease: 'Power3.out',
    duration: 0.75,
  })
}
