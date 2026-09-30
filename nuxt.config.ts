// https://nuxt.com/docs/api/configuration/nuxt-config
import glsl from 'vite-plugin-glsl';

// Absolute site URL for canonical, sitemap, llms.txt and JSON-LD. Netlify sets URL
// (the primary domain) during builds; NUXT_PUBLIC_SITE_URL overrides it.
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || process.env.URL || 'http://localhost:3000').replace(/\/$/, '');

export default defineNuxtConfig({
  vite: {
    plugins: [glsl()],
  },
  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxt/eslint',
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: { siteUrl },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        // The hero text is hidden until these load (see HeroSection.vue): fetch them with the HTML
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/Sentient-Bold.woff2', crossorigin: 'anonymous' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/Sentient-Regular.woff2', crossorigin: 'anonymous' },
      ],
      script: [
        {
          // Runs before first paint: entrance animations hide their text while this class is on
          // (see HeroSection.vue), so the SSR copy doesn't flash. If hydration stalls, show it anyway.
          innerHTML:
            "document.documentElement.classList.add('intro-pending');setTimeout(()=>document.documentElement.classList.remove('intro-pending'),4000)",
        },
      ],
    },
  },
  routeRules: {
    // Markdown twin of the home page for agents: search engines should index the HTML instead
    '/index.md': {
      headers: {
        'content-type': 'text/markdown; charset=utf-8',
        'link': `<${siteUrl}/>; rel="canonical"`,
      },
    },
  },
  nitro: {
    prerender: {
      // Crawler and agent files: built once, served as static files
      routes: ['/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt', '/index.md'],
    },
  },
  typescript: {
    // test/nuxt is covered by the app tsconfig; plain unit tests and the Netlify edge function run outside Nuxt
    nodeTsConfig: { include: ['../test/unit/**/*', '../netlify/**/*'] },
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
})
