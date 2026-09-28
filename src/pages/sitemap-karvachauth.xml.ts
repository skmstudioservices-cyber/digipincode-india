// Karva Chauth sitemap — /karva-chauth/ hub (single compact page)
export const prerender = false;

export async function GET({ request }) {
  const base = new URL(request.url).origin;
  const urls = [`${base}/karva-chauth/`];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
