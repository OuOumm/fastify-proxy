import Fastify from 'fastify';
import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import fastifyReplyFrom from '@fastify/reply-from';

const [icon, html, config] = await Promise.all([
  readFile("favicon.ico").catch(() => null),
  readFile("index.html", "utf8").catch(() => '<h1>Proxy Server</h1>'),
  readFile("config.json", "utf8").then(JSON.parse).catch(() => { throw new Error('config.json error, please check.') }),
]);
const app = Fastify({
  logger: config.logger,
  https: config.ssl?.enabled ? { key: readFileSync(config.ssl?.key), cert: readFileSync(config.ssl?.cert) } : undefined
}).register(fastifyReplyFrom);

app.get('/', (_, r) => r.type('text/html').send(html.replaceAll('{{name}}', config.name)));
app.get('/favicon.ico', (_, r) => r.code(icon ? 200 : 404).type('image/x-icon').send(icon));
config.rules.forEach(rule =>
  app.all(`${rule.prefix}*`, (req, reply) => {
    try {
      const path = req.url.slice(rule.prefix.length), url = rule.isDynamic ? new URL(path) : new URL(path, rule.target);
      reply.from(url.href, { rewriteRequestHeaders: () => ({ host: url.host, referer: url.href, ...rule.headers }) });
    } catch { reply.code(503).type('text/html').send(html.replaceAll('{{name}}', '503 Origin Service Unavailable')); }
  })
);
app.all('*', (_, r) => r.code(404).type('text/html').send(html.replaceAll('{{name}}', '404 Not Found')));
app.listen({ port: config.port, host: '::' });