import { describe, expect, it } from 'vitest'
import { buildHomeStructuredData, serializeJsonLd } from '../../app/utils/homeStructuredData'
import { HOME_FAQ } from '../../shared/homeContent'

const SITE_URL = 'https://example.com'

type GraphNode = { '@type': string, [key: string]: unknown }

const findGraphNode = (type: string) =>
  (buildHomeStructuredData(SITE_URL)['@graph'] as GraphNode[]).find((node) => node['@type'] === type)

describe('buildHomeStructuredData', () => {
  it('describes the studio as an Organization at the home URL', () => {
    expect(findGraphNode('Organization')).toMatchObject({ name: 'N2Shader', url: `${SITE_URL}/` })
  })

  it('links the WebSite to its publisher', () => {
    expect(findGraphNode('WebSite')).toMatchObject({
      publisher: { '@id': `${SITE_URL}/#organization` },
    })
  })

  it('mirrors every FAQ entry as a Question with its accepted Answer', () => {
    expect(findGraphNode('FAQPage')?.mainEntity).toEqual(
      HOME_FAQ.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      }))
    )
  })
})

describe('serializeJsonLd', () => {
  it('escapes "<" so the JSON can never close its <script> tag', () => {
    const serialized = serializeJsonLd({ text: '</script><script>alert(1)</script>' })

    expect(serialized).not.toContain('<')
    expect(JSON.parse(serialized)).toEqual({ text: '</script><script>alert(1)</script>' })
  })
})
