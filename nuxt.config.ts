// https://nuxt.com/docs/api/configuration/nuxt-config
import glsl from 'vite-plugin-glsl';

export default defineNuxtConfig({
  vite: {
    plugins: [glsl()],
  },
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    '@tresjs/nuxt',
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
})
