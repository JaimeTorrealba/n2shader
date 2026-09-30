import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ContactSection from '~/components/home/ContactSection.vue'
import { HOME_FAQ } from '#shared/homeContent'

describe('ContactSection', () => {
  it('keeps every FAQ answer in the markup while the accordion is closed', async () => {
    const contact = await mountSuspended(ContactSection)
    const html = contact.html()

    HOME_FAQ.forEach(({ question, answer }) => {
      expect(contact.text()).toContain(question)
      // Apostrophes are HTML-escaped in the markup
      expect(html.replace(/&#39;|&apos;/g, "'")).toContain(answer)
    })
  })

  it('names the submit button by its visible text', async () => {
    const contact = await mountSuspended(ContactSection)
    const submitButton = contact.get('button[type="submit"]')

    expect(submitButton.attributes('aria-label')).toBeUndefined()
    expect(submitButton.text()).toBe('Send message')
  })
})
