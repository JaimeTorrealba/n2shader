# CLAUDE.md

Texelation — a small creative agency site (immersive web dev & design). The site *is* the portfolio: craft is the product. Single page for now: `app/pages/index.vue` + `app/components/home/`.

## Standards
- **Detail first.** Spacing, type, hover/focus states, loading and edge cases are never "later".
- **Motion must feel right.** GSAP only. Animate `transform`/`opacity`, never layout props. Pick easing intentionally (`power3.out`/`expo.out` for entrances, `power2.inOut` for moves, `none` only for scrub). No linear UI tweens, no jank — 60fps or it doesn't ship.
- **Respect `prefers-reduced-motion`** via `gsap.matchMedia()`.
- **Clean up**: wrap animations in `gsap.context()` and `revert()` on unmount.
- **a11y is required**: semantic HTML, keyboard nav, visible focus, ARIA only when needed, WCAG AA contrast.
- **SEO**: `useSeoMeta` / `useHead` on every page.

## Stack & conventions
- `pnpm` only. Nuxt 4, TypeScript, `<script setup lang="ts">` placed **below** `<template>`.
- Tailwind v4 (tokens in `app/assets/css/main.css` via `@theme`), utilities over custom CSS. NuxtUI for components.
- VueUse over raw browser APIs. `useState` for simple shared state, Pinia (`app/stores/`) for complex.
- GSAP via `useNuxtApp().$gsap`; import `ScrollTrigger` from `gsap/ScrollTrigger`, register it in `onMounted`, init after `await nextTick()`.
- 3D: TresJS or three.js, GLSL via `vite-plugin-glsl`. TresCanvas needs a parent with explicit pixel size.
- Run `/verify` at the end of a session.
