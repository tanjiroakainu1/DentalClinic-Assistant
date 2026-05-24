import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { galaxyAssistantApiPlugin } from './lib/assistant/vitePlugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), galaxyAssistantApiPlugin(env)],
    server: {
      proxy: {},
    },
  };
});
