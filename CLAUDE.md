# CLAUDE.md

## Commands

```bash
pnpm dev        # start dev server
pnpm build      # production build
pnpm preview    # preview production build
pnpm generate   # static site generation
```

Always use `pnpm` — never `npm` or `yarn`.

## Project

Texelation is a portfolio/services site for creative and immersive web development/design. Every detail matters — micro-interactions, transitions, and animations must be polished and smooth. VR support is planned for the future. The home page will eventually support multiple distinct visual experiences built on the same data.

Focus is on the main page (`app/pages/index.vue`) and its sections. The demos section is not in active use.

## Stack & Conventions

### General
- **TypeScript** by default — no plain `.js` files
- **Vue Composition API** always (`<script setup lang="ts">`)
- `<script setup>` goes **below** `<template>`, never above
- Prefer **VueUse** composables over raw browser APIs (e.g. `useWindowSize` over `window.innerWidth`, `useResizeObserver` over `new ResizeObserver`)
- **Nuxt folder structure**: folders lowercase, files camelCase (e.g. `homeHeroSection.vue`)

### Styling
- **Tailwind CSS v4** — prefer utility classes over custom CSS
- Config is CSS-based via `@theme` in `app/assets/css/main.css` (no `tailwind.config.ts`)
- Custom tokens: `--color-white: #f7f7f7`, `--color-black: #0d0d0d`
- Greyscale palette with opacity utilities (`text-white/70`, `bg-black/30`)
- **NuxtUI** for components unless a custom component is specified

### Animation
- **GSAP** for all animations and scroll-driven effects
- GSAP plugin (`app/plugins/gsap.client.ts`) registers ScrollTrigger and exposes `$gsap` via `useNuxtApp()`
- Always `import { ScrollTrigger } from 'gsap/ScrollTrigger'` in files that use it directly
- Call `$gsap.registerPlugin(ScrollTrigger)` in `onMounted` before any ScrollTrigger usage
- Initialize scroll animations after `await nextTick()` inside `onMounted`

### 3D / WebGL
- Use **TresJS** (`Tres*` components, auto-imported via `@tresjs/nuxt`) or plain **Three.js**
- GLSL shaders via `vite-plugin-glsl` — import `.glsl` files directly
- TresCanvas needs a parent with explicit pixel dimensions to avoid resize loops
- When layering HTML over TresCanvas, wrap TresCanvas in `<div style="z-index: 0">`

### SEO & Accessibility
- SEO is critical — use `useSeoMeta` / `useHead` on every page
- Accessibility (a11y) is required — semantic HTML, ARIA labels, keyboard navigation, sufficient contrast

## Architecture

### Pages & Components
- Main page: `app/pages/index.vue`
- Section components live in `app/components/home/` (e.g. `homeHeroSection.vue`, `homeAboutSection.vue`)
- Shared/reusable components in `app/components/`

### State
- `useState` (Nuxt built-in) for simple cross-component state
- Pinia (`@pinia/nuxt`) for complex stores — place in `app/stores/`
