import Fastify from 'fastify';
import { readFile } from 'fs/promises';
import { readFileSync } from 'fs';
import fastifyReplyFrom from '@fastify/reply-from';

const [icon, html, config] = await Promise.all([
  readFile("favicon.ico").catch(() => null),
  readFile("index.html", "utf8").catch(() => '<h1>Proxy Server</h1>'),
  readFile("config.json", "utf8").then(JSON.parse).catch(() => { throw new Error('配置文件不存在,请创建后再启动') })
]);
const app = Fastify({
  logger: config.logger,
  https: config.ssl?.enabled ? { key: readFileSync(config.ssl.key), cert: readFileSync(config.ssl.cert) } : undefined
}).register(fastifyReplyFrom);

app.get('/', (_, r) => r.type('text/html').send(html));
app.get('/favicon.ico', (_, r) => r.code(icon ? 200 : 404).type('image/x-icon').send(icon));
config.rules.forEach(rule =>
  app.all(`${rule.prefix}*`, (req, r) => {
    try {
      const path = req.url.slice(rule.prefix.length);
      const url = rule.isDynamic ? new URL(path) : new URL(path, rule.target);
      r.from(url.href, {
        rewriteRequestHeaders: () => ({ ...req.headers, host: url.host, referer: url.href, ...rule.headers })
      });
    } catch { r.code(503).type('text/html').send(html.replaceAll('404 Server', '503 Service Unavailable')); }
  })
);
app.all('*', (_, r) => r.code(404).type('text/html').send(html.replaceAll('404 Server', '404 Not Found')));
app.listen({ port: config.ssl?.enabled ? config.ssl.port : config.port, host: '::' });