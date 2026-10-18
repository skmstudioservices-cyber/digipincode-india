// skm-ai-worker — generates unique village descriptions using Workers AI
// Runs on a cron schedule (every 6 hours), picks villages without descriptions,
// generates 2-3 unique sentences, and writes them back to D1.
//
// Free model: @cf/google/gemma-4-26b-a4b-it (10,000 neurons/day free)
// ~3,000 short generations per day on free tier

export interface Env {
  DB: D1Database;
  AI: Ai;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    await generateDescriptions(env, 50); // 50 per run, 4 runs/day = 200/day
    // Refresh the cached coverage counts ONCE per run (replaces per-GET full scans).
    ctx.waitUntil(refreshCoverageCounts(env));
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    // Manual trigger via HTTP — POST to run on demand
    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const count = body.count || 50;
      const result = await generateDescriptions(env, count);
      return Response.json(result);
    }

    // GET — show status. 18 Oct 2026: served from CACHED meta counts (1-row reads).
    // The old version ran COUNT(*) over the whole villages table (~384k rows) on
    // EVERY GET — hit ~25x/day = 6.5M rows read/day (44% of all D1 reads). The
    // scheduled run refreshes these counts once per run instead.
    let stats: any = {};
    try {
      const rows = await env.DB.prepare(
        "SELECT k, v FROM meta WHERE k IN ('ai_total','ai_with_desc')"
      ).all();
      const m: Record<string, string> = {};
      for (const r of (rows as any).results || []) m[(r as any).k] = (r as any).v;
      const total = parseInt(m['ai_total'] || '0', 10);
      const withDesc = parseInt(m['ai_with_desc'] || '0', 10);
      stats = { total, with_desc: withDesc, without_desc: Math.max(0, total - withDesc), cached: true };
    } catch (e) {
      stats = { cached: false, error: 'counts not ready' };
    }
    return Response.json(stats);
  },
};

// Compute coverage counts once and cache them in meta (avoids full-table scans on GET).
async function refreshCoverageCounts(env: Env) {
  try {
    const row: any = await env.DB.prepare(
      'SELECT COUNT(*) AS total, COUNT(ai_description) AS with_desc FROM villages'
    ).first();
    if (row) {
      await env.DB.prepare('INSERT OR REPLACE INTO meta(k,v) VALUES(?, ?)').bind('ai_total', String(row.total ?? 0)).run();
      await env.DB.prepare('INSERT OR REPLACE INTO meta(k,v) VALUES(?, ?)').bind('ai_with_desc', String(row.with_desc ?? 0)).run();
    }
  } catch (e) { /* counting must never break the run */ }
}

async function generateDescriptions(env: Env, count: number) {
  // Pick villages that don't have descriptions yet
  const { results: villages } = await env.DB.prepare(`
    SELECT v.id, v.name, v.pincode, v.population, v.households,
           s.name AS state_name, d.name AS district_name,
           sd.name AS subdistrict_name
    FROM villages v
    JOIN sub_districts sd ON sd.id = v.sub_district_id
    JOIN districts d ON d.id = sd.district_id
    JOIN states s ON s.id = d.state_id
    WHERE v.ai_description IS NULL
    LIMIT ?
  `).bind(count).all();

  let generated = 0;
  let errors = 0;

  for (const village of villages) {
    try {
      const prompt = buildPrompt(village);
      const aiResponse = await env.AI.run('@cf/google/gemma-4-26b-a4b-it', {
        prompt,
        max_tokens: 120,
        temperature: 0.7,
      });

      const description = (aiResponse.response || '').trim();

      if (description && description.length > 30) {
        await env.DB.prepare(`
          UPDATE villages SET ai_description = ? WHERE id = ?
        `).bind(description, village.id).run();
        generated++;
      }
    } catch (err) {
      errors++;
      console.error(`Failed for ${village.name}:`, err);
    }

    // Small delay to stay within rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  return { total: villages.length, generated, errors };
}

function buildPrompt(village: any): string {
  const parts = [
    `Write a factual 2-3 sentence description of ${village.name}`,
    `in ${village.subdistrict_name}, ${village.district_name} district, ${village.state_name}, India.`,
  ];
  if (village.pincode) parts.push(`The pincode is ${village.pincode}.`);
  if (village.population) parts.push(`Population is approximately ${village.population}.`);
  if (village.households) parts.push(`There are about ${village.households} households.`);

  parts.push('Mention its location, postal services, and local governance. Do not use placeholders or make up specific landmarks. Keep it under 60 words.');

  return parts.join(' ');
}
