// Relative import (not #shared): unit tests load this file outside Nuxt
import { BRAND_NAME, HOME_FAQ, HOME_SERVICES, HOME_SUMMARY, PROCESS_STEPS } from '../../shared/homeContent'

const buildServicesMarkdown = () =>
  HOME_SERVICES.map(({ title, items }) => [`### ${title}`, '', ...items.map((item) => `- ${item}`)].join('\n')).join(
    '\n\n'
  )

const buildProcessMarkdown = () =>
  PROCESS_STEPS.map(({ label, title, description }, index) => `${index + 1}. **${label} — ${title}.** ${description}`).join(
    '\n'
  )

const buildFaqMarkdown = () => HOME_FAQ.map(({ question, answer }) => `### ${question}\n\n${answer}`).join('\n\n')

// The home page as Markdown: /index.md, and what agents get on / (netlify/edge-functions)
export const buildHomeMarkdown = (siteUrl: string) =>
  [
    `# ${BRAND_NAME}`,
    '',
    `> ${HOME_SUMMARY}`,
    '',
    '## Services',
    '',
    buildServicesMarkdown(),
    '',
    '## How it works',
    '',
    buildProcessMarkdown(),
    '',
    '## FAQ',
    '',
    buildFaqMarkdown(),
    '',
    '## Contact',
    '',
    `Send a project idea through the contact form: ${siteUrl}/#contact`,
    '',
  ].join('\n')

// llms.txt (https://llmstxt.org): a short map of the site for language models
export const buildLlmsTxt = (siteUrl: string) =>
  [
    `# ${BRAND_NAME}`,
    '',
    `> ${HOME_SUMMARY}`,
    '',
    'The site is a single page. Its content (services, how a project works, FAQ) is available as Markdown:',
    '',
    '## Content',
    '',
    `- [Home page](${siteUrl}/index.md): services, how a project works, and FAQ`,
    `- [Full content](${siteUrl}/llms-full.txt): everything on the site in one Markdown file`,
    '',
    '## Optional',
    '',
    `- [Interactive site](${siteUrl}/): the HTML version, with a WebGPU hero`,
    '',
  ].join('\n')

// Single-page site: the full content is the home page
export const buildLlmsFullTxt = (siteUrl: string) => buildHomeMarkdown(siteUrl)
