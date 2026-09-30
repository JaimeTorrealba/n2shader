import { describe, expect, it } from 'vitest'
import { buildHomeMarkdown, buildLlmsFullTxt, buildLlmsTxt } from '../../server/utils/homeMarkdown'
import { HOME_FAQ, HOME_SERVICES, HOME_SUMMARY, PROCESS_STEPS } from '../../shared/homeContent'

const SITE_URL = 'https://example.com'

describe('buildHomeMarkdown', () => {
  const markdown = buildHomeMarkdown(SITE_URL)

  it('opens with the brand as the only h1 and the summary as a quote', () => {
    expect(markdown.startsWith(`# N2Shader\n\n> ${HOME_SUMMARY}\n`)).toBe(true)
    expect(markdown.match(/^# /gm)).toHaveLength(1)
  })

  it('includes every service, process step and FAQ answer shown on the page', () => {
    HOME_SERVICES.forEach(({ title, items }) => {
      expect(markdown).toContain(`### ${title}`)
      items.forEach((item) => expect(markdown).toContain(`- ${item}`))
    })
    PROCESS_STEPS.forEach(({ description }) => expect(markdown).toContain(description))
    HOME_FAQ.forEach(({ question, answer }) => {
      expect(markdown).toContain(`### ${question}`)
      expect(markdown).toContain(answer)
    })
  })

  it('points to the contact form with an absolute URL', () => {
    expect(markdown).toContain(`${SITE_URL}/#contact`)
  })

  it('never leaks placeholder copy to agents', () => {
    expect(markdown.toLowerCase()).not.toContain('lorem ipsum')
  })
})

describe('buildLlmsTxt', () => {
  const llmsTxt = buildLlmsTxt(SITE_URL)

  it('follows the llms.txt shape: h1, summary quote, then link sections', () => {
    expect(llmsTxt.startsWith(`# N2Shader\n\n> ${HOME_SUMMARY}\n`)).toBe(true)
    expect(llmsTxt).toMatch(/^## Content$/m)
  })

  it('links the Markdown files with absolute URLs', () => {
    expect(llmsTxt).toContain(`(${SITE_URL}/index.md)`)
    expect(llmsTxt).toContain(`(${SITE_URL}/llms-full.txt)`)
  })
})

describe('buildLlmsFullTxt', () => {
  it('carries the whole home page (single-page site)', () => {
    expect(buildLlmsFullTxt(SITE_URL)).toBe(buildHomeMarkdown(SITE_URL))
  })
})
