// Prerendered at build (nuxt.config.ts), served as a static file. Its canonical
// header (routeRules) points search engines back at the HTML home page.
export default defineEventHandler((event) => {
  setResponseHeader(event, 'content-type', 'text/markdown; charset=utf-8')
  return buildHomeMarkdown(useRuntimeConfig(event).public.siteUrl)
})
