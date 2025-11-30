// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://santech-master.com',
  outDir: './dist',
  integrations: [sitemap()],
  vite: {
    preview: {
      allowedHosts: ['santech-master.com', 'www.santech-master.com', '194.32.142.237'],
    },
  },
});
