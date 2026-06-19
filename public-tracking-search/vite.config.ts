import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

import { createTrackSearchMiddleware } from './server/trackSearchHandler';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  process.env.OPENTRACK_API_KEY = env.OPENTRACK_API_KEY;
  process.env.OPENTRACK_API_URL = env.OPENTRACK_API_URL;
  process.env.SUPPORT_CONTACT_MESSAGE = env.SUPPORT_CONTACT_MESSAGE;
  process.env.DEMO_MODE = env.DEMO_MODE;

  return {
    plugins: [
      react(),
      {
        name: 'opentrack-track-search-api',
        configureServer(server) {
          server.middlewares.use(createTrackSearchMiddleware());
        },
      },
    ],
    server: {
      port: 5173,
    },
  };
});
