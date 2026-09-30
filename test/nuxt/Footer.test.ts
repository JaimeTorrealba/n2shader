import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Footer from '~/components/common/Footer.vue'

describe('Footer', () => {
  it('shows the copyright with the current year', async () => {
    const footer = await mountSuspended(Footer)

    expect(footer.text()).toContain(`© ${new Date().getFullYear()} N2Shader. All rights reserved.`)
  })
})
