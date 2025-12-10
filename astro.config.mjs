// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://santech-master.com',
  output: 'static', // Static site generation для shared hosting
  integrations: [sitemap()],
});
