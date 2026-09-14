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
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    // Manual trigger via HTTP — POST to run on demand
    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const count = body.count || 50;
      const result = await generateDescriptions(env, count);
      return Response.json(result);
    }

    // GET — show status
    const stats = await env.DB.prepare(`
      SELECT
        COUNT(*) AS total,
        COUNT(ai_description) AS with_desc,
        COUNT(*) - COUNT(ai_description) AS without_desc
      FROM villages
    `).first();

    return Response.json(stats);
  },
};

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
