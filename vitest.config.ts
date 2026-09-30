import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      // Plain TypeScript (utils, physics): no Nuxt boot, fast
      {
        test: {
          name: 'unit',
          include: ['test/unit/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      // Components: full Nuxt runtime (auto-imports, plugins) on happy-dom
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          setupFiles: ['./test/nuxt/happyDomPolyfills.ts'],
          environment: 'nuxt',
          // Booting Nuxt UI in happy-dom takes ~13s cold, past Vitest's 10s default
          hookTimeout: 120_000,
        },
      }),
    ],
  },
})
