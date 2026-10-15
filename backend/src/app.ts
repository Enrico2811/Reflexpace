import Fastify from 'fastify';

/** Monta a API sem iniciar o servidor, para facilitar testes com `app.inject()`. */
export function buildApp() {
  const app = Fastify({ logger: true });

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}
