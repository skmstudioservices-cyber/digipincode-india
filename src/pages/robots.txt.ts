// robots.txt — allow Google, block AI crawlers
export const prerender = false;

const BLOCKED = [
  'GPTBot',
  'ClaudeBot',
  'CCBot',
  'PerplexityBot',
  'Amazonbot',
  'Bytespider',
  'cohere-ai',
  'Diffbot',
  'FacebookBot',
  'Google-Extended',
  'meta-externalagent',
  'OAI-SearchBot',
  'omgili',
  'PetalBot',
  'Scrapy',
  'SemrushBot',
  'YandexBot',
];

export async function GET() {
  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    'User-agent: Googlebot',
    'Allow: /',
    '',
    ...BLOCKED.map(ua => `User-agent: ${ua}\nDisallow: /`),
    '',
    'Sitemap: https://digipincode.workers.dev/sitemap-index.xml',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain' },
  });
}