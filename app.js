import Fastify from 'fastify';
import { readFile } from 'fs/promises';
import { readFileSync } from 'fs';
import fastifyReplyFrom from '@fastify/reply-from';

const config = JSON.parse(await readFile("config.json", "utf8").catch(() => { throw new Error('配置文件不存在，请创建后再启动') }));
const app = Fastify({ 
  logger: true, 
  https: config.ssl?.enabled ? { key: readFileSync(config.ssl.key), cert: readFileSync(config.ssl.cert) } : undefined
}).register(fastifyReplyFrom);

const html = await readFile("index.html", "utf8").catch(() => '<h1>Proxy Server</h1>');
const icon = await readFile("favicon.ico").catch(() => null);
app.get('/', (_, r) => r.type('text/html').send(html));
app.get('/favicon.ico', (_, r) => r.type('image/x-icon').send(icon).code(icon ? 200 : 404));
config.rules.forEach(rule =>
  app.all(`${rule.prefix}*`, (req, reply) => {
    try {
      const path = req.url.slice(rule.prefix.length);
      const url = rule.isDynamic ? new URL(path) : new URL(path, rule.target);
      reply.from(url.href, {
        rewriteRequestHeaders: () => ({ ...req.headers, host: url.host, referer: url.origin, ...rule.headers })
      });
    } catch { reply.status(503).type('text/html').send(html.replaceAll('404 Server', `503 Server ${rule.target} Unavailable`)); }
  })
);
app.all('*', (_, reply) => reply.status(404).type('text/html').send(html.replaceAll('404 Server', '404 Not Found')));

// 启动
app.listen({ port: config.ssl?.enabled ? config.ssl.port : config.port, host: '::' });