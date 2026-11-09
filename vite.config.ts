import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Local dev middleware for /api/* routes so Phase 1/2/3 endpoints work in `npm run dev` without Netlify CLI
function localApiMiddleware(env: Record<string, string>): Plugin {
  return {
    name: 'local-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        // Always refresh server-side env vars from .env during local SSR function invocations
        const currentEnv = loadEnv('development', process.cwd(), '');
        for (const [k, v] of Object.entries(currentEnv)) {
          process.env[k] = v;
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        req.on('end', async () => {
          const rawBody = Buffer.concat(chunks).toString('utf-8');
          const pathName = req.url?.split('?')[0] ?? '';
          const urlObj = new URL(req.url ?? '/', 'http://localhost:5173');

          try {
            let modPath = '';
            if (pathName === '/api/results') modPath = '/netlify/functions/results.ts';
            else if (pathName === '/api/create-checkout-session') modPath = '/netlify/functions/create-checkout-session.ts';
            else if (pathName === '/api/stripe-webhook') modPath = '/netlify/functions/stripe-webhook.ts';
            else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Not found' }));
              return;
            }

            const mod = await server.ssrLoadModule(modPath);
            const queryStringParameters = Object.fromEntries(urlObj.searchParams.entries());
            const result = await mod.handler({
              httpMethod: req.method || 'GET',
              body: rawBody || null,
              headers: req.headers as Record<string, string>,
              queryStringParameters,
            });

            res.statusCode = result.statusCode || 200;
            if (result.headers) {
              for (const [k, v] of Object.entries(result.headers)) {
                res.setHeader(k, String(v));
              }
            }
            res.end(result.body || '');
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), localApiMiddleware(env)],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  };
});

