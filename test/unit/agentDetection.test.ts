import { describe, expect, it } from 'vitest'
import {
  isAiAgentUserAgent,
  prefersMarkdown,
  shouldServeMarkdown,
} from '../../netlify/edge-functions/serve-markdown-to-agents/agentDetection'

const CHROME_ACCEPT =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
const CHROME_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
const GOOGLEBOT_USER_AGENT =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

describe('prefersMarkdown', () => {
  it.each([
    ['text/markdown', true],
    ['text/markdown, text/html;q=0.9', true],
    ['text/markdown;q=0.9, text/html;q=0.9', true],
    ['text/x-markdown', true],
    ['TEXT/MARKDOWN', true],
    [CHROME_ACCEPT, false],
    ['text/html, text/markdown;q=0.5', false],
    ['text/markdown;q=0', false],
    ['*/*', false],
    ['', false],
    [null, false],
  ])('%s → %s', (acceptHeader, expected) => {
    expect(prefersMarkdown(acceptHeader)).toBe(expected)
  })
})

describe('isAiAgentUserAgent', () => {
  it.each([
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    'Claude-User/1.0',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
  ])('recognises %s', (userAgent) => {
    expect(isAiAgentUserAgent(userAgent)).toBe(true)
  })

  it('leaves browsers and search engines on the HTML', () => {
    expect(isAiAgentUserAgent(CHROME_USER_AGENT)).toBe(false)
    expect(isAiAgentUserAgent(GOOGLEBOT_USER_AGENT)).toBe(false)
    expect(isAiAgentUserAgent(null)).toBe(false)
  })
})

describe('shouldServeMarkdown', () => {
  it('serves Markdown on either signal', () => {
    expect(shouldServeMarkdown('text/markdown', CHROME_USER_AGENT)).toBe(true)
    expect(shouldServeMarkdown(CHROME_ACCEPT, 'ClaudeBot/1.0')).toBe(true)
  })

  it('serves HTML to a normal browser visit', () => {
    expect(shouldServeMarkdown(CHROME_ACCEPT, CHROME_USER_AGENT)).toBe(false)
  })
})
