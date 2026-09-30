import type { Config } from '@netlify/edge-functions'
import { shouldServeMarkdown } from './agentDetection.ts'

// Agents asking for the home page get its Markdown twin (prerendered /index.md);
// everyone else falls through to the HTML untouched.
export default async (request: Request) => {
  if (request.method !== 'GET') return
  if (!shouldServeMarkdown(request.headers.get('accept'), request.headers.get('user-agent'))) return

  const markdownResponse = await fetch(new URL('/index.md', request.url))
  // Missing Markdown should never break the page: fall back to the HTML
  if (!markdownResponse.ok) return

  return new Response(markdownResponse.body, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      // Same URL, different body per client: shared caches must key on both
      'vary': 'Accept, User-Agent',
    },
  })
}

export const config: Config = {
  path: '/',
}
