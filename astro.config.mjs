// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://santech-master.com',
  output: 'server', // Server-side rendering для API endpoints
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [sitemap()],
});
