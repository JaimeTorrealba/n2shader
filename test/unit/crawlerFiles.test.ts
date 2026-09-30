import { describe, expect, it } from 'vitest'
import { buildRobotsTxt, buildSitemapXml } from '../../server/utils/crawlerFiles'

const SITE_URL = 'https://example.com'

describe('buildRobotsTxt', () => {
  it('allows every crawler and points to the sitemap', () => {
    const robotsTxt = buildRobotsTxt(SITE_URL)

    expect(robotsTxt).toContain('User-agent: *\nAllow: /')
    expect(robotsTxt).not.toMatch(/^Disallow/m)
    expect(robotsTxt).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`)
  })
})

describe('buildSitemapXml', () => {
  it('lists the home page with an absolute URL', () => {
    const sitemapXml = buildSitemapXml(SITE_URL)

    expect(sitemapXml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(sitemapXml).toContain(`<loc>${SITE_URL}/</loc>`)
  })
})
