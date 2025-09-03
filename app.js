import Fastify from 'fastify';
import { readFile } from 'fs/promises';
import fastifyReplyFrom from '@fastify/reply-from';

// 初始化
const PORT = 23000;
const app = Fastify({
  logger: { level: 'info' },
  http: { keepAlive: true, timeout: 10000 },
  disableContentLengthCheck: true,
}).register(fastifyReplyFrom);
const html = await readFile("index.html", "utf8").catch(() => '<h1>Proxy Server</h1>');
const icon = await readFile("favicon.ico").catch(() => null);
const RULES = [
  { prefix: "/gh/", target: "https://gcore.jsdelivr.net/gh/" },
  { prefix: "/i/", target: "https://pan.warhut.cn/p/img/", headers: { "x-post-server": "serv02" } },
  { prefix: "/findshell.php", target: "https://www.warhut.cn/findshell.php", headers: { "x-post-server": "serv02" } },
  { prefix: "/imgur/", target: "https://i.imgur.com/", headers: { "referer": "https://imgur.com/" } },
  { prefix: "/proxy/", isDynamic: true },
];

// 路由
app.get('/', (_, r) => r.type('text/html').send(html));
app.get('/favicon.ico', (_, r) => r.type('image/x-icon').send(icon).code(icon ? 200 : 404));
RULES.forEach(rule =>
  app.all(`${rule.prefix}*`, (req, reply) => {
    try {
      const path = req.url.slice(rule.prefix.length);
      const url = rule.isDynamic ? new URL(path) : new URL(path, rule.target);
      reply.from(url.href, {
        rewriteRequestHeaders: () => ({ ...req.headers, host: url.host, referer: url.origin, ...rule.headers })
      });
    } catch { reply.status(400).send('Bad Request') }
  })
);

// 启动
app.listen({ port: PORT, host: '0.0.0.0' });