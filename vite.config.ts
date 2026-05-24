import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { runAssistantChat } from './server/assistantHandler';

function galaxyAssistantApiPlugin(env: Record<string, string>): Plugin {
  Object.assign(process.env, env);

  return {
    name: 'galaxy-assistant-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/assistant')) {
          next();
          return;
        }

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => {
          void (async () => {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString()) as {
                messages?: { role: 'user' | 'assistant'; content: string }[];
                context?: { userName?: string; userRole?: string; currentPath?: string };
              };
              const result = await runAssistantChat(body.messages ?? [], {
                userName: body.context?.userName,
                userRole: body.context?.userRole as 'admin' | 'doctor' | 'patient' | 'guest' | undefined,
                currentPath: body.context?.currentPath,
              });
              res.setHeader('Content-Type', 'application/json');
              if (result.error) {
                res.statusCode = result.error.includes('not configured') ? 503 : 502;
                res.end(JSON.stringify({ error: result.error }));
              } else {
                res.statusCode = 200;
                res.end(JSON.stringify({ reply: result.reply }));
              }
            } catch {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Galaxy AI could not respond. Please try again.' }));
            }
          })();
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), galaxyAssistantApiPlugin(env)],
  };
});
