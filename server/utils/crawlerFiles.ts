// No per-bot rules: search engines and AI crawlers are all welcome
export const buildRobotsTxt = (siteUrl: string) =>
  ['User-agent: *', 'Allow: /', '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join('\n')

// No <lastmod>: a build date would claim changes that didn't happen
export const buildSitemapXml = (siteUrl: string) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${siteUrl}/</loc></url>`,
    '</urlset>',
    '',
  ].join('\n')
