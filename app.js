import Fastify from 'fastify';
import { readFile } from 'fs/promises';
import fastifyReplyFrom from '@fastify/reply-from';

// 初始化
const PORT = 23000;
const app = Fastify({ logger: true }).register(fastifyReplyFrom);
const html = await readFile("index.html", "utf8").catch(() => '<h1>Proxy Server</h1>');
const icon = await readFile("favicon.ico").catch(() => null);
const RULES = [
  { prefix: "/gh/", target: "https://gcore.jsdelivr.net/gh/", headers: { "x-test": "test" } },
  { prefix: "/proxy/", dynamic: true },
];

// 路由
app.get('/', (_, r) => r.type('text/html').send(html));
app.get('/favicon.ico', (_, r) => r.type('image/x-icon').send(icon).code(icon ? 200 : 404));
RULES.forEach(rule => 
  app.all(`${rule.prefix}*`, (req, reply) => {
    try {
      const path = req.url.slice(rule.prefix.length);
      const url = rule.dynamic ? new URL(path) : new URL(path, rule.target);
      reply.from(url.href, {
        rewriteRequestHeaders: () => ({ ...req.headers, ...rule.headers, host: url.host, referer: url.href })
      });
    } catch { reply.status(400).send() }
  })
);

// 启动
app.listen({ port: PORT });