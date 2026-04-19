# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # start dev server
pnpm build      # production build
pnpm generate   # static site generation
pnpm preview    # preview production build
```

Always use `pnpm` — never `npm` or `yarn`.

## Architecture

### Demo system

The core pattern of this project is a **demo viewer**. Each demo is:

1. A markdown file in `content/demos/<name>.md` — rendered in the right sidebar via `ContentRenderer`
2. A Vue component in `app/components/demos/<name>.vue` — loaded dynamically and rendered as the main canvas/view
3. The route `app/pages/demos/[...slug].vue` ties them together: it fetches the content by path, dynamically imports `components/demos/<stem>.vue`, and passes the content page to `useState("demo-page")` so the `demos` layout can render it in the sidebar

The `demos` layout (`app/layouts/demos.vue`) provides the split-panel shell: a collapsible right sidebar (Nuxt UI `USidebar`) showing the markdown content, and a main area rendering the demo component via `<slot>`.

When the sidebar opens/closes, `sidebarKey` (a global `useState`) is incremented after the CSS transition finishes (300ms delay). TresCanvas components must be keyed with `:key="sidebarKey"` to force a remount and recalculate their dimensions.

### 3D / WebGL (TresJS)

- TresJS is registered via `@tresjs/nuxt` — `Tres*` components are auto-imported
- `@tresjs/cientos` provides helpers like `useTextures`
- GLSL shader files (`.glsl`) are handled by `vite-plugin-glsl` (configured in `nuxt.config.ts`)
- TresCanvas must live inside a container with **explicit pixel dimensions** (not derived from its children) to avoid infinite resize loops. Use `h-screen`, `h-full` on a fixed-height parent, or similar
- When stacking HTML over a TresCanvas, use a wrapper `div` with `style="z-index: 0"` around TresCanvas rather than applying Tailwind z-index classes directly to `<TresCanvas>` — those don't reliably reach the internal canvas element

### Shader/image transition pattern

`app/components/image-transitions/hero.vue` is the reference implementation for the image-transition effect:
- Orthographic camera (`[-8, 8, 4.5, -4.5, -1, 10]`) + a `[16, 9]` plane fills the canvas in exact 16:9
- A `ShaderMaterial` with `texture1`, `texture2`, `progress`, `intensity`, `resolution` uniforms drives the transition
- `resize()` recalculates the `resolution` uniform (cover math) and must be called both after textures load and on window resize via `watch([width, height], ...)`
- `swapShader()` swaps `fragmentShader` at runtime and sets `material.needsUpdate = true`
- Shaders live in `app/components/image-transitions/shaders/`

### Content (Nuxt Content v3)

- Single collection `content` sourcing `**` (all files under `content/`)
- MDC syntax: use `::component-name\n::` blocks to embed Vue components in markdown
- Component names in MDC map to the auto-import convention: `app/components/image-transitions/tweakpane.vue` → `::image-transitions-tweakpane`

### State management

- `useState` (Nuxt built-in) is used for simple cross-component state like `sidebarKey` and `demo-page`
- Pinia (`@pinia/nuxt`) is installed for more complex stores; place stores in `app/stores/`

### Styling

- Tailwind CSS v4
- `@nuxt/ui` provides the component library (buttons, sidebar, etc.)
- All UI uses greyscale palette with white/opacity utilities (`text-white/70`, `bg-black/30`, etc.)
