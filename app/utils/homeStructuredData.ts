// Relative import (not #shared): unit tests load this file outside Nuxt
import { BRAND_NAME, HOME_FAQ, HOME_SERVICES, HOME_SUMMARY } from '../../shared/homeContent'

// schema.org graph for the home page: who we are, the site, and the FAQ as Q&A.
// Answer engines read this to describe the studio and quote the answers.
export const buildHomeStructuredData = (siteUrl: string) => {
  const homeUrl = `${siteUrl}/`
  const organizationId = `${homeUrl}#organization`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: BRAND_NAME,
        url: homeUrl,
        description: HOME_SUMMARY,
        knowsAbout: HOME_SERVICES.flatMap(({ title, items }) => [title, ...items]),
      },
      {
        '@type': 'WebSite',
        '@id': `${homeUrl}#website`,
        url: homeUrl,
        name: BRAND_NAME,
        description: HOME_SUMMARY,
        inLanguage: 'en',
        publisher: { '@id': organizationId },
      },
      {
        '@type': 'FAQPage',
        '@id': `${homeUrl}#faq`,
        mainEntity: HOME_FAQ.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  }
}

// JSON inside a <script> must never contain "</script>": escape every "<"
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')
