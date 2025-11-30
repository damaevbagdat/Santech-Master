import { defineConfig } from 'vite';

export default defineConfig({
  preview: {
    allowedHosts: ['santech-master.com', 'www.santech-master.com', '194.32.142.237', '.santech-master.com'],
    host: true,
  },
});
