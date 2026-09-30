import { BRAND_NAME, HOME_SUMMARY, HOME_TITLE } from '#shared/homeContent'

// Home page meta, canonical URL, the Markdown alternate for agents, and JSON-LD.
// siteUrl is Netlify's URL at build time (see nuxt.config.ts).
export const useHomeSeo = () => {
  const { siteUrl } = useRuntimeConfig().public
  const homeUrl = `${siteUrl}/`

  // og:image still needs a 1200×630 image in /public (twitterCard can then be summary_large_image)
  useSeoMeta({
    title: HOME_TITLE,
    description: HOME_SUMMARY,
    ogTitle: HOME_TITLE,
    ogDescription: HOME_SUMMARY,
    ogType: 'website',
    ogSiteName: BRAND_NAME,
    ogUrl: homeUrl,
    twitterCard: 'summary',
    twitterTitle: HOME_TITLE,
    twitterDescription: HOME_SUMMARY,
    themeColor: '#0d0d0d',
  })

  useHead({
    link: [
      { rel: 'canonical', href: homeUrl },
      // Same content as Markdown; agents requesting / get it directly (netlify/edge-functions)
      { rel: 'alternate', type: 'text/markdown', href: '/index.md' },
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: serializeJsonLd(buildHomeStructuredData(siteUrl)),
      },
    ],
  })
}
