import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server', // SSR + selective prerender (hybrid)
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  site: 'https://digipincode.india-in.workers.dev',
});
